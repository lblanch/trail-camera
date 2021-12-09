const Recording = require('../models/recording')

const upsertRecording = async (recording) => {
  const dateWithoutTime = new Date(Date.UTC(recording.mediaDate.getUTCFullYear(), recording.mediaDate.getUTCMonth(), recording.mediaDate.getUTCDate()))
  return await Recording.updateOne(
    { 'date': dateWithoutTime, 'count': { $lt: 20 } },
    {
      '$push': {
        'recordings': recording },
      '$inc': { 'count': 1 },
      '$setOnInsert': { 'earliestTime': recording.mediaDate, 'date': dateWithoutTime }
    },
    { upsert: true, runValidators: true }
  )
}

const getRecordingsByPage = async (pageNumber) => {
  return await Recording.findOne({}, null, { sort: { date: -1, earliestTime: -1 }, skip: pageNumber })
    .select({ count: 1, date:1, recordings: 1 })
}

const getRecordingsByBeforeDate = async (beforeDate) => {
  const filters = { earliestTime: { $lt: beforeDate } }

  return await Recording.findOne(filters, null, { sort: { date: -1, earliestTime: -1 } })
    .select({ count: 1, date:1, recordings: 1 })
}

const getRecordingsByAfterDate = async (afterDate) => {
  const filters = { earliestTime: { $gt: afterDate } }

  return await Recording.findOne(filters, null, { sort: { date: 1, earliestTime: 1 } })
    .select({ count: 1, date:1, recordings: 1 })
}

const addTagToRecording = async (recordingId, tag) => {
  const updatedRecording = await Recording.findOneAndUpdate(
    { 'recordings._id': recordingId },
    { '$push': { 'recordings.$.tags':  tag } },
    { new: true, runValidators: true }
  )

  if (updatedRecording === null) {
    const newError = new Error('Invalid recording id')
    newError.statusCode = 400
    throw newError
  }

  return updatedRecording
}

const removeTagFromRecording = async (tagId) => {
  const result = await Recording.updateOne(
    { 'recordings.tags._id': tagId },
    { '$pull': { 'recordings.$.tags': { '_id': tagId } } }
  )

  if (result.modifiedCount === 0) {
    const newError = new Error('Invalid tag id')
    newError.statusCode = 400
    throw newError
  }

  return result
}

module.exports = { getRecordingsByPage, getRecordingsByBeforeDate, getRecordingsByAfterDate, upsertRecording, addTagToRecording, removeTagFromRecording }