const usersRouter = require('express').Router()

const { createNewUser, createInvitationToken, getAllUsers, getInvitationToken, updateUserPassword, deleteInvitationToken } = require('../services/users')
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

  const invitationTokenFromDb = await getInvitationToken(request.params.invitationToken)

  if (!invitationTokenFromDb) {
    const newError = new Error('Invitation token is invalid')
    newError.statusCode = 400
    throw newError
  }

  await updateUserPassword(invitationTokenFromDb.userId, request.body.password)

  await deleteInvitationToken(invitationTokenFromDb._id)

  response.status(200).end()
})

// Return status 400 if the invitation token is missing (default express behaviour is to return 404)
usersRouter.patch('/registration/', async () => {
  const newError = new Error('Invitation token missing')
  newError.statusCode = 400
  throw newError
})

module.exports = usersRouter