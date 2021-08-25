const supertest = require('supertest')

const { connect, disconnect, clearSessionStore } = require('../../app')
const { reloadAdminUser, clearUsers } = require('../helpers/users_helper')

let agentLogout, agentAdmin
let server
let adminUser

beforeAll(async () => {
  server = await connect()

  agentLogout = supertest.agent(server)
  agentAdmin = supertest.agent(server)
})

beforeEach(async () => {
  await clearSessionStore()
  await clearUsers()
  adminUser = await reloadAdminUser()
})

afterAll(async () => {
  await disconnect()
})

test('When a valid session cookie is provided, it returns status 200 and the user\'s basic information', async () => {
  await agentAdmin
    .post('/api/auth/login')
    .send({ email: adminUser.email, password: adminUser.password })

  const response = await agentAdmin
    .get('/api/auth')
    .expect(200)
    .expect('Content-type', /application\/json/)

  expect(Object.keys(response.body)).toHaveLength(2)
  expect(response.body.email).toEqual(adminUser.email)
  expect(response.body.name).toEqual(adminUser.name)
})

test('When no session cookie is provided, it returns status 401 and an error message', async () => {
  const error = await agentLogout
    .get('/api/auth')
    .expect(401)
    .expect('Content-type', /application\/json/)

  expect(error.body).toHaveProperty('error')
})

test('When invalid session cookie is provided, it returns status 401 and an error message', async () => {
  const error = await agentLogout
    .get('/api/auth')
    .set('Cookie', 'sid=s%3ATqIZZ2uMJSQE5MhwkuNvldDnF7XH3uhs.UR6FtDAExhpEsoBhyrLqO8E5aGUUf6790ApUZfZhqgI')
    .expect(401)
    .expect('Content-type', /application\/json/)

  expect(error.body).toHaveProperty('error')
})