//require('leaked-handles')
const supertest = require('supertest')

const User = require('../models/user')
const { handleTestConnection, clearSessionStore, handleTestDisconnection } = require('./helpers/test_helper')
const { reloadAdminUser, reloadBasicUser, clearUsers } = require('./helpers/users_helper')

let agentAdmin, agentBasic, agentLogout
let server
let testAdminUser, testBasicUser

const newUser = {
  name: 'Person2',
  email: 'person2@email.com',
  role: 'admin',
}

beforeAll(async () => {
  server = await handleTestConnection()

  //Create 3 agents, to login different users
  agentLogout = supertest.agent(server)
  agentAdmin = supertest.agent(server)
  agentBasic = supertest.agent(server)
})

beforeEach(async () => {
  await clearSessionStore()
  await clearUsers()
  testAdminUser = await reloadAdminUser()
})

afterAll(async () => {
  await handleTestDisconnection(server)
})

test('Create user with no user logged in returns status 401 and error message', async () => {
  const userAmountBefore = await User.estimatedDocumentCount()
  const error = await agentLogout
    .post('/api/users')
    .send(newUser)
    .expect(401)
    .expect('Content-type', /application\/json/)

  const userAmountAfter = await User.estimatedDocumentCount()

  expect(error.body).toHaveProperty('error')
  expect(userAmountAfter).toEqual(userAmountBefore)
})

test('Create user with non admin user logged in returns status 403 and error message', async () => {
  //create basic user and login
  testBasicUser = await reloadBasicUser()

  await agentBasic
    .post('/api/login')
    .send({ email: testBasicUser.email, password: testBasicUser.password })

  const userAmountBefore = await User.estimatedDocumentCount()
  const error = await agentBasic
    .post('/api/users')
    .send(newUser)
    .expect(403)
    .expect('Content-type', /application\/json/)

  const userAmountAfter = await User.estimatedDocumentCount()

  expect(error.body).toHaveProperty('error')
  expect(userAmountAfter).toEqual(userAmountBefore)
})

describe('Create user with admin user logged in', () => {
  beforeEach(async () => {
    //login with Admin user
    await agentAdmin
      .post('/api/login')
      .send({ email: testAdminUser.email, password: testAdminUser.password })
  })

  test('sucessful user creation returns valid user and status 201', async () => {
    const userAmountBefore = await User.estimatedDocumentCount()
    const response = await agentAdmin
      .post('/api/users')
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
      const error = await agentAdmin
        .post('/api/users')
        .send({ ...newUser, email: 'invalidEmail' })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(error.body).toHaveProperty('error')
      expect(userAmountAfter).toEqual(userAmountBefore)
    })
  })
})