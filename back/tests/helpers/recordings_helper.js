const Recording = require('../../models/recording')

const initialRecordings = require('../../../test-data/recordings.json')

const clearRecordings = async () => {
  await Recording.deleteMany({})
}

const reloadRecordings = async (imageUrl = '', thumbnailUrl = '') => {
  //Store all returned promises to an array, and call them with Promise.all, which will
  //await each of them and finish once they are all finished.
  const promisesArray = initialRecordings.map((recording) => createUpdatePromise(recording, imageUrl, thumbnailUrl))
  return await Promise.all(promisesArray)
}

const createUpdatePromise = (recording, imageUrl, thumbnailUrl) => {
  if (imageUrl !== '') {
    recording.recording.mediaURL = imageUrl
  }
  if (thumbnailUrl !== '') {
    recording.recording.mediaThumbnailURL = thumbnailUrl
  }

  const recordingDate = new Date(recording.recording.mediaDate)
  const justDate = new Date(Date.UTC(recordingDate.getUTCFullYear(), recordingDate.getUTCMonth(), recordingDate.getUTCDate()))
  return Recording.findOneAndUpdate(
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