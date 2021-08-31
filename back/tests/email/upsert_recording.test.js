const mongoose = require('mongoose')
require('dotenv').config()

const { upsertRecording } = require('../../services/recordings')
const Recording = require('../../models/recording')
const { initialRecordings, reloadRecordings, clearRecordings } = require('../helpers/recordings_helper')
const { upsertEmailWithAttachments } = require('../helpers/email_helper')

let recordingAmountCount

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
})

beforeEach(async () => {
  await clearRecordings()
  await reloadRecordings()
  recordingAmountCount = await Recording.estimatedDocumentCount()
})

afterAll(async () => {
  await mongoose.disconnect()
})

describe('when document with same date already exists', () => {
  test('it has less than 20 records, updates recordings array', async () => {
    upsertEmailWithAttachments.mediaDate.setDate(5)

    const result = await upsertRecording(upsertEmailWithAttachments)
    const recordingAmountAfter = await Recording.estimatedDocumentCount()

    const earliestTime = new Date(initialRecordings[3].date).getTime()
    const updatedRecording = await Recording.findOne({ 'earliestTime': earliestTime })
    let updatedRecordingEntry = JSON.parse(JSON.stringify(updatedRecording.recordings[updatedRecording.count - 1]))
    delete updatedRecordingEntry._id

    expect(recordingAmountAfter).toEqual(recordingAmountCount)
    expect(result.nModified).toEqual(1)
    expect(updatedRecording.recordings).toHaveLength(initialRecordings[3].count + 1)
    expect(updatedRecording.count).toEqual(initialRecordings[3].count + 1)
    expect(JSON.stringify(updatedRecordingEntry)).toEqual(JSON.stringify(upsertEmailWithAttachments))
  })

  test('it has 20 records, creates new document with same date', async () => {
    upsertEmailWithAttachments.mediaDate.setDate(7)

    const result = await upsertRecording(upsertEmailWithAttachments)

    const recordingAmountAfter = await Recording.estimatedDocumentCount()
    const createdRecording = await Recording.findOne({ 'earliestTime': upsertEmailWithAttachments.mediaDate })
    //Remove _id property for easier comparison
    let createdRecordingEntry = JSON.parse(JSON.stringify(createdRecording.recordings[0]))
    delete createdRecordingEntry._id

    expect(recordingAmountAfter).toEqual(recordingAmountCount + 1)
    expect(result.nModified).toEqual(0)
    expect(createdRecording.recordings).toHaveLength(1)
    expect(createdRecording.count).toEqual(1)
    expect(JSON.stringify(createdRecordingEntry)).toEqual(JSON.stringify(upsertEmailWithAttachments))
    expect(createdRecording.date.getUTCDate()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCDate())
    expect(createdRecording.date.getUTCMonth()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCMonth())
    expect(createdRecording.date.getUTCFullYear()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCFullYear())
  })
})

test('when document with same date does not exist creates new document with same date', async () => {
  upsertEmailWithAttachments.mediaDate.setDate(10)

  const result = await upsertRecording(upsertEmailWithAttachments)

  const recordingAmountAfter = await Recording.estimatedDocumentCount()
  const createdRecording = await Recording.findOne({ 'earliestTime': upsertEmailWithAttachments.mediaDate })
  //Remove _id property for easier comparison
  let createdRecordingEntry = JSON.parse(JSON.stringify(createdRecording.recordings[0]))
  delete createdRecordingEntry._id

  expect(recordingAmountAfter).toEqual(recordingAmountCount + 1)
  expect(result.nModified).toEqual(0)
  expect(createdRecording.recordings).toHaveLength(1)
  expect(createdRecording.count).toEqual(1)
  expect(JSON.stringify(createdRecordingEntry)).toEqual(JSON.stringify(upsertEmailWithAttachments))
  expect(createdRecording.date.getUTCDate()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCDate())
  expect(createdRecording.date.getUTCMonth()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCMonth())
  expect(createdRecording.date.getUTCFullYear()).toEqual(upsertEmailWithAttachments.mediaDate.getUTCFullYear())
})