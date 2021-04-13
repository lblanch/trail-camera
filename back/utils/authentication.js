const bcrypt = require('bcrypt')

const saltRounds = 10

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds)
}

const comparePasswordHash = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash)
}

module.exports = { comparePasswordHash, hashPassword }