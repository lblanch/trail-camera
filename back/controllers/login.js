const loginRouter = require('express').Router()

const { comparePasswordHash } = require('../utils/authentication')
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  if (request.session.user) {
    return response.status(401).json({
      error: 'A user is already logged in'
    })
  }

  const user = await User.findOne({ email: request.body.email })
  const isPasswordCorrect = (user === null) || !request.body.password ?
    false :
    await comparePasswordHash(request.body.password, user.passwordHash)

  if (!(user && isPasswordCorrect)) {
    return response.status(401).json({
      error: 'invalid email or password'
    })
  }

  request.session.user = user._id

  response
    .status(200)
    .end()
})

module.exports = loginRouter