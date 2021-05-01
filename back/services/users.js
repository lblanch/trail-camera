const User = require('../models/user')
const Token = require('../models/token')
const { createTokenHash } = require('../utils/authentication')

const createNewUser = async (sanitizedUser) => {
  const newUser = new User(sanitizedUser)
  return await newUser.save()
}

const createInvitationToken = async (savedUserId) => {
  const tokenExpiryDate = new Date()
  tokenExpiryDate.setDate(tokenExpiryDate.getDate() + 7)

  const tokenHash = await createTokenHash()

  const newToken = new Token(
    {
      expireAt: tokenExpiryDate,
      token: tokenHash,
      type: 'invitation',
      userId: savedUserId
    })
  await newToken.save()
}

const getSessionUser = async (userId) => {
  //return await (await User.findById(userId).select({ passwordHash: 0, __v: 0 }))
  return await User.findById(userId).select({ passwordHash: 0, __v: 0 })
}

const getAllUsers = async () => {
  return await User.find({}).select({ passwordHash: 0, __v: 0 })
}

const getLoginUserByEmail = async (email) => {
  return await User.findOne({ email: email }).select({ passwordHash: 1, email: 1, name: 1 })
}

module.exports = { createNewUser, createInvitationToken, getSessionUser, getAllUsers, getLoginUserByEmail }