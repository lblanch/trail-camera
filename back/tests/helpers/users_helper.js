const User = require('../../models/user')
const { hashPassword } = require('../../utils/authentication')

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

  return { ...testUser, id: UserObject._id }
}

module.exports = { reloadAdminUser }