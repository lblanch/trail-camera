//TODO: remove personal info from test emails!!
//TODO: test email parser text function
jest.mock('../../utils/awsS3')
jest.mock('../../services/recordings')
const mockedAwsS3 = require('../../utils/awsS3')
const mockedRecordings = require('../../services/recordings')
const { parseEmail } = require('../../utils/email-parser')

const rawMessageWithoutAttachments = 'From: sender name <sender@example.com>\r\n' +
  'To: Receiver name <receiver@example.com>\r\n' +
  'Subject: hello 4\r\n' +
  'Message-Id: <abcde>\r\n' +
  'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n' +
  '\r\n' +
  'World 4!'

const rawMessageWithAttachments = 'From: sender name <sender@example.com>\r\n' +
  'To: Receiver name <receiver@example.com>\r\n' +
  'Date: Wed, 21 Jul 2021 18:18:11 +0300\r\n' +
  'Message-ID: <abcde>\r\n' +
  'Subject: test with small image\r\n' +
  'Content-Type: multipart/mixed; boundary="00000000000060862005c7a3ae32"\r\n' +
  '\r\n' +
  '--00000000000060862005c7a3ae32\r\n' +
  'Content-Type: text/plain; charset="UTF-8"\r\n' +
  '\r\n' +
  'Photo: [10/Unlimited]\r\n' +
  'Date: 05.02.21\r\n' +
  'Time: 20:42:44\r\n' +
  'Temperature: 23 degree Celsius(C)\r\n' +
  'Battery: 80%\r\n' +
  'Signal: Good\r\n' +
  'SD card free space: 14.42 GB of 14.91 GB(96.71%)\r\n' +
  'P\r\n' +
  '\r\n' +
  '--00000000000060862005c7a3ae32\r\n' +
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

const upsertEmailWithAttachments = {
  emailDeliveryDate: new Date('2021-07-21T15:18:11.000Z'),
  sentTo: 'receiver@example.com',
  sentFrom: 'sender name <sender@example.com>',
  subject: 'test with small image',
  emailBody: {
    photo: '[10/Unlimited]',
    date: '05.02.21',
    time: '20:42:44',
    temperature: '23 degree Celsius(C)',
    battery: '80%',
    signal: 'Good',
    'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
  },
  mediaDate: new Date('2021-02-05T18:42:44.000Z'),
  mediaType: 'image/png',
  mediaThumbnailURL: 'https://someMediaUrl.com/myPic.jpg',
  mediaURL: 'https://someMediaUrl.com/myPic.jpg'
}

test('When email has attachment, parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
  mockedAwsS3.sendFileToS3.mockReturnValue(upsertEmailWithAttachments.mediaURL)
  await parseEmail(rawMessageWithAttachments)

  expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
  expect(mockedRecordings.upsertRecording).toHaveBeenCalled()
  expect(mockedRecordings.upsertRecording).toHaveBeenCalledWith(upsertEmailWithAttachments)
})

//TODO: add try/catch to parseEmail
test('without attachment, doesn\'t create a new recording in DB and doesn\'t try to store it to S3', async () => {
  await parseEmail(rawMessageWithoutAttachments)
  expect(mockedAwsS3.sendFileToS3).not.toHaveBeenCalled()
  expect(mockedRecordings.upsertRecording).not.toHaveBeenCalled()
})
