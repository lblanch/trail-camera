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

  test('without attachment, doesn\'t create a new recording in DB and doesn\'t try to store it to S3', async () => {
    await expect(parseEmail(helper.rawMessageWithoutAttachments))
      .rejects.toThrow('email doesn\'t have attachments')

    expect(mockedAwsS3.sendFileToS3).not.toHaveBeenCalled()
    expect(mockedRecordings.upsertRecording).not.toHaveBeenCalled()
  })

  describe('with attachment', () => {
    beforeEach(() => {
      mockedAwsS3.sendFileToS3.mockReturnValue(helper.upsertEmailWithAttachments.mediaURL)
    })

    test('full attachment, it parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
      await parseEmail(helper.rawMessageWithAttachment.full)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalledWith(helper.upsertEmailWithAttachments)
    })

    test('missing date header, it uses delivery-date as date, parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
      await parseEmail(helper.rawMessageWithAttachment.deliveryDate)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(helper.upsertEmailWithAttachments.emailDeliveryDate.getUTCDate()+1)
    })

    test('missing date or delivery-date header, it uses current date, parses the email, stores attachment to S3 and creates a new recording in DB', async () => {
      await parseEmail(helper.rawMessageWithAttachment.noHeaderDate)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      const todayDate = new Date()
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(todayDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCMonth()).toEqual(todayDate.getUTCMonth())
      expect(generatedUpsert.emailDeliveryDate.getUTCFullYear()).toEqual(todayDate.getUTCFullYear())
    })

    test('missing date/delivery-date header and email body date, it uses current date for both emailDeliveryDate and mediaDate, stores attachment to S3 and creates a new recording in DB', async () => {
      await parseEmail(helper.rawMessageWithAttachment.noHeaderDateNoTextDateTime)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      const todayDate = new Date()
      expect(generatedUpsert.emailDeliveryDate.getUTCDate()).toEqual(todayDate.getUTCDate())
      expect(generatedUpsert.emailDeliveryDate.getUTCMonth()).toEqual(todayDate.getUTCMonth())
      expect(generatedUpsert.emailDeliveryDate.getUTCFullYear()).toEqual(todayDate.getUTCFullYear())
      expect(generatedUpsert.mediaDate.getUTCDate()).toEqual(todayDate.getUTCDate())
      expect(generatedUpsert.mediaDate.getUTCMonth()).toEqual(todayDate.getUTCMonth())
      expect(generatedUpsert.mediaDate.getUTCFullYear()).toEqual(todayDate.getUTCFullYear())
    })

    test('with empty email body, doesn\'t include emailBody field, uses date/delivery-date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      await parseEmail(helper.rawMessageWithAttachment.emptyText)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate).toEqual(generatedUpsert.emailDeliveryDate)
      expect(generatedUpsert.emailBody).toBeUndefined()
    })

    test('email body without date/time, uses date/delivery-date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      await parseEmail(helper.rawMessageWithAttachment.noTextDateTime)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate).toEqual(generatedUpsert.emailDeliveryDate)
    })

    test('email body with only date, uses date/delivery-date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      await parseEmail(helper.rawMessageWithAttachment.noTextTime)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate).toEqual(generatedUpsert.emailDeliveryDate)
    })

    test('email body with only time, uses date/delivery-date for media date, stores attachment to S3 and creates a new recording in DB', async () => {
      await parseEmail(helper.rawMessageWithAttachment.noTextDate)

      expect(mockedAwsS3.sendFileToS3).toHaveBeenCalled()
      expect(mockedRecordings.upsertRecording).toHaveBeenCalled()

      const generatedUpsert = mockedRecordings.upsertRecording.mock.calls[0][0]
      expect(generatedUpsert.mediaDate).toEqual(generatedUpsert.emailDeliveryDate)
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