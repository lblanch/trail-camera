const supertest = require('supertest')

const Token = require('../../models/token')
const User = require('../../models/user')
const { comparePasswordHash } = require('../../utils/authentication')

const { connect, disconnect, clearSessionStore } = require('../../app')
const { clearUsers, clearTokens, reloadAdminUser, reloadBasicUser, reloadPasswordToken, reloadInvitedUser } = require('../helpers/users_helper')

let agentLogout, agentAdmin, agentBasic
let server
let testAdminUser, testBasicUser
let passwordToken

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
  testAdminUser = await reloadAdminUser()
})

afterAll(async () => {
  await disconnect()
})

describe('When user is logged in', () => {
  beforeEach(async () => {
    await agentAdmin
      .post('/api/auth/login')
      .send({ email: testAdminUser.email, password: testAdminUser.password })
  })

  test('correct old password and valid new passwords are provided, password is successfully updated and returns status 200', async () => {
    const newPassword = 'newPasswordForAdmin'
    const userBefore = await User.findById(testAdminUser.id)

    await agentAdmin
      .patch('/api/users/password')
      .send({ password: testAdminUser.password, newPassword: newPassword })
      .expect(200)

    const userAfter = await User.findById(testAdminUser.id)
    const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

    expect(userAfter.passwordHash).not.toEqual(userBefore.passwordHash)
    expect(passwordComparison).toBe(true)
  })

  describe('not successful', () => {
    test('incorrect old password and valid new passwords are provided, returns status 400 and error message', async () => {
      const newPassword = 'newPasswordForAdmin'
      const userBefore = await User.findById(testAdminUser.id)

      const error = await agentAdmin
        .patch('/api/users/password')
        .send({ password: 'notAdminUserPassword', newPassword: newPassword })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)
      const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

      expect(error.body).toHaveProperty('error')
      expect(passwordComparison).toBe(false)
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
    })

    test('valid new password provided but old password missing, returns status 400 and error message', async () => {
      const newPassword = 'newPasswordForAdmin'
      const userBefore = await User.findById(testAdminUser.id)

      const error = await agentAdmin
        .patch('/api/users/password')
        .send({ newPassword: newPassword })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)
      const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

      expect(error.body).toHaveProperty('error')
      expect(passwordComparison).toBe(false)
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
    })

    test('correct old password and invalid new password are provided, returns status 400 and error message', async () => {
      const newPassword = '2short'
      const userBefore = await User.findById(testAdminUser.id)

      const error = await agentAdmin
        .patch('/api/users/password')
        .send({ password: testAdminUser.password, newPassword: newPassword })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)
      const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

      expect(error.body).toHaveProperty('error')
      expect(passwordComparison).toBe(false)
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
    })

    test('correct old password is provided but new password is empty, returns status 400 and error message', async () => {
      const newPassword = ''
      const userBefore = await User.findById(testAdminUser.id)

      const error = await agentAdmin
        .patch('/api/users/password')
        .send({ password: testAdminUser.password, newPassword: newPassword })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)
      const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

      expect(error.body).toHaveProperty('error')
      expect(passwordComparison).toBe(false)
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
    })

    test('correct old password is provided but new password is missing, returns status 400 and error message', async () => {
      const userBefore = await User.findById(testAdminUser.id)

      const error = await agentAdmin
        .patch('/api/users/password')
        .send({ password: testAdminUser.password })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)

      expect(error.body).toHaveProperty('error')
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
    })

    test('no passwords are provided, returns status 400 and error message', async () => {
      const userBefore = await User.findById(testAdminUser.id)

      const error = await agentAdmin
        .patch('/api/users/password')
        .send({})
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)

      expect(error.body).toHaveProperty('error')
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
    })

    test('password token, correct old password and new password are provided, returns status 400 and error message', async () => {
      await clearTokens()
      passwordToken = await reloadPasswordToken(testAdminUser.id)

      const newPassword = 'newPasswordForAdmin'
      const userBefore = await User.findById(testAdminUser.id)

      const error = await agentAdmin
        .patch(`/api/users/password/${passwordToken.token}`)
        .send({ password: testAdminUser.password, newPassword: newPassword })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAfter = await User.findById(testAdminUser.id)
      const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

      expect(error.body).toHaveProperty('error')
      expect(passwordComparison).toBe(false)
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
    })
  })
})

