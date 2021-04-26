const User = require('../../models/user')
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

const reloadAdminUser = async () => {
  const passHash = await hashPassword(testAdminUser.password)

  const UserObject = new User({
    name: testAdminUser.name,
    email: testAdminUser.email,
    passwordHash: passHash,
    role: testAdminUser.role,
    createdBy: testAdminUser.createdBy
  })

  await UserObject.save()

  return { ...testAdminUser, id: UserObject._id }
}

const reloadBasicUser = async () => {
  const passHash = await hashPassword(testBasicUser.password)

  const UserObject = new User({
    name: testBasicUser.name,
    email: testBasicUser.email,
    passwordHash: passHash,
    role: testBasicUser.role,
    createdBy: testBasicUser.createdBy
  })

  await UserObject.save()

  return { ...testBasicUser, id: UserObject._id }
}

module.exports = { clearUsers, reloadAdminUser, reloadBasicUser }