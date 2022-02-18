const { ImapFlow } = require('imapflow')
const pino = require('pino')
require('dotenv').config()
const mongoose = require('mongoose')

const { parseEmail } = require('./email-parser')
const logger = require('./utils/logger')
const { createS3Client, shutdownS3Client } = require('./utils/awsS3')

//Constants
const MONGODB_URI = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : process.env.TEST_MONGODB_URI
// Helsinki time is UTC+3
const CAMERA_TIMEZONE = 3
const LOG_TAG = 'email-parser:'
const MAX_RETRY_ATTEMPTS = 100
const INBOX_MAILBOX = 'INBOX'

let DEFAULT_IMAP_OPTIONS

if (process.env.NODE_ENV === 'development') {
  DEFAULT_IMAP_OPTIONS = {
    host: process.env.DEV_IMAP_HOST,
    port: 993,
    secure: true,
    auth: {
      user: process.env.DEV_IMAP_USER,
      pass: process.env.DEV_IMAP_PASSWORD
    },
    logger: pino({
      prettyPrint: {
        singleLine: true,
        ignore: 'pid,hostname,time',
        messageFormat: '{src} - {msg} - {error}'
      },
      level: 'debug'
    })
  }
} else {
  DEFAULT_IMAP_OPTIONS = {
    host: process.env.IMAP_HOST,
    port: 993,
    secure: true,
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASSWORD
    },
    logger: pino({ level: 'silent' })
  }
}

//Variables
let stopAtAttempts = MAX_RETRY_ATTEMPTS
let incomingMailbox = INBOX_MAILBOX
let retryAttempts = 0
let isImapConnected = false
let retry = true
let client
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
  logger.info(LOG_TAG, 'onClose')
  isImapConnected = false
  if (retry) {
    logger.info(LOG_TAG, 'imap connection closed. Retrying...')
    if (!client.usable) {
      logger.info(LOG_TAG, 'imap client not usable. Creating new one...')
      client = createNewImapClient()
    }

    if (retryAttempts < stopAtAttempts) {
      setTimeout(async () => {
        const resultImap = await connectImapClientAndSelectMailbox()
        if (resultImap) {
          logger.info(LOG_TAG, 'imap client reconnected: all good')
        } else {
          logger.info(LOG_TAG, 'imap reconnection failed, trying again...')
        }
      }, retryAttempts * 500)
    } else {
      await disconnect()
      logger.error('Too many attempts to connect to email server.')
    }
  } else {
    logger.info(LOG_TAG, 'imap connection closed without retries.')
  }
}

const onExists = async data => {
  logger.info(LOG_TAG, 'email received!')
  const emailCount = data.count
  const emailPrevCount = data.prevCount

  for (let emailId = emailPrevCount+1; emailId <= emailCount; emailId++) {
    try {
      const downloadedEmail = await client.download(emailId, null)

      await parseEmail(downloadedEmail.content, CAMERA_TIMEZONE)
    } catch (error) {
      logger.error(LOG_TAG, `error while parsing email ${emailId - emailPrevCount} of ${emailCount - emailPrevCount}`, error.message)
    }
  }
}

const start = async (imapTestOptions, testRetryAttempts, testMailbox) => {
  retryAttempts = 0
  retry = true

  if (imapTestOptions !== undefined) {
    imapOptions = imapTestOptions
  }

  if (testRetryAttempts !== undefined && testRetryAttempts < MAX_RETRY_ATTEMPTS) {
    stopAtAttempts = testRetryAttempts
  }

  if (testMailbox !== undefined) {
    incomingMailbox = testMailbox
  }

  client = createNewImapClient()

  createS3Client()

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
    return false
  }

  try {
    // Select and lock a mailbox. Throws if mailbox does not exist
    await client.getMailboxLock(incomingMailbox)
    return true
  } catch (error) {
    logger.error(LOG_TAG, 'error when getting the inbox:', error.message)
    await disconnect()
    return false
  }
}

const disconnect = async () => {
  retry = false
  //Disconnect database connection
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

  shutdownS3Client()
}

const getClient = () => client

// 1 = connected
// 2 = disconnected but retrying
// 3 = disconnected and not retrying
const getClientStatus = () => {
  if (isImapConnected) {
    return 1
  } else {
    if(retry) {
      return 2
    } else {
      return 3
    }
  }
}

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    logger.info(LOG_TAG, 'connected to DB server')
    return true
  } catch(error) {
    logger.error(LOG_TAG, 'error connecting to MongoDB', error.message)
    return false
  }
}

module.exports = { start, disconnect, getClient, getClientStatus }