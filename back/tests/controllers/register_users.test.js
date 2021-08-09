const supertest = require('supertest')

const Token = require('../../models/token')
const User = require('../../models/user')

const { connect, disconnect, clearSessionStore } = require('../../app')
const { reloadInvitedUser, clearUsers, clearTokens, reloadInvitationToken, reloadAdminUser } = require('../helpers/users_helper')

let api
let server
let testInvitedUser
let invitationToken

beforeAll(async () => {
  server = await connect()

  api = supertest(server)
})

beforeEach(async () => {
  await clearSessionStore()
  await clearUsers()
  await clearTokens()
  testInvitedUser = await reloadInvitedUser()
  invitationToken = await reloadInvitationToken(testInvitedUser.id)
})

afterAll(async () => {
  await disconnect()
})

test('Register user with a valid invite token returns status 200', async () => {
  const tokenAmountBefore = await Token.estimatedDocumentCount()
  await api
    .patch(`/api/users/registration/${invitationToken.token}`)
    .send({ password: testInvitedUser.password })
    .expect(200)

  const tokenAmountAfter = await Token.estimatedDocumentCount()

  const invitationTokenAfter = await Token.findOne({ userId: testInvitedUser.id, type: 'invitation' })
  const userAfter = await User.findById(testInvitedUser.id)

  expect(tokenAmountAfter).toEqual(tokenAmountBefore - 1)
  expect(invitationTokenAfter).toBeNull()
  expect(userAfter).toHaveProperty('passwordHash')
})

describe('unsuccessful user registration', () => {
  test('when not passing invitation token returns status 400 and error message', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()
    const error = await api
      .patch('/api/users/registration')
      .send({ password: testInvitedUser.password })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    const userAfter = await User.findById(testInvitedUser.id)

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(userAfter.passwordHash).toBeUndefined()
    expect(error.body).toHaveProperty('error')
  })

  test('when passing invalid token returns status 400 and error message', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()
    const error = await api
      .patch('/api/users/registration/randomstringwhichisnotatoken')
      .send({ password: testInvitedUser.password })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    const userAfter = await User.findById(testInvitedUser.id)

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(userAfter.passwordHash).toBeUndefined()
    expect(error.body).toHaveProperty('error')
  })

  test('when sending empty request returns status 400 and error message', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()
    const error = await api
      .patch(`/api/users/registration/${invitationToken.token}`)
      .send()
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    const userAfter = await User.findById(testInvitedUser.id)

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(userAfter.passwordHash).toBeUndefined()
    expect(error.body).toHaveProperty('error')
  })

  test('when sending empty string as password returns status 400 and error message', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()
    const error = await api
      .patch(`/api/users/registration/${invitationToken.token}`)
      .send({ password: '' })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    const userAfter = await User.findById(testInvitedUser.id)

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(userAfter.passwordHash).toBeUndefined()
    expect(error.body).toHaveProperty('error')
  })

  test('when sending password too short returns status 400 and error message', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()
    const error = await api
      .patch(`/api/users/registration/${invitationToken.token}`)
      .send({ password: 'short' })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    const userAfter = await User.findById(testInvitedUser.id)

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(userAfter.passwordHash).toBeUndefined()
    expect(error.body).toHaveProperty('error')
  })

  test('when sending password with invalid character returns status 400 and error message', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()
    const error = await api
      .patch(`/api/users/registration/${invitationToken.token}`)
      .send({ password: 'åäeéöäådasdfasdadsfasäåäööå' })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    const userAfter = await User.findById(testInvitedUser.id)

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(userAfter.passwordHash).toBeUndefined()
    expect(error.body).toHaveProperty('error')
  })

  test('when someone is already logged in, returns status 400 and error message', async () => {
    const testAdminUser = await reloadAdminUser()
    const response = await api
      .post('/api/login')
      .send({ email: testAdminUser.email, password: testAdminUser.password })
      .expect(200)
      .expect('Content-type', /application\/json/)
      .expect('set-cookie', /^sid=.+/)

    const cookie = response.headers['set-cookie']

    const tokenAmountBefore = await Token.estimatedDocumentCount()

    const error = await api
      .patch(`/api/users/registration/${invitationToken.token}`)
      .set('Cookie', cookie)
      .send({ password: testInvitedUser.password })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    const userAfter = await User.findById(testInvitedUser.id)

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(userAfter.passwordHash).toBeUndefined()
    expect(error.body).toHaveProperty('error')
  })
})