const app = require('../app')
const mongoose = require('mongoose')
const supertest = require('supertest')

const { reloadAdminUser } = require('./helpers/users_helper')

const api = supertest(app)

let testUser

beforeEach(async () => {
  console.log('before login.test')
  testUser = await reloadAdminUser()
})

afterAll(() => {
  console.log('after login.test')
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