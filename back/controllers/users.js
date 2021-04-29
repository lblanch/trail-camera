const usersRouter = require('express').Router()

const token = require('../models/token')
const User = require('../models/user')
const { getSessionUser, createToken } = require('../utils/authentication')

usersRouter.post('/', async (request, response) => {
  const user = await getSessionUser(request)

  if (user.role !== 'admin') {
    const newError = new Error('Logged in user has wrong role')
    newError.statusCode = 403
    throw newError
  }

  //Sanitize input: delete possible passwordHash
  delete request.body.passwordHash

  const newUser = new User({ ...request.body, createdBy: user.email })
  const savedUser = await newUser.save()

  const tokenExpiryDate = new Date()
  tokenExpiryDate.setDate(tokenExpiryDate.getDate() + 7)

  const tokenHash = await createToken()

  const newToken = new token(
    {
      expireAt: tokenExpiryDate,
      token: tokenHash,
      type: 'invitation',
      userId: savedUser._id
    })
  await newToken.save()

  response.status(201).send(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const user = await getSessionUser(request)

  if (user.role !== 'admin') {
    const newError = new Error('Logged in user has wrong role')
    newError.statusCode = 403
    throw newError
  }

  const users = await User.find({}).select({ passwordHash: 0, __v: 0 })

  response.status(200).send(users)
})

module.exports = usersRouter