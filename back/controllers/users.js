const usersRouter = require('express').Router()

const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const newUser = new User(request.body)
  const savedUser = await newUser.save()

  response.status(201).send(savedUser)
})

module.exports = usersRouter