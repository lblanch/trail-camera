const Recording = require('../../models/recording')

const initialRecordings = [
  {
    date: new Date(Date.UTC(2021, 1, 7, 18, 42, 44)),
    count: 20,
    recording: {
      emailBody: {
        photo: '[10/Unlimited]',
        date: '05.02.21',
        time: '20:42:44',
        temperature: '23 degree Celsius(C)',
        battery: '80%',
        signal: 'Good',
        'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
      },
      emailDeliveryDate: new Date ('2021-02-05T18:42:52.000Z'),
      sentTo: 'receiver@example.com',
      sentFrom: 'sender name <sender@example.com>',
      subject: 'UM785 (Europe)|05.02.2021 20:42:44',
      mediaType: 'picture',
      mediaThumbnailURL: 'https://example.com/pics/IMG1.jpg',
      mediaURL: 'https://example.com/pics/IMG1.jpg',
    }
  },
  {
    date: new Date(Date.UTC(2021, 1, 6, 17, 13, 44)),
    count: 20,
    recording: {
      emailBody: {
        photo: '[9/Unlimited]',
        date: '05.02.21',
        time: '20:42:44',
        temperature: '23 degree Celsius(C)',
        battery: '80%',
        signal: 'Good',
        'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
      },
      emailDeliveryDate: new Date ('2021-02-05T18:42:52.000Z'),
      sentTo: 'receiver@example.com',
      sentFrom: 'sender name <sender@example.com>',
      subject: 'UM785 (Europe)|05.02.2021 20:42:44',
      mediaType: 'picture',
      mediaThumbnailURL: 'https://example.com/pics/IMG1.jpg',
      mediaURL: 'https://example.com/pics/IMG1.jpg',
    }
  },
  {
    date: new Date(Date.UTC(2021, 1, 5, 20, 56, 30)),
    count: 20,
    recording: {
      emailBody: {
        photo: '[8/Unlimited]',
        date: '05.02.21',
        time: '20:42:44',
        temperature: '23 degree Celsius(C)',
        battery: '80%',
        signal: 'Good',
        'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
      },
      emailDeliveryDate: new Date ('2021-02-05T18:42:52.000Z'),
      sentTo: 'receiver@example.com',
      sentFrom: 'sender name <sender@example.com>',
      subject: 'UM785 (Europe)|05.02.2021 20:42:44',
      mediaType: 'picture',
      mediaThumbnailURL: 'https://example.com/pics/IMG1.jpg',
      mediaURL: 'https://example.com/pics/IMG1.jpg',
    }
  },
  {
    date: new Date(Date.UTC(2021, 1, 5, 22, 34, 30)),
    count: 5,
    recording: {
      emailBody: {
        photo: '[8/Unlimited]',
        date: '05.02.21',
        time: '20:42:44',
        temperature: '23 degree Celsius(C)',
        battery: '80%',
        signal: 'Good',
        'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
      },
      emailDeliveryDate: new Date ('2021-02-05T18:42:52.000Z'),
      sentTo: 'receiver@example.com',
      sentFrom: 'sender name <sender@example.com>',
      subject: 'UM785 (Europe)|05.02.2021 20:42:44',
      mediaType: 'picture',
      mediaThumbnailURL: 'https://example.com/pics/IMG1.jpg',
      mediaURL: 'https://example.com/pics/IMG1.jpg',
    }
  }
]

const clearRecordings = async () => {
  await Recording.deleteMany({})
}

const reloadRecordings = async () => {
  //Store all returned promises to an array, and call them with Promise.all, which will
  //await each of them and finish once they are all finished.
  const promisesArray = initialRecordings.map(createUpdatePromise)
  await Promise.all(promisesArray)
}

const createUpdatePromise = (recording) => {
  const justDate = new Date(Date.UTC(recording.date.getUTCFullYear(), recording.date.getUTCMonth(), recording.date.getUTCDate()))
  return Recording.updateOne(
    { 'date': justDate, 'count': { $lt: 20 } },
    {
      '$push': {
        'recordings': { '$each': Array(recording.count).fill(recording.recording) } },
      '$inc': { 'count': recording.count },
      '$setOnInsert': { 'earliestTime': recording.date.getTime(), 'date': justDate.getTime() }
    },
    { upsert: true }
  )
}

module.exports = { initialRecordings, reloadRecordings, clearRecordings }