//TODO: recheck error handling
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { ImapFlow } = require('imapflow')
const simpleParser = require('mailparser').simpleParser
const pino = require('pino')()
require('dotenv').config()
const mongoose = require('mongoose')

const { upsertRecording } = require('./services/recordings')
const logger = require('./utils/logger')

const LOG_TAG = 'email-parser: '

//avoid ImapFlow log messages in test env
//pino.level = 'silent'

const client = new ImapFlow({
  host: process.env.IMAP_HOST,
  port: 993,
  secure: true,
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASSWORD
  },
  logger: pino
})

// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: process.env.AWS_REGION })

let lock
const dbUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }

const run = async () => {
  try {
    // Wait until client connects and authorizes
    await client.connect()
    logger.info(LOG_TAG, 'connected to email server')
  } catch (error) {
    //TODO: retry
    return logger.error(LOG_TAG, 'error connecting to email server', error.message)
  }

  try {
    await mongoose.connect(dbUri, dbOptions)
    logger.info(LOG_TAG, 'connected to DB server')
  } catch(error) {
    //TODO: retry
    logger.error(LOG_TAG, 'error connecting to MongoDB', error.message)
    return await client.logout()
  }

  try {
    // Select and lock a mailbox. Throws if mailbox does not exist
    lock = await client.getMailboxLock('INBOX')
  } catch (error) {
    //TODO: retry
    logger.error(LOG_TAG, 'error when getting the inbox', error.message)
    lock.release()
    await client.logout()
    mongoose.connection.close()
  }
}

client.on('exists', async data => {
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
})

client.on('close', () => {
  //TODO: reconnect
  lock.release()
  logger.info(LOG_TAG, 'email-parser: connection closed')
})

//TODO: probably below can be deleted
/*mongoose.connection.on('error', err => {
  logger.error(LOG_TAG, 'error with mongoDB connection', err.message)
})*/

/*const connectMongoDB = async (reconnect = false) => {
  if (reconnect && attemptsConnectDB >= RETRY_ATTEMPTS) {
    throw new Error('Reached maximum amount of attempts to re-connect to MongoDB.')
  } else {
    if (reconnect) {
      attemptsConnectDB++
    }
    try {
      await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    } catch (error) {
      await connectMongoDB(true)
    }
  }
}*/

const parseEmail = async (emailId) => {
  const downloadedEmail = await client.download(emailId, null)

  const parsedEmail = await simpleParser(downloadedEmail.content)

  if (parsedEmail.attachments.length < 1) {
    throw new Error('email doesn\'t have attachments' )
  }

  let newCameraInput = {}

  newCameraInput.emailDeliveryDate = new Date(parsedEmail.headers.get('delivery-date'))
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
      logger.info(LOG_TAG, 'email-parser: email body does not have date/time, using email delivery date')
      newCameraInput.mediaDate = newCameraInput.emailDeliveryDate
    }
  } else {
    logger.info(LOG_TAG, 'email-parser: email body does not have any text, using email delivery date')
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
  //TODO: retry?
  await s3Client.send(new PutObjectCommand(uploadParams))

  newCameraInput.mediaType = parsedEmail.attachments[0].contentType
  const mediaUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`
  newCameraInput.mediaThumbnailURL = mediaUrl
  newCameraInput.mediaURL = mediaUrl

  //Upsert to mongoDB
  //TODO: retry?
  await upsertRecording(newCameraInput)
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

run().catch(err => logger.error(LOG_TAG, 'error on run!', err))