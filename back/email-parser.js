const simpleParser = require('mailparser').simpleParser

const { upsertRecording } = require('./services/recordings')
const { sendFileToS3 } = require('./utils/awsS3')
const logger = require('./utils/logger')

const LOG_TAG = 'email-parser:'

const parseEmail = async (downloadedEmailContent) => {
  const parsedEmail = await simpleParser(downloadedEmailContent)

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
      newCameraInput.mediaDate = new Date(Date.UTC(`20${dateSplit[2]}`, dateSplit[1]-1, dateSplit[0], timeSplit[0], timeSplit[1], timeSplit[2]))
    } else {
      logger.info(LOG_TAG, 'email body does not have date/time, using email delivery date')
      newCameraInput.mediaDate = newCameraInput.emailDeliveryDate
    }
  } else {
    logger.info(LOG_TAG, 'email body does not have any text, using email delivery date')
    newCameraInput.mediaDate = newCameraInput.emailDeliveryDate
  }

  const fileKey = `${newCameraInput.mediaDate.getTime()}_${parsedEmail.attachments[0].filename}`
  const metadata = { mediaDate: newCameraInput.mediaDate.toISOString() }
  const mediaUrl = await sendFileToS3(parsedEmail.attachments[0].content, fileKey, metadata)
  logger.info(LOG_TAG, 'picture uploaded to S3')

  newCameraInput.mediaType = parsedEmail.attachments[0].contentType
  newCameraInput.mediaThumbnailURL = mediaUrl
  newCameraInput.mediaURL = mediaUrl

  //Upsert to mongoDB
  await upsertRecording(newCameraInput)
  logger.info(LOG_TAG, 'recording inserted to DB')
}

const parseEmailText = (emailText) => {
  const keys = new Array()
  let runningNumber

  const emailInfo = emailText.split('\n').reduce((accumulator, currentValue) => {
    let workingAccumulator = accumulator

    const delimiterIndex = currentValue.indexOf(':')
    let key = currentValue.substring(0, delimiterIndex).trim()
    const value = currentValue.substring(delimiterIndex + 1).trim()

    if (key !== '' && value !== '') {
      key = key.replace(/ /g, '-').toLowerCase()
      if (keys[key]) {
        runningNumber = keys[key]
        keys[key] = runningNumber + 1
        key = key.concat(runningNumber)
      } else {
        keys[key] = 1
      }
      workingAccumulator[key] = value
      return workingAccumulator
    }
    return accumulator
  }, { })

  return emailInfo
}

module.exports = { parseEmail, parseEmailText }