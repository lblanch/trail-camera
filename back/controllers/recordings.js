const recordingsRouter = require('express').Router()
const { getAllRecordings } = require('../services/recordings')
const { logInFromSession } = require('../utils/middleware')

recordingsRouter.get('/', logInFromSession, async (request, response) => {

  const recordings = await getAllRecordings()

  response.status(200).send(recordings)
})

module.exports = recordingsRouter