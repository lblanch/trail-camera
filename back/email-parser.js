const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { ImapFlow } = require('imapflow')
const simpleParser = require('mailparser').simpleParser
const pino = require('pino')
require('dotenv').config()
const mongoose = require('mongoose')

const { upsertRecording } = require('./services/recordings')
const logger = require('./utils/logger')

//Constants
const MONGODB_URI = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : process.env.TEST_MONGODB_URI
const MONGODB_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
const LOG_TAG = 'email-parser:'
const MAX_RETRY_ATTEMPTS = 100
const PINO_SILENT = { level: 'silent' }
const PINO_DEV = {
  prettyPrint: {
    singleLine: true,
    ignore: 'pid,hostname,time',
    messageFormat: '{src} - {msg} - {error}'
  },
  level: 'debug'
}
const PINO_OPTIONS = process.env.NODE_ENV === 'development' ? PINO_DEV : PINO_SILENT
const DEFAULT_IMAP_OPTIONS = {
  host: process.env.IMAP_HOST,
  port: 993,
  secure: true,
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASSWORD
  },
  logger: pino(PINO_OPTIONS)
}

//Variables
let retryAttempts = 0
let isImapConnected = false
let retry = true
let client
let s3Client
let imapOptions = DEFAULT_IMAP_OPTIONS

const createNewImapClient = () => {
  let newClient = new ImapFlow(imapOptions)
  newClient.on('close', onClose)
  newClient.on('error', onError)
  newClient.on('exists', onExists)
  isImapConnected = false
  return newClient
}

const onError = error => logger.error(LOG_TAG, 'onError!', error.message)

const onClose = async () => {
  isImapConnected = false
  if (retry) {
    logger.info(LOG_TAG, 'imap connection closed. Retrying...')
    if (!client.usable) {
      logger.info(LOG_TAG, 'imap client not usable. Creating new one...')
      client = createNewImapClient()
    }
    const resultImap = await connectImapClientAndSelectMailbox()
    if (resultImap) {
      logger.info(LOG_TAG, 'imap client reconnected: all good')
    } else {
      logger.info(LOG_TAG, 'imap reconnection failed, trying again...')
    }
  } else {
    logger.info(LOG_TAG, 'connection closed.')
  }
}

const onExists = async data => {
  logger.info(LOG_TAG, 'email received!')
  const emailCount = data.count
  const emailPrevCount = data.prevCount

  for (let emailId = emailPrevCount+1; emailId <= emailCount; emailId++) {
    try {
      await parseEmail(emailId)
    } catch (error) {
      logger.error(LOG_TAG, `error while parsing email ${emailId - emailPrevCount} of ${emailCount - emailPrevCount}`, error.message)
    }
  }
}

const start = async (imapTestOptions) => {
  retryAttempts = 0
  retry = true

  if(imapTestOptions !== undefined) {
    imapOptions = imapTestOptions
  }

  client = createNewImapClient()

  s3Client = new S3Client({ region: process.env.AWS_REGION })

  const resultMongo = await connectMongoDB()
  if  (resultMongo) {
    const resultImap = await connectImapClientAndSelectMailbox()
    if (resultImap) {
      logger.info(LOG_TAG, 'imap client connected: all good')
    } else {
      logger.info(LOG_TAG, 'imap connection failed')
    }
  } else {
    logger.info(LOG_TAG, 'MongoDB connection failed')
  }

  return client
}

const connectImapClientAndSelectMailbox = async () => {
  retryAttempts++
  logger.info(LOG_TAG, 'Attempt number' , retryAttempts, 'Trying to connect to email server.')
  try {
    await client.connect()
    logger.info(LOG_TAG, 'connected to email server')
    isImapConnected = true
    retryAttempts = 0
  } catch (error) {
    logger.error(LOG_TAG, 'error connecting to email server', error.message)
    if (retryAttempts < MAX_RETRY_ATTEMPTS) {
      setTimeout(connectImapClientAndSelectMailbox, retryAttempts * 1000)
    } else {
      await disconnect()
      throw new Error('Too many attempts to connect to email server.')
    }
    return false
  }

  try {
    // Select and lock a mailbox. Throws if mailbox does not exist
    await client.getMailboxLock('INBOX')
    return true
  } catch (error) {
    logger.error(LOG_TAG, 'error when getting the inbox', error.message)
    await disconnect()
    return false
  }
}

