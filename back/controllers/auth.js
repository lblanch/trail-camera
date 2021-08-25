const authRouter = require('express').Router()

const { comparePasswordHash } = require('../utils/authentication')
const { getLoginUserByEmail } = require('../services/users')

authRouter.post('/login', async (request, response) => {
  if (request.session.user) {
    const newError = new Error('A user is already logged in')
    newError.statusCode = 400
    throw newError
  }

  const user = await getLoginUserByEmail(request.body.email)

  const isPasswordCorrect = (user === null) || !request.body.password ?
    false :
    await comparePasswordHash(request.body.password, user.passwordHash)

  if (!(user && isPasswordCorrect)) {
    const newError = new Error('invalid email or password')
    newError.statusCode = 401
    throw newError
  }

  request.session.user = user._id

  response
    .status(200)
    .send({ name: user.name, email: user.email })
})

module.exports = authRouter