const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const comparePasswordHash = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash)
}

const createToken = (userForToken) => {
  return jwt.sign(userForToken, process.env.SECRET)
}

module.exports = { comparePasswordHash, createToken }