const disconnect = async () => {
  retry = false
  //Disconnect dabatase connection
  logger.info(LOG_TAG, 'mongoose ready state', mongoose.connection.readyState)
  //1 = connected
  if(mongoose.connection.readyState === 1) {
    await mongoose.disconnect()
    logger.info(LOG_TAG, 'Mongoose disconnected')
  }

  //Logout client
  logger.info(LOG_TAG, 'client usable', client.usable, 'Connected', isImapConnected)
  if (isImapConnected && client.usable) {
    isImapConnected = false
    await client.logout()
    logger.info(LOG_TAG, 'client logged out')
  }

  //Shutdown S3 connection
  if(s3Client) {
    s3Client.destroy()
  }
}

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS)
    logger.info(LOG_TAG, 'connected to DB server')
    return true
  } catch(error) {
    logger.error(LOG_TAG, 'error connecting to MongoDB', error.message)
    return false
  }
}

const parseEmail = async (emailId) => {
  const downloadedEmail = await client.download(emailId, null)

  const parsedEmail = await simpleParser(downloadedEmail.content)

  if (parsedEmail.attachments.length < 1) {
    throw new Error('email doesn\'t have attachments' )
  }

  let newCameraInput = {}

  if(parsedEmail.headers.has('date')) {
    newCameraInput.emailDeliveryDate = new Date(parsedEmail.headers.get('date'))
  } else if(parsedEmail.headers.has('delivery-date')) {
    newCameraInput.emailDeliveryDate = new Date(parsedEmail.headers.get('delivery-date'))
  } else {
    newCameraInput.emailDeliveryDate = new Date()
  }

  newCameraInput.sentTo = parsedEmail.headers.get('to').text
  newCameraInput.sentFrom = parsedEmail.headers.get('from').text
  newCameraInput.subject = parsedEmail.subject

  if (parsedEmail.text) {
    const emailInfoJson = parseEmailText(parsedEmail.text)

    newCameraInput.emailBody = emailInfoJson
    if (emailInfoJson.date && emailInfoJson.time) {
      const dateSplit = emailInfoJson.date.split('.')
      const timeSplit = emailInfoJson.time.split(':')
      newCameraInput.mediaDate = new Date(`20${dateSplit[2]}`, dateSplit[1]-1, dateSplit[0], timeSplit[0], timeSplit[1], timeSplit[2])
    } else {
      logger.info(LOG_TAG, 'email body does not have date/time, using email delivery date')
      newCameraInput.mediaDate = newCameraInput.emailDeliveryDate
    }
  } else {
    logger.info(LOG_TAG, 'email body does not have any text, using email delivery date')
    newCameraInput.mediaDate = newCameraInput.emailDeliveryDate
  }

  const fileKey = `${newCameraInput.mediaDate.getTime()}_${parsedEmail.attachments[0].filename}`
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileKey,
    Metadata: { mediaDate: newCameraInput.mediaDate.toISOString() },
    Body: parsedEmail.attachments[0].content
  }

  // Upload file to specified bucket.
  await s3Client.send(new PutObjectCommand(uploadParams))
  logger.info(LOG_TAG, 'attachment uploaded to S3')

  newCameraInput.mediaType = parsedEmail.attachments[0].contentType
  const mediaUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`
  newCameraInput.mediaThumbnailURL = mediaUrl
  newCameraInput.mediaURL = mediaUrl

  //Upsert to mongoDB
  await upsertRecording(newCameraInput)
  logger.info(LOG_TAG, 'recording inserted to DB')
}

const parseEmailText = (emailText) => {
  const emailInfo = emailText.split('\n').reduce((accumulator, currentValue) => {
    let workingAccumulator = accumulator
    const splitLine = currentValue.split(': ')

    if (splitLine.length === 2 && splitLine[1] !== '') {
      workingAccumulator[splitLine[0].replace(/ /g, '-').toLowerCase()] = splitLine[1]
      return workingAccumulator
    }
    return accumulator
  }, { })

  return emailInfo
}

module.exports = { start, disconnect }