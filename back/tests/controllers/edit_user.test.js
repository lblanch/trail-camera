const supertest = require('supertest')

const User = require('../../models/user')
//const Token = require('../../models/token')
const { connect, disconnect, clearSessionStore } = require('../../app')
const { reloadAdminUser, reloadBasicUser, clearUsers, clearTokens } = require('../helpers/users_helper')

let agentAdmin, agentBasic, agentLogout
let server
let testAdminUser, testBasicUser

beforeAll(async () => {
  server = await connect()

  //Create 3 agents, to login different users
  agentLogout = supertest.agent(server)
  agentAdmin = supertest.agent(server)
  agentBasic = supertest.agent(server)
})

beforeEach(async () => {
  await clearSessionStore()
  await clearUsers()
  await clearTokens()
  testAdminUser = await reloadAdminUser()
})

afterAll(async () => {
  await disconnect()
})

describe('Update own information', () => {
  describe('successfully', () => {
    test('When logged in as admin and provided valid data, user profile is updated and returns status 200', async () => {
      await agentAdmin
        .post('/api/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })

      const updatedUser = {
        name: 'New name',
        email: 'new@email.com'
      }

      const result = await agentAdmin
        .patch('/api/users')
        .send(updatedUser)
        .expect(200)
        .expect('Content-type', /application\/json/)

      expect(result.body.name).toEqual(updatedUser.name)
      expect(result.body.email).toEqual(updatedUser.email)
    })

    test('When logged in as basic user and provided valid data, user profile is updated and returns status 200', async () => {
      testBasicUser = await reloadBasicUser()

      await agentBasic
        .post('/api/login')
        .send({ email: testBasicUser.email, password: testBasicUser.password })

      const updatedUser = {
        name: 'New name',
        email: 'new@email.com'
      }

      const result = await agentBasic
        .patch('/api/users')
        .send(updatedUser)
        .expect(200)
        .expect('Content-type', /application\/json/)

      expect(result.body.name).toEqual(updatedUser.name)
      expect(result.body.email).toEqual(updatedUser.email)
    })

    test('When logged in and provided name, email and other fields, only name and email are updated and returns status 200', async () => {
      await agentAdmin
        .post('/api/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })

      const updatedUser = {
        name: 'New name',
        email: 'new@email.com',
        role: 'basic',
        passwordHash: 'justapasswordhash'
      }

      const result = await agentAdmin
        .patch('/api/users')
        .send(updatedUser)
        .expect(200)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)

      expect(result.body.name).toEqual(updatedUser.name)
      expect(result.body.email).toEqual(updatedUser.email)
      expect(result.body).not.toHaveProperty('role')
      expect(result.body).not.toHaveProperty('passwordHash')
      expect(userAfter.role).toEqual(testAdminUser.role)
      expect(userAfter.role).not.toEqual(updatedUser.role)
      expect(userAfter.passwordHash).not.toEqual(updatedUser.passwordHash)
    })
  })

  describe('not successfully', () => {
    test('When logged out returns status 401 and error message', async () => {
      const updatedUser = {
        name: 'New name',
        email: 'new@email.com'
      }

      const error = await agentLogout
        .patch('/api/users')
        .send(updatedUser)
        .expect(401)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })

    describe('when logged in', () => {
      beforeEach(async () => {
        await agentAdmin
          .post('/api/login')
          .send({ email: testAdminUser.email, password: testAdminUser.password })
      })

      test('and provided invalid email returns status 400 and error message', async () => {
        const updatedUser = {
          name: 'New name',
          email: 'invalid-email.com'
        }

        const error = await agentAdmin
          .patch('/api/users')
          .send(updatedUser)
          .expect(400)
          .expect('Content-type', /application\/json/)

        const userAfter = await User.findById(testAdminUser.id)

        expect(error.body).toHaveProperty('error')
        expect(userAfter.name).not.toEqual(updatedUser.name)
        expect(userAfter.email).not.toEqual(updatedUser.email)
        expect(userAfter.name).toEqual(testAdminUser.name)
        expect(userAfter.email).toEqual(testAdminUser.email)
      })

      test('and missing email returns status 400 and error message', async () => {
        const updatedUser = {
          name: 'New name'
        }

        const error = await agentAdmin
          .patch('/api/users')
          .send(updatedUser)
          .expect(400)
          .expect('Content-type', /application\/json/)

        const userAfter = await User.findById(testAdminUser.id)

        expect(error.body).toHaveProperty('error')
        expect(userAfter.name).not.toEqual(updatedUser.name)
        expect(userAfter.email).not.toEqual(updatedUser.email)
        expect(userAfter.name).toEqual(testAdminUser.name)
        expect(userAfter.email).toEqual(testAdminUser.email)
      })

      test('and missing name returns status 400 and error message', async () => {
        const updatedUser = {
          email: 'new@email.com'
        }

        const error = await agentAdmin
          .patch('/api/users')
          .send(updatedUser)
          .expect(400)
          .expect('Content-type', /application\/json/)

        const userAfter = await User.findById(testAdminUser.id)

        expect(error.body).toHaveProperty('error')
        expect(userAfter.name).not.toEqual(updatedUser.name)
        expect(userAfter.email).not.toEqual(updatedUser.email)
        expect(userAfter.name).toEqual(testAdminUser.name)
        expect(userAfter.email).toEqual(testAdminUser.email)
      })

      test('and missing name and email returns status 400 and error message', async () => {
        const error = await agentAdmin
          .patch('/api/users')
          .send({})
          .expect(400)
          .expect('Content-type', /application\/json/)

        const userAfter = await User.findById(testAdminUser.id)

        expect(error.body).toHaveProperty('error')
        expect(userAfter.name).toEqual(testAdminUser.name)
        expect(userAfter.email).toEqual(testAdminUser.email)
      })
    })
  })

})

