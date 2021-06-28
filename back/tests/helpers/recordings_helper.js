const Recording = require('../../models/recording')

const initialRecordings = [
  {
    emailBody: {
      photo: '[8/Unlimited]',
      date: '05.02.21',
      time: '20:42:44',
      temperature: '23 degree Celsius(C)',
      battery: '80%',
      signal: 'Good',
      'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
    },
    date: new Date('2021-02-05T18:42:44.000Z'),
    emailDeliveryDate: new Date ('2021-02-05T18:42:52.000Z'),
    sentTo: 'receiver@example.com',
    sentFrom: 'sender name <sender@example.com>',
    subject: 'UM785 (Europe)|05.02.2021 20:42:44',
    mediaType: 'picture',
    mediaThumbnailURL: 'https://example.com/pics/IMG1.jpg',
    mediaURL: 'https://example.com/pics/IMG1.jpg',
  },
  {
    emailBody: {
      photo: '[9/Unlimited]',
      date: '05.02.21',
      time: '20:42:44',
      temperature: '23 degree Celsius(C)',
      battery: '80%',
      signal: 'Good',
      'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
    },
    date: new Date('2021-02-05T18:42:44.000Z'),
    emailDeliveryDate: new Date ('2021-02-05T18:42:52.000Z'),
    sentTo: 'receiver@example.com',
    sentFrom: 'sender name <sender@example.com>',
    subject: 'UM785 (Europe)|05.02.2021 20:42:44',
    mediaType: 'picture',
    mediaThumbnailURL: 'https://example.com/pics/IMG1.jpg',
    mediaURL: 'https://example.com/pics/IMG1.jpg',
  },
  {
    emailBody: {
      photo: '[10/Unlimited]',
      date: '05.02.21',
      time: '20:42:44',
      temperature: '23 degree Celsius(C)',
      battery: '80%',
      signal: 'Good',
      'sd-card-free-space': '14.42 GB of 14.91 GB(96.71%)'
    },
    date: new Date('2021-02-05T18:42:44.000Z'),
    emailDeliveryDate: new Date ('2021-02-05T18:42:52.000Z'),
    sentTo: 'receiver@example.com',
    sentFrom: 'sender name <sender@example.com>',
    subject: 'UM785 (Europe)|05.02.2021 20:42:44',
    mediaType: 'picture',
    mediaThumbnailURL: 'https://example.com/pics/IMG1.jpg',
    mediaURL: 'https://example.com/pics/IMG1.jpg',
  }
]

const reloadRecordings = async () => {
  await Recording.deleteMany({})

  //Store all returned promises to an array, and call them with Promise.all, which will
  //await each of them and finish once they are all finished.
  const promisesArray = initialRecordings.map(recording => {
    const newRecording = new Recording(recording)
    return newRecording.save()
  })
  await Promise.all(promisesArray)
}

module.exports = { initialRecordings, reloadRecordings }