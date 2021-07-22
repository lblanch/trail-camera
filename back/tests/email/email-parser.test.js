jest.mock('../../utils/awsS3')
jest.mock('../../services/recordings')
const mockedAwsS3 = require('../../utils/awsS3')
const mockedRecordings = require('../../services/recordings')
const helper = require('../helpers/email_helper')
const { parseEmail, parseEmailText } = require('../../email-parser')

describe('Parsing whole email contents', () => {
  beforeEach(() => {
    mockedAwsS3.sendFileToS3.mockReset()
    mockedRecordings.upsertRecording.mockReset()
  })

  test('when email has attachment, parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
    mockedAwsS3.sendFileToS3.mockReturnValue(helper.upsertEmailWithAttachments.mediaURL)
    await parseEmail(helper.rawMessageWithAttachments)

    expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
    expect(mockedRecordings.upsertRecording).toHaveBeenCalled()
    expect(mockedRecordings.upsertRecording).toHaveBeenCalledWith(helper.upsertEmailWithAttachments)
  })

  test('without attachment, doesn\'t create a new recording in DB and doesn\'t try to store it to S3', async () => {
    await expect(parseEmail(helper.rawMessageWithoutAttachments))
      .rejects.toThrow('email doesn\'t have attachments')

    expect(mockedAwsS3.sendFileToS3).not.toHaveBeenCalled()
    expect(mockedRecordings.upsertRecording).not.toHaveBeenCalled()
  })
  //TODO: test with email not having date or delivery-date header
  //TODO: test with empty email body
  //TODO: test with email body that doesn't have date/time in it
  //TODO: test with email body with only date
  //TODO: test with email body with only time
  //TODO: check proper parsing of fields: to, from, date/delivery-date, subject, mediatype
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

  //TODO: test when several lines have same keys
  //TODO: test when keys have spaces
})