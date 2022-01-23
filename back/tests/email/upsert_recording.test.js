const mongoose = require('mongoose')
require('dotenv').config()

const { upsertRecording } = require('../../services/recordings')
const Recording = require('../../models/recording')
const { initialRecordings, reloadRecordings, clearRecordings } = require('../helpers/recordings_helper')

let upsertEmailWithAttachments
let expectedUpsertResult
let recordingAmountCount

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI)
})

beforeEach(async () => {
  await clearRecordings()
  await reloadRecordings()
  recordingAmountCount = await Recording.estimatedDocumentCount()
})

afterAll(async () => {
  await mongoose.disconnect()
})

const commonUpsertDifferentRecordingsTests = (recordingType) => {
  beforeAll(() => {
    upsertEmailWithAttachments = {
      mediaDate: new Date('2021-02-05T17:42:44.000Z'),
      emailDeliveryDate: new Date('2021-07-21T15:18:11.000Z'),
      sentTo: 'Receiver name <receiver@example.com>',
      sentFrom: 'sender name <sender@example.com>',
      mediaType: 'image/png',
      mediaThumbnailURL: 'https://someMediaUrl.com/myPic.jpg',
      mediaURL: 'https://someMediaUrl.com/myPic.jpg'
    }

    if (recordingType === 'missing subject') {
      upsertEmailWithAttachments.emailBody = {
        photo: '[10/Unlimited]',
        date: '05.02.21',
        time: '20:42:44',
        temperature: '23 degree Celsius(C)',
        battery: '80%',
        signal: 'Good',
        'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
      }
      upsertEmailWithAttachments.tags=[{ tag: 'tagged', color: 'red.400' }]
      expectedUpsertResult = { ...upsertEmailWithAttachments, subject: '' }
    } else if (recordingType === 'undefined subject') {
      upsertEmailWithAttachments.emailBody = {
        photo: '[10/Unlimited]',
        date: '05.02.21',
        time: '20:42:44',
        temperature: '23 degree Celsius(C)',
        battery: '80%',
        signal: 'Good',
        'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
      }
      upsertEmailWithAttachments.subject = undefined
      upsertEmailWithAttachments.tags=[{ tag: 'tagged', color: 'red.400' }]
      expectedUpsertResult = { ...upsertEmailWithAttachments, subject: '' }
    } else if(recordingType === 'empty email body') {
      upsertEmailWithAttachments.emailBody = {}
      upsertEmailWithAttachments.subject = 'test with small image'
      upsertEmailWithAttachments.tags=[{ tag: 'tagged', color: 'red.400' }]
      expectedUpsertResult = { ...upsertEmailWithAttachments }
    } else if (recordingType === 'all fields') {
      upsertEmailWithAttachments.emailBody = {
        photo: '[10/Unlimited]',
        date: '05.02.21',
        time: '20:42:44',
        temperature: '23 degree Celsius(C)',
        battery: '80%',
        signal: 'Good',
        'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
      }
      upsertEmailWithAttachments.subject = 'test with small image'
      upsertEmailWithAttachments.tags=[{ tag: 'tagged', color: 'red.400' }]
      expectedUpsertResult = { ...upsertEmailWithAttachments }
    } else if (recordingType === 'missing tags') {
      upsertEmailWithAttachments.emailBody = {
        photo: '[10/Unlimited]',
        date: '05.02.21',
        time: '20:42:44',
        temperature: '23 degree Celsius(C)',
        battery: '80%',
        signal: 'Good',
        'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
      }
      upsertEmailWithAttachments.subject = 'test with small image'
      expectedUpsertResult = { ...upsertEmailWithAttachments, tags: [] }
    }
  })

  describe('when document with same date already exists', () => {
    test('it has less than 20 records, updates recordings array', async () => {
      const documentToUpdateDate = new Date(initialRecordings[3].recording.mediaDate)
      const earliestTime = documentToUpdateDate.getTime()
      upsertEmailWithAttachments.mediaDate.setUTCDate(documentToUpdateDate.getUTCDate())
      expectedUpsertResult.mediaDate.setUTCDate(documentToUpdateDate.getUTCDate())
      const expectedUpsertResultParsed = JSON.parse(JSON.stringify(expectedUpsertResult))

      const result = await upsertRecording(upsertEmailWithAttachments)
      const recordingAmountAfter = await Recording.estimatedDocumentCount()

      const updatedRecording = await Recording.findOne({ 'earliestTime': earliestTime }).select({ 'recordings._id': 0, 'recordings.tags._id': 0 })
      let updatedRecordingEntry = JSON.parse(JSON.stringify(updatedRecording.recordings[updatedRecording.count - 1]))

      expect(recordingAmountAfter).toEqual(recordingAmountCount)
      expect(result.modifiedCount).toEqual(1)
      expect(updatedRecording.recordings).toHaveLength(initialRecordings[3].count + 1)
      expect(updatedRecording.count).toEqual(initialRecordings[3].count + 1)
      for (const property in updatedRecordingEntry) {
        expect(updatedRecordingEntry[property]).toEqual(expectedUpsertResultParsed[property])
      }
    })

    test('it has 20 records, creates new document with same date', async () => {
      const documentToCreateDate = new Date(initialRecordings[0].recording.mediaDate)
      upsertEmailWithAttachments.mediaDate.setUTCDate(documentToCreateDate.getUTCDate())
      expectedUpsertResult.mediaDate.setUTCDate(documentToCreateDate.getUTCDate())
      const expectedUpsertResultParsed = JSON.parse(JSON.stringify(expectedUpsertResult))

      const result = await upsertRecording(upsertEmailWithAttachments)

      const recordingAmountAfter = await Recording.estimatedDocumentCount()
      const createdRecording = await Recording.findOne({ 'earliestTime': upsertEmailWithAttachments.mediaDate }).select({ 'recordings._id': 0, 'recordings.tags._id': 0 })
      let createdRecordingEntry = JSON.parse(JSON.stringify(createdRecording.recordings[0]))

      expect(recordingAmountAfter).toEqual(recordingAmountCount + 1)
      expect(result.modifiedCount).toEqual(0)
      expect(createdRecording.recordings).toHaveLength(1)
      expect(createdRecording.count).toEqual(1)
      expect(createdRecording.date.getUTCDate()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCDate())
      expect(createdRecording.date.getUTCMonth()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCMonth())
      expect(createdRecording.date.getUTCFullYear()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCFullYear())
      for (const property in createdRecordingEntry) {
        expect(createdRecordingEntry[property]).toEqual(expectedUpsertResultParsed[property])
      }
    })
  })

  test('when document with same date does not exist creates new document with same date', async () => {
    upsertEmailWithAttachments.mediaDate.setDate(10)
    expectedUpsertResult.mediaDate.setUTCDate(10)
    const expectedUpsertResultParsed = JSON.parse(JSON.stringify(expectedUpsertResult))

    const result = await upsertRecording(upsertEmailWithAttachments)

    const recordingAmountAfter = await Recording.estimatedDocumentCount()
    const createdRecording = await Recording.findOne({ 'earliestTime': upsertEmailWithAttachments.mediaDate }).select({ 'recordings._id': 0, 'recordings.tags._id': 0 })
    let createdRecordingEntry = JSON.parse(JSON.stringify(createdRecording.recordings[0]))

    expect(recordingAmountAfter).toEqual(recordingAmountCount + 1)
    expect(result.modifiedCount).toEqual(0)
    expect(createdRecording.recordings).toHaveLength(1)
    expect(createdRecording.count).toEqual(1)
    expect(createdRecording.date.getUTCDate()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCDate())
    expect(createdRecording.date.getUTCMonth()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCMonth())
    expect(createdRecording.date.getUTCFullYear()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCFullYear())
    for (const property in createdRecordingEntry) {
      expect(createdRecordingEntry[property]).toEqual(expectedUpsertResultParsed[property])
    }
  })
}

describe.each([
  ['missing subject'],
  ['undefined subject'],
  ['empty email body'],
  ['missing tags'],
  ['all fields']
])('upserting recording with %s', commonUpsertDifferentRecordingsTests)