const recordingsRouter = require('express').Router()
const mongoose = require('mongoose')

const { getRecordingsByPage, addTagToRecording, removeTagFromRecording,
  getRecordingsByBeforeDate, getRecordingsByAfterDate } = require('../services/recordings')
const { logInFromSession } = require('../utils/middleware')

recordingsRouter.get('/before/:beforeDate', logInFromSession, async (request, response) => {
  const receivedDate = new Date(request.params.beforeDate)

  if (receivedDate.toString() === 'Invalid Date') {
    const newError = new Error('Invalid before date')
    newError.statusCode = 400
    throw newError
  }

  const recordings = await getRecordingsByBeforeDate(receivedDate.toISOString())

  if(recordings) {
    recordings.recordings.reverse()
    response.status(200).send(recordings)
  } else {
    response.status(200).send({ count: 0 })
  }
})

recordingsRouter.get('/before/*', logInFromSession, async () => {
  const newError = new Error('Invalid before date')
  newError.statusCode = 400
  throw newError
})

recordingsRouter.get('/before', logInFromSession, async () => {
  const newError = new Error('Missing before date')
  newError.statusCode = 400
  throw newError
})

recordingsRouter.get('/after/:afterDate', logInFromSession, async (request, response) => {
  const receivedDate = new Date(request.params.afterDate)

  if (receivedDate.toString() === 'Invalid Date') {
    const newError = new Error('Invalid after date')
    newError.statusCode = 400
    throw newError
  }

  const recordings = await getRecordingsByAfterDate(receivedDate.toISOString())

  if(recordings) {
    recordings.recordings.reverse()
    response.status(200).send(recordings)
  } else {
    response.status(200).send({ count: 0 })
  }
})

recordingsRouter.get('/after/*', logInFromSession, async () => {
  const newError = new Error('Invalid after date')
  newError.statusCode = 400
  throw newError
})

recordingsRouter.get('/after', logInFromSession, async () => {
  const newError = new Error('Missing after date')
  newError.statusCode = 400
  throw newError
})

recordingsRouter.get('/:page', logInFromSession, async (request, response) => {
  const numericPage = Number.parseInt(request.params.page)
  if (Number.isNaN(numericPage)) {
    const newError = new Error('Page needs to be a number')
    newError.statusCode = 400
    throw newError
  }

  if (numericPage <= 0) {
    const newError = new Error('Page needs to a positive number bigger than 0')
    newError.statusCode = 400
    throw newError
  }

  const recordings = await getRecordingsByPage(numericPage-1)

  if(recordings) {
    recordings.recordings.reverse()
    response.status(200).send(recordings)
  } else {
    response.status(200).send({ count: 0 })
  }
})

recordingsRouter.get('/', logInFromSession, async (request, response) => {

  const recordings = await getRecordingsByPage(0)

  if(recordings) {
    recordings.recordings.reverse()
    response.status(200).send(recordings)
  } else {
    response.status(200).send({ count: 0 })
  }
})

recordingsRouter.patch('/tags/:recordingId', logInFromSession, async (request, response) => {

  if (!request.body.tag) {
    const newError = new Error('Tag missing')
    newError.statusCode = 400
    throw newError
  }

  if (!mongoose.isValidObjectId(request.params.recordingId)) {
    const newError = new Error('Invalid recording id')
    newError.statusCode = 400
    throw newError
  }

  const tagToBeAdded = {
    tag: request.body.tag,
    color: request.body.color
  }

  const updatedRecording = await addTagToRecording(request.params.recordingId, tagToBeAdded)

  response.status(200).send({ tags: updatedRecording.recordings.id(request.params.recordingId).tags })
})

recordingsRouter.delete('/tags/:tagId', logInFromSession, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.tagId)) {
    const newError = new Error('Invalid tag id')
    newError.statusCode = 400
    throw newError
  }

  await removeTagFromRecording(request.params.tagId)

  response.status(200).end()
})

module.exports = recordingsRouter