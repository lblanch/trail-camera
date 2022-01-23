jest.mock('../../utils/awsS3')
jest.mock('../../services/recordings')
const mockedAwsS3 = require('../../utils/awsS3')
const mockedRecordings = require('../../services/recordings')
const { parseEmail, parseEmailText } = require('../../email-parser')

const CAMERA_TIMEZONE = 3

describe('Extracting data in received emails', () => {
  beforeEach(() => {
    mockedAwsS3.sendFileToS3.mockReset()
    mockedRecordings.upsertRecording.mockReset()
  })

  test('without attachment, doesn\'t create a new recording in DB and doesn\'t try to store it to S3', async () => {
    const rawMessageWithoutAttachments = 'From: sender name <sender@example.com>\r\n' +
      'To: Receiver name <receiver@example.com>\r\n' +
      'Subject: test without attachments\r\n' +
      'Message-Id: <abcde>\r\n' +
      'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n' +
      '\r\n' +
      'No attachments here!'

    await expect(parseEmail(rawMessageWithoutAttachments, CAMERA_TIMEZONE))
      .rejects.toThrow('email doesn\'t have attachments')

    expect(mockedAwsS3.sendFileToS3).not.toHaveBeenCalled()
    expect(mockedRecordings.upsertRecording).not.toHaveBeenCalled()
  })

  describe('from email headers and email body text', () => {
    const mediaType = 'image/png'
    const mediaUrl = 'https://someMediaUrl.com/myPic.jpg'
    const senderEmail = 'sender name <sender@example.com>'
    const receiverEmail = 'Receiver name <receiver@example.com>'
    const subject = 'test subject for tests'
    const messageId = '<abcde>'
    const emailDate = new Date('21 Jul 2021 18:18:11 +0300')
    const emailDeliveryDate = new Date('22 Jul 2021 18:18:11 +0300')
    const mediaDate = new Date('2021-02-05T17:42:44.000Z')
    const bodyDate = '05.02.21'
    const bodyTime = '20:42:44'
    const contentHeader = 'Content-Type: multipart/mixed; boundary="00000000000060862005c7a3ae32"\r\n' +
      '\r\n' +
      '--00000000000060862005c7a3ae32\r\n' +
      'Content-Type: text/plain; charset="UTF-8"\r\n' +
      '\r\n'
    const contentFooter = '--00000000000060862005c7a3ae32\r\n' +
      'Content-Type: image/png; name="16x16.png"\r\n' +
      'Content-Disposition: attachment; filename="16x16.png"\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      'Content-ID: <f_krdmr74v0>\r\n' +
      'X-Attachment-Id: f_krdmr74v0\r\n' +
      '\r\n' +
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAV5JREFUOBGl\r\n' +
      '078rhVEcx/HDRd2SH4siAwalRDL5kYVY7EzyJ1iUhcVEGe0XKUoZJMNNXYRFWQySwUY2GaRwvT/H\r\n' +
      '+T6dni7d8q3Xc875Pt9znnOf81zn/hkVf8zv5940MqHmg3YTN2Hsm8owGKYt4AwTaMUWdP85yNJu\r\n' +
      'owVJaAcq2kEH3lCHF+SxjDhWGQxgA0840gLr6MM9FMo9YBHV6MInbvGFFbShHddwRYyok4oxxhc4\r\n' +
      'xyVOMAQLzdFcfxm0bGg11o6mUI8GzOIOvVCoJlkgXlk/YQ9zSMcSiVxIak7RTiHkfFPFtRMHcTL0\r\n' +
      'leuO86UW0At7hY4yHcrphJIotYDe9D50CrVJpXON9BewG+WctqvwL+On66862h7oWzhEBpO4Qg4K\r\n' +
      'P8cW0FcWhz6oGYxDx6VdzaMACz9Hb3wNo3i0O6HVE96hGosaOjZupn9sAz2lyarKbPUfOS2z9vey\r\n' +
      'b92QQAx6tjXwAAAAAElFTkSuQmCC\r\n' +
      '--00000000000060862005c7a3ae32--\r\n'

    beforeEach(() => {
      mockedAwsS3.sendFileToS3.mockReturnValue(mediaUrl)
    })

    test('missing from header, doesn\'t create a new recording in DB and doesn\'t try to store it to S3', async () => {
      const rawMessage = `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      `Delivery-date: ${emailDeliveryDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Date: ${bodyDate}\r\n` +
      `Time: ${bodyTime}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await expect(parseEmail(rawMessage, CAMERA_TIMEZONE))
        .rejects.toThrow()

      expect(mockedAwsS3.sendFileToS3).not.toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).not.toHaveBeenCalled()
    })

    test('missing to header, doesn\'t create a new recording in DB and doesn\'t try to store it to S3', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      `Delivery-date: ${emailDeliveryDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Date: ${bodyDate}\r\n` +
      `Time: ${bodyTime}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await expect(parseEmail(rawMessage, CAMERA_TIMEZONE))
        .rejects.toThrow()

      expect(mockedAwsS3.sendFileToS3).not.toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).not.toHaveBeenCalled()
    })

    test('email not properly formatted, doesn\'t create a new recording in DB and doesn\'t try to store it to S3', async () => {
      const rawMessage = 'random string not including any headers or email standard fields'

      await expect(parseEmail(rawMessage, CAMERA_TIMEZONE))
        .rejects.toThrow('email doesn\'t have attachments')

      expect(mockedAwsS3.sendFileToS3).not.toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).not.toHaveBeenCalled()
    })

    test('missing subject header, it parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      `Delivery-date: ${emailDeliveryDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Date: ${bodyDate}\r\n` +
      `Time: ${bodyTime}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(mediaDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toBeUndefined()
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toEqual(bodyDate)
      expect(generatedUpsert.emailBody.time).toEqual(bodyTime)
    })

    test('no missing data, it parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      `Delivery-date: ${emailDeliveryDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Date: ${bodyDate}\r\n` +
      `Time: ${bodyTime}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(mediaDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toEqual(bodyDate)
      expect(generatedUpsert.emailBody.time).toEqual(bodyTime)
    })

    test('missing delivery-date header, it uses date as date, parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Date: ${bodyDate}\r\n` +
      `Time: ${bodyTime}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(mediaDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toEqual(bodyDate)
      expect(generatedUpsert.emailBody.time).toEqual(bodyTime)
    })

    test('missing date header, it uses delivery-date as date, parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Delivery-date: ${emailDeliveryDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Date: ${bodyDate}\r\n` +
      `Time: ${bodyTime}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(mediaDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDeliveryDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toEqual(bodyDate)
      expect(generatedUpsert.emailBody.time).toEqual(bodyTime)
    })

    test('missing date and delivery-date header, it uses current date, parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Date: ${bodyDate}\r\n` +
      `Time: ${bodyTime}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const todayDate = new Date()
      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(mediaDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(todayDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCMonth()).toEqual(todayDate.getUTCMonth())
      expect(generatedUpsert.emailDeliveryDate.getUTCFullYear()).toEqual(todayDate.getUTCFullYear())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toEqual(bodyDate)
      expect(generatedUpsert.emailBody.time).toEqual(bodyTime)
    })

    test('missing date/delivery-date header and email body date, it uses current date for both emailDeliveryDate and mediaDate, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const todayDate = new Date()
      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(todayDate.getUTCDate())
      expect(generatedUpsert.mediaDate.getUTCMonth()).toEqual(todayDate.getUTCMonth())
      expect(generatedUpsert.mediaDate.getUTCFullYear()).toEqual(todayDate.getUTCFullYear())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(todayDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCMonth()).toEqual(todayDate.getUTCMonth())
      expect(generatedUpsert.emailDeliveryDate.getUTCFullYear()).toEqual(todayDate.getUTCFullYear())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toBeUndefined()
      expect(generatedUpsert.emailBody.time).toBeUndefined()
    })

    test('with empty email body, emailBody field is returned as an empty object, uses date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Delivery-date: ${emailDeliveryDate}\r\n` +
      `Date: ${emailDate}\r\n` +
      contentHeader +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody).toEqual({})
    })

    test('with empty email body without delivery-date header, emailBody field is returned as an empty object, uses date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      contentHeader +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody).toEqual({})
    })

    test('with empty email body without header date, emailBody field is returned as an empty object, uses delivery-date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Delivery-date: ${emailDeliveryDate}\r\n` +
      contentHeader +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(emailDeliveryDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDeliveryDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody).toEqual({})
    })

    test('email body without date/time, uses date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toBeUndefined()
      expect(generatedUpsert.emailBody.time).toBeUndefined()
    })

    test('email body with only date, uses date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Date: ${bodyDate}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toEqual(bodyDate)
      expect(generatedUpsert.emailBody.time).toBeUndefined()
    })

    test('email body with only time, uses date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      const rawMessage = `From: ${senderEmail}\r\n` +
      `To: ${receiverEmail}\r\n` +
      `Subject: ${subject}\r\n` +
      `Message-Id: ${messageId}\r\n` +
      `Date: ${emailDate}\r\n` +
      contentHeader +
      'Photo: [10/Unlimited]\r\n' +
      `Time: ${bodyTime}\r\n` +
      'Temperature: 23 degree Celsius(C)\r\n' +
      'Battery: 80%\r\n' +
      'Signal: Good\r\n' +
      'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
      'P\r\n' +
      '\r\n' +
      contentFooter

      await parseEmail(rawMessage, CAMERA_TIMEZONE)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(emailDate.getUTCDate())
      expect(generatedUpsert.sentTo).toEqual(receiverEmail)
      expect(generatedUpsert.sentFrom).toEqual(senderEmail)
      expect(generatedUpsert.subject).toEqual(subject)
      expect(generatedUpsert.mediaType).toEqual(mediaType)
      expect(generatedUpsert.mediaThumbnailURL).toEqual(mediaUrl)
      expect(generatedUpsert.mediaURL).toEqual(mediaUrl)
      expect(generatedUpsert.emailBody.date).toBeUndefined()
      expect(generatedUpsert.emailBody.time).toEqual(bodyTime)
    })
  })
})

