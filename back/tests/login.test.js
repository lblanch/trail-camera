const app = require('../app')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')

const User = require('../models/user')

const api = supertest(app)

const testUser = {
  name: 'Person1',
  email: 'person1@email.com',
  password: '123456'
}

beforeEach(async () => {
  await User.deleteMany({})
  const saltRounds = 10
  const passHash = await bcrypt.hash(testUser.password, saltRounds)
  const UserObject = new User({
    name: testUser.name,
    email: testUser.email,
    passwordHash: passHash
  })

  await UserObject.save()
})

afterAll(() => {
  mongoose.connection.close()
})

describe('Login', () => {
  test('sucessful login', async () => {
    const response = await api
      .post('/api/login')
      .send(testUser)
      .expect('Content-type', /application\/json/)
    expect(response.body.token).toBeDefined()
    expect(response.body.name).toEqual(testUser.name)
    expect(response.body.email).toEqual(testUser.email)
  })

  describe('unsucessful login', () => {
    test('when passed empty user', async () => {
      const error = await api
        .post('/api/login')
        .send({})
        .expect(401)
        .expect('Content-type', /application\/json/)
      expect(error.body).toHaveProperty('error')
    })

    test('when passed wrong email', async () => {
      const error = await api
        .post('/api/login')
        .send({ email: 'wrong@email.com', password: testUser.password })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })

    test('when passed wrong password', async () => {
      const error = await api
        .post('/api/login')
        .send({ email: testUser.email, password: 'wrongPassword' })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })
  })
})