test('When basic user is logged in and correct old password and valid new passwords are provided, password is successfully updated and returns status 200', async () => {
  testBasicUser = await reloadBasicUser()
  await agentBasic
    .post('/api/auth/login')
    .send({ email: testBasicUser.email, password: testBasicUser.password })

  const newPassword = 'newPasswordForAdmin'
  const userBefore = await User.findById(testBasicUser.id)

  await agentBasic
    .patch('/api/users/password')
    .send({ password: testBasicUser.password, newPassword: newPassword })
    .expect(200)

  const userAfter = await User.findById(testBasicUser.id)
  const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

  expect(userAfter.passwordHash).not.toEqual(userBefore.passwordHash)
  expect(passwordComparison).toBe(true)
})

describe('When user is logged out', () => {
  beforeEach(async () => {
    await clearTokens()
    passwordToken = await reloadPasswordToken(testAdminUser.id)
  })

  test('valid token and valid new password are provided, password is updated successfully, token is deleted and returns status 200', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()
    const newPassword = 'newPasswordForTokenUser'
    const userBefore = await User.findById(testAdminUser.id)

    await agentLogout
      .patch(`/api/users/password/${passwordToken.token}`)
      .send({ newPassword: newPassword })
      .expect(200)

    const tokenAmountAfter = await Token.estimatedDocumentCount()
    const passwordTokenAfter = await Token.findOne({ userId: testAdminUser.id, type: 'password' })
    const userAfter = await User.findById(testAdminUser.id)
    const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

    expect(userAfter.passwordHash).not.toEqual(userBefore.passwordHash)
    expect(passwordComparison).toBe(true)
    expect(tokenAmountAfter).toEqual(tokenAmountBefore - 1)
    expect(passwordTokenAfter).toBeNull()
  })

  describe('unsuccessful', () => {
    test('invalid token and valid new password are provided, returns status 400 and error message', async () => {
      const tokenAmountBefore = await Token.estimatedDocumentCount()
      const newPassword = 'newPasswordForTokenUser'

      const error = await agentLogout
        .patch('/api/users/password/justAnInvalidToken')
        .send({ newPassword: newPassword })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      expect(error.body).toHaveProperty('error')
      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    })

    test('valid token and invalid new password are provided, returns status 400 and error message', async () => {
      const userBefore = await User.findById(testAdminUser.id)
      const tokenAmountBefore = await Token.estimatedDocumentCount()
      const newPassword = '2short'

      const error = await agentLogout
        .patch(`/api/users/password/${passwordToken.token}`)
        .send({ newPassword: newPassword })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const tokenAmountAfter = await Token.estimatedDocumentCount()
      const passwordTokenAfter = await Token.findOne({ userId: testAdminUser.id, type: 'password' })
      const userAfter = await User.findById(testAdminUser.id)
      const passwordComparison = await comparePasswordHash(newPassword, userAfter.passwordHash)

      expect(error.body).toHaveProperty('error')
      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(passwordComparison).toBe(false)
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
      expect(passwordTokenAfter.token).toEqual(passwordToken.token)
    })

    test('valid token is provided but new password is missing, returns status 400 and error message', async () => {
      const userBefore = await User.findById(testAdminUser.id)
      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const error = await agentLogout
        .patch(`/api/users/password/${passwordToken.token}`)
        .send({})
        .expect(400)
        .expect('Content-type', /application\/json/)

      const tokenAmountAfter = await Token.estimatedDocumentCount()
      const passwordTokenAfter = await Token.findOne({ userId: testAdminUser.id, type: 'password' })
      const userAfter = await User.findById(testAdminUser.id)

      expect(error.body).toHaveProperty('error')
      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(userAfter.passwordHash).toEqual(userBefore.passwordHash)
      expect(passwordTokenAfter.token).toEqual(passwordToken.token)
    })
  })
})

test('When user is logged out, valid token and valid new password are provided but user is not registered, returns status 400 and error message', async () => {
  await clearTokens()
  const testInvitedUser = await reloadInvitedUser()
  passwordToken = await reloadPasswordToken(testInvitedUser.id)

  const tokenAmountBefore = await Token.estimatedDocumentCount()
  const newPassword = 'newPasswordForTokenUser'

  const error = await agentLogout
    .patch(`/api/users/password/${passwordToken.token}`)
    .send({ newPassword: newPassword })
    .expect(400)
    .expect('Content-type', /application\/json/)

  const tokenAmountAfter = await Token.estimatedDocumentCount()
  const passwordTokenAfter = await Token.findOne({ userId: testInvitedUser.id, type: 'password' })
  const userAfter = await User.findById(testInvitedUser.id)

  expect(error.body).toHaveProperty('error')
  expect(tokenAmountAfter).toEqual(tokenAmountBefore)
  expect(userAfter.passwordHash).toBeUndefined()
  expect(passwordTokenAfter.token).toEqual(passwordToken.token)
})
