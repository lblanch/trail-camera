const usersRouter = require('express').Router()

const { createNewUser, createInvitationToken, getAllUsers } = require('../services/users')
const { logInFromSession } = require('../utils/middleware')


usersRouter.post('/', logInFromSession, async (request, response) => {
  if (request.trailcamUser.role !== 'admin') {
    const newError = new Error('Logged in user has wrong role')
    newError.statusCode = 403
    throw newError
  }

  const sanitizedUser = {
    name: request.body.name,
    email: request.body.email,
    role: request.body.role,
    createdBy: request.trailcamUser.email
  }

  const savedUser = await createNewUser(sanitizedUser)

  await createInvitationToken(savedUser._id)

  response.status(201).send(savedUser)
})

usersRouter.get('/', logInFromSession, async (request, response) => {
  if (request.trailcamUser.role !== 'admin') {
    const newError = new Error('Logged in user has wrong role')
    newError.statusCode = 403
    throw newError
  }

  const users = await getAllUsers()

  response.status(200).send(users)
})

module.exports = usersRouter