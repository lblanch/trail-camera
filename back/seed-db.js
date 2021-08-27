const mongoose = require('mongoose')
require('dotenv').config()

const recordingsHelper = require('./tests/helpers/recordings_helper')
const usersHelper = require('./tests/helpers/users_helper')
const logger = require('./utils/logger')

let seedingOptions = {
  recordings: true,
  adminUser: true,
  basicUser: true,
  invitedUser: false,
  mediaThumbnailUrl: '',
  mediaUrl: ''
}

//first 2 arguments are node + script path, custom arguments come afterwards
if (process.argv.length > 2) {
  seedingOptions = { ...seedingOptions, ...JSON.parse(process.argv[2]) }
}

const seedDb = async () => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('Script cannot be run in production')
    return
  }

  await mongoose.connect(process.env.TEST_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

  const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray()
  for (const collection of collections) {
    await mongoose.connection.db.dropCollection(collection.name)
  }
  logger.info('All collections dropped')

  if (seedingOptions.recordings) {
    logger.info('reloading recordings', seedingOptions.mediaUrl, seedingOptions.mediaThumbnailUrl)
    await recordingsHelper.reloadRecordings(seedingOptions.mediaUrl, seedingOptions.mediaThumbnailUrl)
  }

  if (seedingOptions.adminUser) {
    logger.info('reloading admin user')
    await usersHelper.reloadAdminUser()
  }

  if (seedingOptions.basicUser) {
    logger.info('reloading basic user')
    await usersHelper.reloadBasicUser()
  }

  await mongoose.disconnect()
  logger.info('disconnected')
}

seedDb()
  .then(() => {
    console.log('Seeding DB for testing: done')
  })
  .catch((error) => {
    console.error(error)
  })


