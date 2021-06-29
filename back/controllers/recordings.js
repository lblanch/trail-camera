const recordingsRouter = require('express').Router()
const { getRecordingsByPage } = require('../services/recordings')
const { logInFromSession } = require('../utils/middleware')

recordingsRouter.get('/:page', logInFromSession, async (request, response) => {
  const numericPage = Number.parseInt(request.params.page)
  if (Number.isNaN(numericPage)) {
    const newError = new Error('Page needs to be a number')
    newError.statusCode = 403
    throw newError
  }

  if (numericPage <= 0) {
    const newError = new Error('Page needs to a positive number bigger than 0')
    newError.statusCode = 403
    throw newError
  }

  const recordings = await getRecordingsByPage(numericPage-1)

  if(recordings) {
    response.status(200).send(recordings)
  } else {
    response.status(200).send({ count: 0 })
  }
})

recordingsRouter.get('/', logInFromSession, async (request, response) => {

  const recordings = await getRecordingsByPage(0)

  if(recordings) {
    response.status(200).send(recordings)
  } else {
    response.status(200).send({ count: 0 })
  }
})

module.exports = recordingsRouter