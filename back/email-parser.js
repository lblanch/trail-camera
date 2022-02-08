const simpleParser = require('mailparser').simpleParser
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

const { upsertRecording } = require('./services/recordings')
const { sendFileToS3 } = require('./utils/awsS3')
const logger = require('./utils/logger')

const LOG_TAG = 'email-parser:'

const getVideoInfo = (videoFilename, ffmpegCommand) => {
  return new Promise((resolve, reject) => {
    return ffmpegCommand.input(videoFilename)
      .ffprobe((error, videoInfo) => {
        if (error) {
          return reject(error)
        }

        return resolve({ duration: Math.floor(videoInfo.format.duration), width: videoInfo.streams[0].width })
      })
  })
}

const generateGifThumbnail = (videoFilename, fpsValue, outputFilename, ffmpegCommand) => {
  return new Promise((resolve, reject) => {
    return ffmpegCommand.input('/tmp/' + videoFilename)
      .noAudio()
      .format('gif')
      .videoFilters('fps=1/' + fpsValue, 'scale=445:-1' ,'settb=1/2', 'setpts=N')
      .outputOptions('-r 2')
      .on('error', (err) => {
        logger.info(LOG_TAG, 'ffmpeg: Cannot process image: ' + err.message)
        return reject(err)
      })
      .on('end', () => {
        logger.info(LOG_TAG, 'ffmpeg: Transcoding succeeded !')
        return resolve('/tmp/processed_' + outputFilename)
      })
      .output('/tmp/processed_' + outputFilename)
      .run()
  })
}

const resizeImage = (imageFilename, outputFilename, ffmpegCommand) => {
  return new Promise((resolve, reject) => {
    return ffmpegCommand.input('/tmp/' + imageFilename)
      .noAudio()
      .format('jpg')
      .videoFilters('scale=445:-1' )
      .on('error', (err) => {
        logger.info(LOG_TAG, 'ffmpeg: Cannot process video: ' + err.message)
        return reject(err)
      })
      .on('end', () => {
        logger.info(LOG_TAG, 'ffmpeg: Transcoding succeeded !')
        return resolve('/tmp/processed_' + outputFilename)
      })
      .output('/tmp/processed_' + outputFilename)
      .run()
  })
}

const parseEmail = async (downloadedEmailContent, timezoneHours) => {
  const parsedEmail = await simpleParser(downloadedEmailContent)

  if (parsedEmail.attachments.length < 1) {
    throw new Error('email doesn\'t have attachments' )
  }

  const mediaTypeSplit = parsedEmail.attachments[0].contentType.split('/')
  if (mediaTypeSplit[0] !== 'image' && mediaTypeSplit[0] !== 'video') {
    throw new Error('email attachments are neither images nor videos' )
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
      const mediaDateUTC = new Date(Date.UTC(`20${dateSplit[2]}`, dateSplit[1]-1, dateSplit[0], timeSplit[0], timeSplit[1], timeSplit[2]))
      // Subtract the timezone hours difference to obtain UTC+0 time.
      mediaDateUTC.setUTCHours(mediaDateUTC.getUTCHours() - timezoneHours)
      newCameraInput.mediaDate = new Date(mediaDateUTC.toISOString())
    } else {
      logger.info(LOG_TAG, 'email body does not have date/time, using email delivery date')
      newCameraInput.mediaDate = newCameraInput.emailDeliveryDate
    }
  } else {
    logger.info(LOG_TAG, 'email body does not have any text, using email delivery date')
    newCameraInput.mediaDate = newCameraInput.emailDeliveryDate
    newCameraInput.emailBody = {}
  }

  // Save attachment file to disk
  await fs.promises.writeFile('/tmp/' + parsedEmail.attachments[0].filename, parsedEmail.attachments[0].content)
  logger.info(LOG_TAG, 'media saved to /tmp/ at disk')

  const devFolder = process.env.NODE_ENV === 'development' ? 'dev/' : ''
  const mediaPath = path.parse(parsedEmail.attachments[0].filename)
  const fileKeyWithoutExtension = `${devFolder}${newCameraInput.mediaDate.getTime()}_${mediaPath.name}`
  const metadata = { mediaDate: newCameraInput.mediaDate.toISOString() }

  const mediaUrl = await sendFileToS3('/tmp/' + parsedEmail.attachments[0].filename, fileKeyWithoutExtension + mediaPath.ext, metadata)
  newCameraInput.mediaURL = mediaUrl
  newCameraInput.mediaType = parsedEmail.attachments[0].contentType
  logger.info(LOG_TAG, 'media uploaded to S3')

  // Instantiate ffmpeg command
  const ffmpegCommand = new ffmpeg()

  const { duration, width } = await getVideoInfo('/tmp/' + parsedEmail.attachments[0].filename, ffmpegCommand)

  if (mediaTypeSplit[0] === 'image') {
    if (width > 445) {
      const processedImageFile = await resizeImage(parsedEmail.attachments[0].filename, mediaPath.name + '.jpg', ffmpegCommand)

      const mediaThumbnailURL = await sendFileToS3(processedImageFile, fileKeyWithoutExtension + '.jpg', metadata)
      newCameraInput.mediaThumbnailURL = mediaThumbnailURL
      logger.info(LOG_TAG, 'resized jpg uploaded to S3')
    } else {
      // Use same image as thumbnail
      newCameraInput.mediaThumbnailURL = mediaUrl
    }
  } else if (mediaTypeSplit[0] === 'video') {
    const fpsValue = duration/5
    const processedVideoFile = await generateGifThumbnail(parsedEmail.attachments[0].filename, fpsValue, mediaPath.name + '.gif', ffmpegCommand)

    const mediaThumbnailURL = await sendFileToS3(processedVideoFile, fileKeyWithoutExtension + '.gif', metadata)
    newCameraInput.mediaThumbnailURL = mediaThumbnailURL
    logger.info(LOG_TAG, 'gif uploaded to S3')
  }

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