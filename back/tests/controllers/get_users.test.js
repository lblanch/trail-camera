const supertest = require('supertest')

const { handleTestConnection, clearSessionStore, handleTestDisconnection } = require('../helpers/connection_helper')
const { reloadAdminUser, reloadBasicUser, clearUsers } = require('../helpers/users_helper')

let agentAdmin, agentBasic, agentLogout
let server
let testAdminUser, testBasicUser

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

test('Get all existing users when logged out returns status 401 and error message', async () => {
  const error = await agentLogout
    .get('/api/users')
    .expect(401)
    .expect('Content-type',  /application\/json/)

  expect(error.body).toBeDefined()
})

test('Get all existing users as non admin returns status 403 and error message', async () => {
  //create and login Basic user
  testBasicUser = await reloadBasicUser()

  await agentBasic
    .post('/api/login')
    .send({ email: testBasicUser.email, password: testBasicUser.password })

  const error = await agentBasic
    .get('/api/users')
    .expect(403)
    .expect('Content-type',  /application\/json/)

  expect(error.body).toBeDefined()
})

test('Get all existing users as admin returns status 200 and the user\'s relevant data', async () => {
  //login with Admin user
  await agentAdmin
    .post('/api/login')
    .send({ email: testAdminUser.email, password: testAdminUser.password })

  const users = await agentAdmin
    .get('/api/users')
    .expect(200)
    .expect('Content-type',  /application\/json/)

  expect(users.body).toHaveLength(1)
  expect(users.body[0]).toHaveProperty('_id')
  expect(users.body[0]).toHaveProperty('name')
  expect(users.body[0]).toHaveProperty('email')
  expect(users.body[0]).toHaveProperty('role')
  expect(users.body[0]).toHaveProperty('name')
  expect(users.body[0]).toHaveProperty('status')
  expect(users.body[0]).toHaveProperty('updatedAt')
  expect(users.body[0]).toHaveProperty('createdAt')
  expect(users.body[0]).toHaveProperty('createdBy')
  expect(users.body[0]).not.toHaveProperty('passwordHash')
})

//TODO: pagination for users