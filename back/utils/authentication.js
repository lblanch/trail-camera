const bcrypt = require('bcrypt')
const crypto = require('crypto')

const saltRounds = 12

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds)
}

const comparePasswordHash = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash)
}

const createTokenHash = async () => {
  const randomBuffer = await crypto.randomBytes(16)

  const hash = crypto.createHash('sha256')

  hash.update(randomBuffer)
  return hash.digest('base64url')
}

const validatePassword = (password) => {
  if(password.length < 10) {
    const newError = new Error('Password should be at least 10 characters long')
    newError.statusCode = 400
    throw newError
  }

  // based on https://github.com/sindresorhus/non-ascii
  const nonAscii = /[^\u0020-\u007F]+/

  if(nonAscii.test(password)) {
    const newError = new Error('Password can only contain ASCII characters')
    newError.statusCode = 400
    throw newError
  }

  return true
}

module.exports = { comparePasswordHash, hashPassword, createTokenHash, validatePassword }