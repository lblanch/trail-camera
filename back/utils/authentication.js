const bcrypt = require('bcrypt')

const User = require('../models/user')

const saltRounds = 10

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds)
}

const comparePasswordHash = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash)
}

const getSessionUser = async (req) => {
  if (!req.session.user) {
    const newError = new Error('No logged in user')
    newError.statusCode = 401
    throw newError
  }

  const user = await User.findById(req.session.user)

  if (!user) {
    const newError = new Error('Invalid user session')
    newError.statusCode = 401
    throw newError
  }

  return user
}

module.exports = { comparePasswordHash, hashPassword, getSessionUser }