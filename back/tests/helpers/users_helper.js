const Token = require('../../models/token')
const User = require('../../models/user')
const { createNewUser } = require('../../services/users')
const { hashPassword } = require('../../utils/authentication')

const testAdminUser = {
  name: 'Person1',
  email: 'person1@email.com',
  password: '123456',
  role: 'admin',
  createdBy: '-'
}

const testBasicUser = {
  name: 'Basic',
  email: 'basic.user@email.com',
  password: '123456',
  role: 'user',
  createdBy: testAdminUser.email
}

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

//TODO
/*const inviteNewUser = async () => {
}*/

module.exports = { clearUsers, clearTokens, reloadAdminUser, reloadBasicUser }