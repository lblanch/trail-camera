const Recording = require('../../models/recording')

const initialRecordings = require('../../../test-data/recordings.json')

const clearRecordings = async () => {
  await Recording.deleteMany({})
}

const reloadRecordings = async (imageUrl = '', thumbnailUrl = '') => {
  let results = []
  for (const dayRecording of initialRecordings) {
    if (imageUrl !== '') {
      dayRecording.recording.mediaURL = imageUrl
    }
    if (thumbnailUrl !== '') {
      dayRecording.recording.mediaThumbnailURL = thumbnailUrl
    }
    dayRecording.recordings = Array.from({ length: dayRecording.count }, (value, index) => {
      let newMediaDate = new Date(dayRecording.recording.mediaDate)
      newMediaDate.setUTCMinutes(newMediaDate.getUTCMinutes() + (index * 10))
      return {
        ...dayRecording.recording,
        mediaDate: newMediaDate.toISOString()
      }
    })
    const promiseResult = await upsertRecording(dayRecording)
    results.push(promiseResult)
  }
  return results
}

const upsertRecording = async (recording) => {
  const recordingDate = new Date(recording.recording.mediaDate)
  const justDate = new Date(Date.UTC(recordingDate.getUTCFullYear(), recordingDate.getUTCMonth(), recordingDate.getUTCDate()))
  return await Recording.findOneAndUpdate(
    { 'date': justDate, 'count': { $lt: 20 } },
    {
      '$push': {
        'recordings': { '$each': recording.recordings } },
      '$inc': { 'count': recording.count },
      '$setOnInsert': { 'earliestTime': recordingDate.getTime(), 'date': justDate.getTime() }
    },
    { upsert: true, new: true }
  )
}

module.exports = { initialRecordings, reloadRecordings, clearRecordings }