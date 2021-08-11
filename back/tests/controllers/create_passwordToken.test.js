const supertest = require('supertest')

const Token = require('../../models/token')

const { connect, disconnect, clearSessionStore } = require('../../app')
const { clearUsers, clearTokens, reloadAdminUser, reloadPasswordToken, reloadInvitedUser } = require('../helpers/users_helper')

let agentLogout, agentAdmin
let server
let testAdminUser

beforeAll(async () => {
  server = await connect()

  //Create 3 agents, to login different users
  agentLogout = supertest.agent(server)
  agentAdmin = supertest.agent(server)
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

describe ('successful', () => {
  test('When logged out and a valid email belonging to a registered user is provided, creates password token and returns status 200', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()

    const tokenDate = new Date()
    tokenDate.setDate(tokenDate.getDate() + 7)

    await agentLogout
      .post('/api/users/password')
      .send({ email: testAdminUser.email })
      .expect(200)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    const passwordToken = await Token.findOne({ userId: testAdminUser.id, type: 'password' })

    expect(tokenAmountAfter).toEqual(tokenAmountBefore + 1)
    expect(passwordToken).not.toBeNull()
    expect(passwordToken.expireAt.getUTCDay()).toEqual(tokenDate.getUTCDay())
    expect(passwordToken.expireAt.getUTCMonth()).toEqual(tokenDate.getUTCMonth())
    expect(passwordToken.expireAt.getUTCFullYear()).toEqual(tokenDate.getUTCFullYear())
    expect(passwordToken.type).toEqual('password')
    //SHA256 returns 256 bits. Base64 encodes 6 bits into one char. 256/6 = 42.6 => 43
    expect(passwordToken.token).toHaveLength(43)
    //Returned token should be url compatible (encoded with base64url)
    expect(passwordToken.token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  test('When logged out and a valid email belonging to a registered user who already has one password token is provided, deletes old password token, creates new one and returns status 200', async () => {
    // Create password token for admin user
    await reloadPasswordToken(testAdminUser.id)

    const tokenAmountBefore = await Token.estimatedDocumentCount()

    const tokenDate = new Date()
    tokenDate.setDate(tokenDate.getDate() + 7)

    await agentLogout
      .post('/api/users/password')
      .send({ email: testAdminUser.email })
      .expect(200)

    const tokenAmountAfter = await Token.estimatedDocumentCount()
    const passwordToken = await Token.find({ userId: testAdminUser.id, type: 'password' })

    //Amount remains the same, as the old one is deleted then a new one is created.
    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(passwordToken).toHaveLength(1)
    expect(passwordToken[0].expireAt.getUTCDay()).toEqual(tokenDate.getUTCDay())
    expect(passwordToken[0].expireAt.getUTCMonth()).toEqual(tokenDate.getUTCMonth())
    expect(passwordToken[0].expireAt.getUTCFullYear()).toEqual(tokenDate.getUTCFullYear())
    expect(passwordToken[0].type).toEqual('password')
    //SHA256 returns 256 bits. Base64 encodes 6 bits into one char. 256/6 = 42.6 => 43
    expect(passwordToken[0].token).toHaveLength(43)
    //Returned token should be url compatible (encoded with base64url)
    expect(passwordToken[0].token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  test('When logged out and a valid email NOT belonging to any user is provided, does NOT create password token and returns status 200', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()

    await agentLogout
      .post('/api/users/password')
      .send({ email: 'person.not.in.db@email.com' })
      .expect(200)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
  })
})

describe('unsuccessful', () => {
  test('When logged out and an invalid email is provided, returns status 400 and error message', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()

    const error = await agentLogout
      .post('/api/users/password')
      .send({ email: 'invalidEmail.com' })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(error.body).toHaveProperty('error')
  })

  test('When logged out and no email is provided, returns status 400 and error message', async () => {
    const tokenAmountBefore = await Token.estimatedDocumentCount()

    const error = await agentLogout
      .post('/api/users/password')
      .send({})
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(error.body).toHaveProperty('error')
  })

  test('When logged in, returns status 400 and error message', async () => {
    await agentAdmin
      .post('/api/login')
      .send({ email: testAdminUser.email, password: testAdminUser.password })

    const tokenAmountBefore = await Token.estimatedDocumentCount()

    const error = await agentAdmin
      .post('/api/users/password')
      .send({ email: testAdminUser.email })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(error.body).toHaveProperty('error')
  })

  test('When logged out and a valid email belonging to an invited user is provided, returns status 400 and error message', async () => {
    const testInvitedUser = await reloadInvitedUser()
    const tokenAmountBefore = await Token.estimatedDocumentCount()

    const error = await agentLogout
      .post('/api/users/password')
      .send({ email: testInvitedUser.email })
      .expect(400)
      .expect('Content-type', /application\/json/)

    const tokenAmountAfter = await Token.estimatedDocumentCount()
    const passwordToken = await Token.findOne({ userId: testInvitedUser.id, type: 'password' })

    expect(tokenAmountAfter).toEqual(tokenAmountBefore)
    expect(error.body).toHaveProperty('error')
    expect(passwordToken).toBeNull()
  })
})
