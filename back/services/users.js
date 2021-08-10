const User = require('../models/user')
const Token = require('../models/token')
const { createTokenHash, hashPassword } = require('../utils/authentication')

const createNewUser = async (sanitizedUser) => {
  const newUser = new User(sanitizedUser)
  return await newUser.save()
}

const updateUserPassword = async (userId, newPassword, isPasswordRecovery = false) => {
  const userToBeUpdated = await User.findById(userId)
  if (userToBeUpdated === null) {
    const newError = new Error('Invalid userId')
    newError.statusCode = 400
    throw newError
  } else if (isPasswordRecovery && userToBeUpdated.passwordHash === undefined) {
    const newError = new Error('Invalid userId')
    newError.statusCode = 400
    throw newError
  }

  userToBeUpdated.passwordHash = await hashPassword(newPassword)

  await userToBeUpdated.save()
}

const updateUserRole = async (userId, newRole) => {
  const userToBeUpdated = await User.findById(userId)
  if (userToBeUpdated === null) {
    const newError = new Error('Invalid userId')
    newError.statusCode = 400
    throw newError
  }

  userToBeUpdated.role = newRole

  return await userToBeUpdated.save()
}

const updateUserProfile = async (userId, name, email) => {
  const userToBeUpdated = await User.findById(userId, 'name email')
  if (userToBeUpdated === null) {
    const newError = new Error('Invalid userId')
    newError.statusCode = 400
    throw newError
  }

  userToBeUpdated.name = name
  userToBeUpdated.email = email

  return await userToBeUpdated.save()
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
  return await newToken.save()
}

const deleteToken = async (tokenId) => {
  await Token.deleteOne({ _id: tokenId })
}

const deletePreviousPasswordToken = async (userId) => {
  await Token.deleteMany({ userId: userId, type: 'password' })
}

const getInvitationToken = async (token) => {
  return await Token.findOne({ token: token, type: 'invitation' }).select({ userId: 1 })
}

const createPasswordToken = async (savedUserId) => {
  const tokenExpiryDate = new Date()
  tokenExpiryDate.setDate(tokenExpiryDate.getDate() + 7)

  const tokenHash = await createTokenHash()

  const newToken = new Token(
    {
      expireAt: tokenExpiryDate,
      token: tokenHash,
      type: 'password',
      userId: savedUserId
    })
  return await newToken.save()
}

const getPasswordToken = async (token) => {
  return await Token.findOne({ token: token, type: 'password' }).select({ userId: 1 })
}

const getSessionUser = async (userId) => {
  return await User.findById(userId).select({ passwordHash: 0, __v: 0 })
}

const getSessionUserWithHash = async (userId) => {
  return await User.findById(userId).select({ __v: 0 })
}

const getAllUsers = async () => {
  return await User.find({}).select({ passwordHash: 0, __v: 0 })
}

const getLoginUserByEmail = async (email) => {
  return await User.findOne({ email: email }).select({ passwordHash: 1, email: 1, name: 1 })
}

const getPasswordRecoveryUserByEmail = async (email) => {
  return await User.findOne({ email: email })
    .select({ email: 1, name: 1, userType: { $cond: [{ $not: ['$passwordHash'] }, 'invited', 'registered'] } })
}

module.exports = {
  createNewUser,
  updateUserPassword,
  updateUserRole,
  updateUserProfile,
  createInvitationToken,
  createPasswordToken,
  deleteToken,
  deletePreviousPasswordToken,
  getSessionUser,
  getSessionUserWithHash,
  getAllUsers,
  getLoginUserByEmail,
  getPasswordRecoveryUserByEmail,
  getInvitationToken,
  getPasswordToken
}