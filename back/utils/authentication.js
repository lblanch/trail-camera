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

module.exports = { comparePasswordHash, hashPassword, createTokenHash }