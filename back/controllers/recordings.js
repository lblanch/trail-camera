const recordingsRouter = require('express').Router()
const mongoose = require('mongoose')

const { getRecordingsByPage, addTagToRecording, removeTagFromRecording } = require('../services/recordings')
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

  const result = await removeTagFromRecording(request.params.tagId)

  console.log(result)

  response.status(200).end()
})

module.exports = recordingsRouter