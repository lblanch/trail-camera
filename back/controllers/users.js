const mongoose = require('mongoose')
const usersRouter = require('express').Router()

const userService = require('../services/users')
const { validatePassword } = require('../utils/authentication')
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

  const savedUser = await userService.createNewUser(sanitizedUser)

  await userService.createInvitationToken(savedUser._id)

  response.status(201).send(savedUser)
})

usersRouter.get('/', logInFromSession, async (request, response) => {
  if (request.trailcamUser.role !== 'admin') {
    const newError = new Error('Logged in user has wrong role')
    newError.statusCode = 403
    throw newError
  }

  const users = await userService.getAllUsers()

  response.status(200).send(users)
})

usersRouter.patch('/registration/:invitationToken', async (request, response) => {
  if (request.session.user) {
    const newError = new Error('Registration is not possible with a logged in user. Please logout and try again.')
    newError.statusCode = 400
    throw newError
  }

  if (!request.body.password) {
    const newError = new Error('Password missing')
    newError.statusCode = 400
    throw newError
  }

  validatePassword(request.body.password)

  const invitationTokenFromDb = await userService.getInvitationToken(request.params.invitationToken)

  if (!invitationTokenFromDb) {
    const newError = new Error('Invitation token is invalid')
    newError.statusCode = 400
    throw newError
  }

  await userService.updateUserPassword(invitationTokenFromDb.userId, request.body.password)

  await userService.deleteInvitationToken(invitationTokenFromDb._id)

  response.status(200).end()
})

// Return status 400 if the invitation token is missing (default express behaviour is to return 404)
usersRouter.patch('/registration/', async () => {
  const newError = new Error('Invitation token missing')
  newError.statusCode = 400
  throw newError
})

usersRouter.patch('/:userId', logInFromSession, async (request, response) => {
  if (request.trailcamUser.role !== 'admin') {
    const newError = new Error('Logged in user does not have permission')
    newError.statusCode = 403
    throw newError
  }

  if (!request.body.role) {
    const newError = new Error('Role missing')
    newError.statusCode = 400
    throw newError
  }

  if (request.trailcamUser._id.toString() === request.params.userId) {
    const newError = new Error('It\'s not possible to change the role of the logged in user')
    newError.statusCode = 400
    throw newError
  }

  if (!mongoose.isValidObjectId(request.params.userId)) {
    const newError = new Error('Invalid userId')
    newError.statusCode = 400
    throw newError
  }

  const updatedUser = await userService.updateUserRole(request.params.userId, request.body.role)

  response.status(200).send({ name: updatedUser.name, email: updatedUser.email, role: updatedUser.role })
})

usersRouter.patch('/', logInFromSession, async (request, response) => {
  if (!request.body.name || !request.body.email) {
    const newError = new Error('Name and/or email missing')
    newError.statusCode = 400
    throw newError
  }

  const updatedUser = await userService.updateUserProfile(
    request.trailcamUser._id,
    request.body.name,
    request.body.email
  )

  response.status(200).send({ name: updatedUser.name, email: updatedUser.email })
})

module.exports = usersRouter