describe('Parsing email body text', () => {
  test('empty email body returns empty JSON', () => {
    const result = parseEmailText('')
    expect(result).toEqual({})
  })

  test('lines of text not following key:value format are ignored', () => {
    const emailText = 'key: value\n' +
    'key2:value\n' +
    'key3 value\n' +
    ': value\n' +
    ' : value\n' +
    'key4\n' +
    '\n' +
    'key5: value'

    const result = parseEmailText(emailText)

    expect(Object.keys(result)).toHaveLength(3)
    expect(result).toHaveProperty('key')
    expect(result).toHaveProperty('key2')
    expect(result).toHaveProperty('key5')
    expect(result).not.toHaveProperty('key3')
    expect(result).not.toHaveProperty('key4')
  })

  test('Repeated keys are kept with a running number appended at the end', () => {
    const emailText = 'key:value\n' +
    'key:value1\n' +
    'key:value2\n'

    const expectedResult = {
      key: 'value',
      key1: 'value1',
      key2: 'value2'
    }

    const result = parseEmailText(emailText)

    expect(result).toEqual(expectedResult)
  })

  test('keys with spaces are trimmed or if in the middle, substituted with -', () => {
    const emailText = 'key     :value\n' +
    '     key2:value1\n' +
    'key has some spaces :value2\n' +
    '    key    has    spaces      everywhere    :value3\n'

    const expectedResult = {
      key: 'value',
      key2: 'value1',
      'key-has-some-spaces': 'value2',
      'key----has----spaces------everywhere': 'value3'
    }

    const result = parseEmailText(emailText)

    expect(result).toEqual(expectedResult)
  })

  test('only first : is used to determine key:value, rest are ignored', () => {
    const emailText = 'key:value:with:many:of:these\n' +
    'key1:this : are: not ::: keys\n' +
    'key2::::::::\n'

    const expectedResult = {
      key: 'value:with:many:of:these',
      key1: 'this : are: not ::: keys',
      key2: ':::::::'
    }

    const result = parseEmailText(emailText)

    expect(result).toEqual(expectedResult)
  })
})