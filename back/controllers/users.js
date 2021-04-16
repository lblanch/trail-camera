const usersRouter = require('express').Router()

const User = require('../models/user')
const { getSessionUser } = require('../utils/authentication')

usersRouter.post('/', async (request, response) => {
  const user = await getSessionUser(request)

  if (user.role !== 'admin') {
    const newError = new Error('Only users with "admin" role can create users')
    newError.statusCode = 403
    throw newError
  }

  delete request.body.passwordHash

  const newUser = new User(request.body)
  const savedUser = await newUser.save()

  response.status(201).send(savedUser)
})

module.exports = usersRouter