const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const user = await User.findOne({ email: request.body.email })
  const isPasswordCorrect = (user === null) || !request.body.password ?
    false :
    await bcrypt.compare(request.body.password, user.passwordHash)

  if (!(user && isPasswordCorrect)) {
    return response.status(401).json({
      error: 'invalid email or password'
    })
  }

  const userForToken = {
    email: user.email,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({ token, email: user.email, name: user.name })
})

module.exports = loginRouter