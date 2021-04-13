//require('leaked-handles')
const { app, store } = require('../app')
const mongoose = require('mongoose')
const supertest = require('supertest')

const User = require('../models/user')
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

describe('Create user', () => {
  const newUser = {
    name: 'Person2',
    email: 'person2@email.com',
    role: 'admin',
  }

  test('sucessful user creation returns valid user and status 201', async () => {
    const userAmountBefore = await User.estimatedDocumentCount()
    const response = await api
      .post('/api/users')
      .set('Authorization', `bearer ${testUser.token}`)
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

  describe('unsuccessful user creation', () => {
    //TODO when passed invalid token, missing token, etc...

    test('when passed invalid email returns status 400 and error message', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const error = await api
        .post('/api/users')
        .set('Authorization', `bearer ${testUser.token}`)
        .send({ ...newUser, email: 'invalidEmail' })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(error.body).toHaveProperty('error')
      expect(userAmountAfter).toEqual(userAmountBefore)
    })
  })
})