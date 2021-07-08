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
}

module.exports = { getRecordingsByPage, upsertRecording }