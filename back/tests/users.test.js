const app = require('../app')
const mongoose = require('mongoose')
const supertest = require('supertest')

const User = require('../models/user')
const { reloadAdminUser } = require('./helpers/users_helper')

const api = supertest(app)

let testUser

beforeEach(async () => {
  testUser = await reloadAdminUser()
})

afterAll(() => {
  mongoose.connection.close()
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
})