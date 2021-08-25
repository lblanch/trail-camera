const supertest = require('supertest')

const { connect, disconnect, clearSessionStore } = require('../../app')
const { reloadAdminUser, clearUsers, reloadInvitedUser } = require('../helpers/users_helper')

let api
let server
let testUser

beforeAll(async () => {
  server = await connect()

  api = supertest(server)
})

beforeEach(async () => {
  await clearSessionStore()
  await clearUsers()
  testUser = await reloadAdminUser()
})

afterAll(async () => {
  await disconnect()
})

describe('Login', () => {
  test('successful login when no existing session returns status 200, user info and sets cookie', async () => {
    const response = await api
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200)
      .expect('Content-type', /application\/json/)
      .expect('set-cookie', /^sid=.+/)

    expect(response.body.name).toEqual(testUser.name)
    expect(response.body.email).toEqual(testUser.email)
  })

  describe('unsuccessful login', () => {
    test('when someone is already logged in, returns status 400 and error message', async () => {
      const response = await api
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .expect('Content-type', /application\/json/)
        .expect('set-cookie', /^sid=.+/)

      const cookie = response.headers['set-cookie']

      const error = await api
        .post('/api/auth/login')
        .set('Cookie', cookie)
        .send({ email: testUser.email, password: testUser.password })
        .expect(400)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when passed empty user returns status 401 and error message', async () => {
      const error = await api
        .post('/api/auth/login')
        .send({})
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when email is missing returns status 401 and error message', async () => {
      const error = await api
        .post('/api/auth/login')
        .send({ password: testUser.password })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when password is missing returns status 401 and error message', async () => {
      const error = await api
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when passed wrong email returns status 401 and error message', async () => {
      const error = await api
        .post('/api/auth/login')
        .send({ email: 'wrong@email.com', password: testUser.password })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when passed wrong password returns status 401 and error message', async () => {
      const error = await api
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongPassword' })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when passed invalid email returns status 401 and error message', async () => {
      // We don't validate the email format when logging in
      const error = await api
        .post('/api/auth/login')
        .send({ email: 'invalid email', password: testUser.password })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when passed empty password returns status 401 and error message', async () => {
      const error = await api
        .post('/api/auth/login')
        .send({ email: testUser.email, password: '' })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when invited user tries to login with empty password returns status 401 and error message', async () => {
      const testInvitedUser = reloadInvitedUser()

      const error = await api
        .post('/api/auth/login')
        .send({ email: testInvitedUser.email, password: '' })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })

    test('when invited user tries to login without password returns status 401 and error message', async () => {
      const testInvitedUser = reloadInvitedUser()

      const error = await api
        .post('/api/auth/login')
        .send({ email: testInvitedUser.email })
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.headers['set-cookie']).toBeUndefined()
      expect(error.body).toHaveProperty('error')
    })
  })
})