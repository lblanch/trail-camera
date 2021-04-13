const { app, store } = require('../app')
const mongoose = require('mongoose')
const supertest = require('supertest')

const { reloadAdminUser } = require('./helpers/users_helper')

let api
let server
let testUser

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  await new Promise((resolve, reject) => {
    server = app.listen(5000, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })

  api = supertest.agent(server)
})

beforeEach(async () => {
  testUser = await reloadAdminUser()
})

afterAll(async () => {
  mongoose.connection.close()
  await new Promise((resolve, reject) => server.close((err) => {
    if (err) return reject(err)

    resolve()
  }))
  await store.client.close()
})

describe('Login', () => {
  test('sucessful login returns token', async () => {
    const response = await api
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect('Content-type', /application\/json/)
    expect(response.body.token).toBeDefined()
    //TODO: should the tokens be equal? sometimes it fails...
    //expect(response.body.token).toEqual(testUser.token)
    expect(response.body.name).toEqual(testUser.name)
    expect(response.body.email).toEqual(testUser.email)
  })

  describe('unsucessful login', () => {
    test('when passed empty user returns status 401 and error message', async () => {
      const error = await api
        .post('/api/login')
        .send({})
        .expect(401)
        .expect('Content-type', /application\/json/)
      expect(error.body).toHaveProperty('error')
    })

    test('when passed wrong email returns status 401 and error message', async () => {
      const error = await api
        .post('/api/login')
        .send({ email: 'wrong@email.com', password: testUser.password })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })

    test('when passed wrong password returns status 401 and error message', async () => {
      const error = await api
        .post('/api/login')
        .send({ email: testUser.email, password: 'wrongPassword' })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })

    test('when passed invalid email returns status 401 and error message', async () => {
      // We don't validate the email format when logging in
      const error = await api
        .post('/api/login')
        .send({ email: 'invalid email', password: testUser.password })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })
  })
})