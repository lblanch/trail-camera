const usersJSON = require('../../../test-data/users.json')
const Token = require('../../models/token')
const User = require('../../models/user')
const { createNewUser, createInvitationToken, createPasswordToken } = require('../../services/users')
const { hashPassword } = require('../../utils/authentication')

const testAdminUser = usersJSON.admin
const testBasicUser = usersJSON.basic
const testInvitedUser = usersJSON.invited

const clearUsers = async () => {
  await User.deleteMany({})
}

const clearTokens = async () => {
  await Token.deleteMany({})
}

const reloadAdminUser = async () => {
  const sanitizedUser = {
    name: testAdminUser.name,
    email: testAdminUser.email,
    role: testAdminUser.role,
    passwordHash: await hashPassword(testAdminUser.password),
    createdBy: testAdminUser.createdBy
  }
  const newUser = await createNewUser(sanitizedUser)

  return { ...testAdminUser, id: newUser._id }
}

const reloadBasicUser = async () => {
  const sanitizedUser = {
    name: testBasicUser.name,
    email: testBasicUser.email,
    role: testBasicUser.role,
    passwordHash: await hashPassword(testBasicUser.password),
    createdBy: testBasicUser.createdBy
  }

  const newUser = await createNewUser(sanitizedUser)

  return { ...testBasicUser, id: newUser._id }
}

const reloadInvitedUser = async () => {
  const sanitizedUser = {
    name: testInvitedUser.name,
    email: testInvitedUser.email,
    role: testInvitedUser.role,
    createdBy: testInvitedUser.createdBy
  }

  const newUser = await createNewUser(sanitizedUser)

  return { ...testInvitedUser, id: newUser._id }
}

const reloadInvitationToken = async (userId) => {
  return await createInvitationToken(userId)
}

const reloadPasswordToken = async (userId) => {
  return await createPasswordToken(userId)
}

module.exports = {
  clearUsers,
  clearTokens,
  reloadAdminUser,
  reloadBasicUser,
  reloadInvitedUser,
  reloadInvitationToken,
  reloadPasswordToken
}