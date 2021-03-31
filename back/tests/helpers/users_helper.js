const User = require('../../models/user')
const { hashPassword, createToken } = require('../../utils/authentication')

const testUser = {
  name: 'Person1',
  email: 'person1@email.com',
  password: '123456',
  role: 'admin'
}

const reloadAdminUser = async () => {
  await User.deleteMany({})
  const passHash = await hashPassword(testUser.password)

  const UserObject = new User({
    name: testUser.name,
    email: testUser.email,
    passwordHash: passHash
  })

  await UserObject.save()

  const testUserToken = createToken({ email: testUser.email, id: UserObject._id })
  return { ...testUser, token: testUserToken, id: UserObject._id }
}

module.exports = { reloadAdminUser }