const app = require('../app')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')

const { createToken } = require('../utils/authentication')
const User = require('../models/user')

const api = supertest(app)

let testUser = {
  name: 'Person1',
  email: 'person1@email.com',
  password: '123456'
}

let testUserToken

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

  testUserToken = createToken({ email: testUser.email, id: UserObject._id })
  testUser._id = UserObject._id
})

afterAll(() => {
  mongoose.connection.close()
})

describe('Login', () => {
  test('sucessful login', async () => {
    const response = await api
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect('Content-type', /application\/json/)
    expect(response.body.token).toBeDefined()
    expect(response.body.name).toEqual(testUser.name)
    expect(response.body.email).toEqual(testUser.email)
  })

  //TODO check that token is valid (valid email/id is stored)

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

    //TODO: login with email that doesn't pass the validation

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

describe('Create user', () => {
  const newUser = {
    name: 'Person2',
    email: 'person2@email.com',
    role: 'admin',
  }

  test('sucessful user creation', async () => {
    const userAmountBefore = await User.estimatedDocumentCount()
    const response = await api
      .post('/api/users')
      .set('Authorization', `bearer ${testUserToken}`)
      .send(newUser)
      .expect(201)
      .expect('Content-type', /application\/json/)

    const userAmountAfter = await User.estimatedDocumentCount()

    expect(response.body._id).toBeDefined()
    expect(response.body.name).toEqual(newUser.name)
    expect(response.body.email).toEqual(newUser.email)
    expect(response.body.role).toEqual(newUser.role)
    expect(userAmountAfter).toEqual(userAmountBefore + 1)
  })
})