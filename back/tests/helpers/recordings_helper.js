const Recording = require('../../models/recording')

const initialRecordings = require('../../../test-data/recordings.json')

const clearRecordings = async () => {
  await Recording.deleteMany({})
}

const reloadRecordings = async (imageUrl = '', thumbnailUrl = '') => {
  let results = []
  for (const recording of initialRecordings) {
    const promiseResult = await upsertRecording(recording, imageUrl, thumbnailUrl)
    results.push(promiseResult)
  }
  return results
}

const upsertRecording = async (recording, imageUrl, thumbnailUrl) => {
  if (imageUrl !== '') {
    recording.recording.mediaURL = imageUrl
  }
  if (thumbnailUrl !== '') {
    recording.recording.mediaThumbnailURL = thumbnailUrl
  }

  const recordingDate = new Date(recording.recording.mediaDate)
  const justDate = new Date(Date.UTC(recordingDate.getUTCFullYear(), recordingDate.getUTCMonth(), recordingDate.getUTCDate()))
  return await Recording.findOneAndUpdate(
    { 'date': justDate, 'count': { $lt: 20 } },
    {
      '$push': {
        'recordings': { '$each': Array(recording.count).fill(recording.recording) } },
      '$inc': { 'count': recording.count },
      '$setOnInsert': { 'earliestTime': recordingDate.getTime(), 'date': justDate.getTime() }
    },
    { upsert: true, new: true }
  )
}

module.exports = { initialRecordings, reloadRecordings, clearRecordings }