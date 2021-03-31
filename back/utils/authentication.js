const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const saltRounds = 10

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds)
}

const comparePasswordHash = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash)
}

const createToken = (userForToken) => {
  return jwt.sign(userForToken, process.env.SECRET)
}

module.exports = { comparePasswordHash, createToken, hashPassword }