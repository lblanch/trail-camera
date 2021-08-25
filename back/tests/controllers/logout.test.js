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


test('successful logout when user is logged in, returns status 200 and unset the cookie', async () => {
  await agentAdmin
    .post('/api/auth/login')
    .send({ email: adminUser.email, password: adminUser.password })

  const response = await agentAdmin
    .post('/api/auth/logout')
    .expect(200)

  expect(response.headers['Set-Cookie']).toBeUndefined()
})

describe('unsuccessful logout', () => {
  test('when user is not logged in, returns status 401 and error message', async () => {
    const error = await agentLogout
      .post('/api/auth/logout')
      .expect(401)

    expect(error.body).toHaveProperty('error')
    expect(error.headers['Set-Cookie']).toBeUndefined()
  })

  test('when an invalid cookie is set, returns status 401 and error message', async () => {
    const error = await agentLogout
      .post('/api/auth/logout')
      .set('Cookie', 'sid=s%3ATqIZZ2uMJSQE5MhwkuNvldDnF7XH3uhs.UR6FtDAExhpEsoBhyrLqO8E5aGUUf6790ApUZfZhqgI')
      .expect(401)

    expect(error.body).toHaveProperty('error')
    expect(error.headers['Set-Cookie']).toBeUndefined()
  })
})