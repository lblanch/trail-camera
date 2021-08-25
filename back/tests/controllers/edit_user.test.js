const supertest = require('supertest')
const mongoose = require('mongoose')

const User = require('../../models/user')
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
        .post('/api/auth/login')
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
        .post('/api/auth/login')
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
        .post('/api/auth/login')
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
          .post('/api/auth/login')
          .send({ email: testAdminUser.email, password: testAdminUser.password })
      })

      test('and provided already existing email returns status 400 and error message', async () => {
        testBasicUser = await reloadBasicUser()

        const updatedUser = {
          name: 'New name',
          email: testBasicUser.email
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

describe('Update other use\'s role', () => {
  beforeEach(async () => {
    testBasicUser = await reloadBasicUser()
  })

  test('when admin user is logged and valid userId and role are provided, role is successfully updated and returns status 200', async () => {
    await agentAdmin
      .post('/api/auth/login')
      .send({ email: testAdminUser.email, password: testAdminUser.password })

    const result = await agentAdmin
      .patch(`/api/users/${testBasicUser.id}`)
      .send({ role: 'admin' })
      .expect(200)
      .expect('Content-type', /application\/json/)

    const userAfter = await User.findById(testBasicUser.id)

    expect(userAfter.name).toEqual(testBasicUser.name)
    expect(userAfter.email).toEqual(testBasicUser.email)
    expect(userAfter.role).toEqual('admin')
    expect(userAfter.role).not.toEqual(testBasicUser.role)
    expect(result.body.email).toEqual(testBasicUser.email)
    expect(result.body.name).toEqual(testBasicUser.name)
    expect(result.body.role).toEqual('admin')
    expect(result.body.role).not.toEqual(testBasicUser.role)
  })

  test('valid userId, missing role but other values provided, returns status 400 and error message', async () => {
    await agentAdmin
      .post('/api/auth/login')
      .send({ email: testAdminUser.email, password: testAdminUser.password })

    const updateAttempt = {
      name: 'New name',
      email: 'new@email.com',
      role: 'admin'
    }

    const result = await agentAdmin
      .patch(`/api/users/${testBasicUser.id}`)
      .send(updateAttempt)
      .expect(200)
      .expect('Content-type', /application\/json/)

    const userAfter = await User.findById(testBasicUser.id)

    expect(userAfter.name).toEqual(testBasicUser.name)
    expect(userAfter.email).toEqual(testBasicUser.email)
    expect(userAfter.role).toEqual(updateAttempt.role)
    expect(userAfter.role).not.toEqual(testBasicUser.role)
    expect(userAfter.name).not.toEqual(updateAttempt.name)
    expect(userAfter.email).not.toEqual(updateAttempt.email)
    expect(result.body.email).toEqual(testBasicUser.email)
    expect(result.body.name).toEqual(testBasicUser.name)
    expect(result.body.role).toEqual(updateAttempt.role)
    expect(result.body.role).not.toEqual(testBasicUser.role)
    expect(result.body.name).not.toEqual(updateAttempt.name)
    expect(result.body.email).not.toEqual(updateAttempt.email)
  })

  describe('unsuccessfully when admin user is logged in', () => {
    beforeEach(async () => {
      await agentAdmin
        .post('/api/auth/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })
    })

    test('own userId is provided, returns status 400 and error message', async () => {
      const error = await agentAdmin
        .patch(`/api/users/${testAdminUser.id}`)
        .send({ role: 'user' })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)

      expect(error.body).toHaveProperty('error')
      expect(userAfter.name).toEqual(testAdminUser.name)
      expect(userAfter.email).toEqual(testAdminUser.email)
      expect(userAfter.role).not.toEqual('user')
      expect(userAfter.role).toEqual(testAdminUser.role)
    })

    test('invalid role is provided, returns status 400 and error message', async () => {
      const error = await agentAdmin
        .patch(`/api/users/${testBasicUser.id}`)
        .send({ role: 'basic' })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testBasicUser.id)

      expect(error.body).toHaveProperty('error')
      expect(userAfter.name).toEqual(testBasicUser.name)
      expect(userAfter.email).toEqual(testBasicUser.email)
      expect(userAfter.role).not.toEqual('basic')
      expect(userAfter.role).toEqual(testBasicUser.role)
    })

    test('valid userId and missing role, returns status 400 and error message', async () => {
      const error = await agentAdmin
        .patch(`/api/users/${testBasicUser.id}`)
        .send({})
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testBasicUser.id)

      expect(error.body).toHaveProperty('error')
      expect(userAfter.name).toEqual(testBasicUser.name)
      expect(userAfter.email).toEqual(testBasicUser.email)
      expect(userAfter.role).toEqual(testBasicUser.role)
    })

    test('valid userId, missing role but other values provided, returns status 400 and error message', async () => {
      const updateAttempt = {
        name: 'New name',
        email: 'new@email.com'
      }

      const error = await agentAdmin
        .patch(`/api/users/${testBasicUser.id}`)
        .send(updateAttempt)
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testBasicUser.id)

      expect(error.body).toHaveProperty('error')
      expect(userAfter.name).toEqual(testBasicUser.name)
      expect(userAfter.email).toEqual(testBasicUser.email)
      expect(userAfter.role).toEqual(testBasicUser.role)
    })

    test('invalid userId is provided, returns status 400 and error message', async () => {
      const error = await agentAdmin
        .patch('/api/users/thisIsInvalidId')
        .send({ role: 'admin' })
        .expect(400)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })

    test('valid but non-existing userId is provided, returns status 400 and error message', async () => {
      const error = await agentAdmin
        .patch(`/api/users/${ new mongoose.Types.ObjectId() }`)
        .send({ role: 'admin' })
        .expect(400)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })
  })

  test('unsuccessfully when non-admin user is logged in, returns status 403 and error message', async () => {
    await agentBasic
      .post('/api/auth/login')
      .send({ email: testBasicUser.email, password: testBasicUser.password })

    const error = await agentBasic
      .patch(`/api/users/${ testAdminUser.id }`)
      .send({ role: 'user' })
      .expect(403)
      .expect('Content-type', /application\/json/)

    expect(error.body).toHaveProperty('error')
  })

  test('unsuccessfully when no user is logged in, returns status 401 and error message', async () => {
    const error = await agentLogout
      .patch(`/api/users/${ testBasicUser.id }`)
      .send({ role: 'admin' })
      .expect(401)
      .expect('Content-type', /application\/json/)

    expect(error.body).toHaveProperty('error')
  })
})

