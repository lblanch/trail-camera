const supertest = require('supertest')
const mongoose = require('mongoose')

const Token = require('../../models/token')

const { connect, disconnect, clearSessionStore } = require('../../app')
const { clearUsers, clearTokens, reloadAdminUser, reloadInvitedUser, reloadBasicUser, reloadInvitationToken } = require('../helpers/users_helper')

let agentLogout, agentAdmin, agentBasic
let server
let testAdminUser, testInvitedUser

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
  testInvitedUser = await reloadInvitedUser()
})

afterAll(async () => {
  await disconnect()
})

test('When logged out, returns status 401 and error message', async () => {
  const tokenAmountBefore = await Token.estimatedDocumentCount()

  const error = await agentLogout
    .post('/api/users/invitation')
    .send({ user: testInvitedUser.id })
    .expect(401)

  const tokenAmountAfter = await Token.estimatedDocumentCount()

  const invitationToken = await Token.find({ userId: testInvitedUser.id, type: 'invitation' })

  expect(tokenAmountAfter).toEqual(tokenAmountBefore)
  expect(invitationToken).toHaveLength(0)
  expect(error.body).toHaveProperty('error')
})

test('When logged in as a non admin user, returns status 403 and error message', async () => {
  const testBasicUser = await reloadBasicUser()

  await agentBasic
    .post('/api/auth/login')
    .send({ email: testBasicUser.email, password: testBasicUser.password })

  const tokenAmountBefore = await Token.estimatedDocumentCount()

  const error = await agentBasic
    .post('/api/users/invitation')
    .send({ user: testInvitedUser.id })
    .expect(403)

  const tokenAmountAfter = await Token.estimatedDocumentCount()

  const invitationToken = await Token.find({ userId: testInvitedUser.id, type: 'invitation' })

  expect(tokenAmountAfter).toEqual(tokenAmountBefore)
  expect(invitationToken).toHaveLength(0)
  expect(error.body).toHaveProperty('error')
})

describe('When admin user is logged in', () => {
  beforeEach(async () => {
    await agentAdmin
      .post('/api/auth/login')
      .send({ email: testAdminUser.email, password: testAdminUser.password })
  })

  describe ('successfully creates invitation token', () => {
    test('Valid userId belonging to an invited user is provided, returns status 201', async () => {
      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const tokenDate = new Date()
      tokenDate.setDate(tokenDate.getDate() + 7)

      await agentAdmin
        .post('/api/users/invitation')
        .send({ user: testInvitedUser.id })
        .expect(201)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      const invitationToken = await Token.find({ userId: testInvitedUser.id, type: 'invitation' })

      expect(tokenAmountAfter).toEqual(tokenAmountBefore + 1)
      expect(invitationToken).toHaveLength(1)
      expect(invitationToken[0].expireAt.getUTCDay()).toEqual(tokenDate.getUTCDay())
      expect(invitationToken[0].expireAt.getUTCMonth()).toEqual(tokenDate.getUTCMonth())
      expect(invitationToken[0].expireAt.getUTCFullYear()).toEqual(tokenDate.getUTCFullYear())
      expect(invitationToken[0].type).toEqual('invitation')
      //SHA256 returns 256 bits. Base64 encodes 6 bits into one char. 256/6 = 42.6 => 43
      expect(invitationToken[0].token).toHaveLength(43)
      //Returned token should be url compatible (encoded with base64url)
      expect(invitationToken[0].token).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    test('Valid userId belonging to an invited user who already has an invitation token is provided, deletes old token and returns status 201', async () => {
      // Create previous invitation token
      await reloadInvitationToken(testInvitedUser.id)

      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const tokenDate = new Date()
      tokenDate.setDate(tokenDate.getDate() + 7)

      await agentAdmin
        .post('/api/users/invitation')
        .send({ user: testInvitedUser.id })
        .expect(201)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      const invitationToken = await Token.find({ userId: testInvitedUser.id, type: 'invitation' })

      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(invitationToken).toHaveLength(1)
      expect(invitationToken[0].expireAt.getUTCDay()).toEqual(tokenDate.getUTCDay())
      expect(invitationToken[0].expireAt.getUTCMonth()).toEqual(tokenDate.getUTCMonth())
      expect(invitationToken[0].expireAt.getUTCFullYear()).toEqual(tokenDate.getUTCFullYear())
      expect(invitationToken[0].type).toEqual('invitation')
      //SHA256 returns 256 bits. Base64 encodes 6 bits into one char. 256/6 = 42.6 => 43
      expect(invitationToken[0].token).toHaveLength(43)
      //Returned token should be url compatible (encoded with base64url)
      expect(invitationToken[0].token).toMatch(/^[A-Za-z0-9_-]+$/)
    })
  })

  describe('unsuccessful', () => {
    test('Valid userId belonging to the logged in user is provided, returns status 400 and error message', async () => {
      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const error = await agentAdmin
        .post('/api/users/invitation')
        .send({ user: testAdminUser.id })
        .expect(400)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      const invitationToken = await Token.find({ userId: testAdminUser.id, type: 'invitation' })

      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(invitationToken).toHaveLength(0)
      expect(error.body).toHaveProperty('error')
    })

    test('Valid userId belonging to a registered in user is provided, returns status 400 and error message', async () => {
      const testBasicUser = await reloadBasicUser()

      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const error = await agentAdmin
        .post('/api/users/invitation')
        .send({ user: testBasicUser.id })
        .expect(400)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      const invitationToken = await Token.find({ userId: testBasicUser.id, type: 'invitation' })

      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(invitationToken).toHaveLength(0)
      expect(error.body).toHaveProperty('error')
    })

    test('Valid userId NOT belonging to any user is provided, returns status 400 and error message', async () => {
      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const error = await agentAdmin
        .post('/api/users/invitation')
        .send({ user: new mongoose.Types.ObjectId() })
        .expect(400)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(error.body).toHaveProperty('error')
    })

    test('invalid userId is provided, returns status 400 and error message', async () => {
      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const error = await agentAdmin
        .post('/api/users/invitation')
        .send({ user: 'invalidUserId' })
        .expect(400)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(error.body).toHaveProperty('error')
    })

    test('No userId is provided, returns status 400 and error message', async () => {
      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const error = await agentAdmin
        .post('/api/users/invitation')
        .send({ })
        .expect(400)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(error.body).toHaveProperty('error')
    })

    test('Empty userId is provided, returns status 400 and error message', async () => {
      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const error = await agentAdmin
        .post('/api/users/invitation')
        .send({ user: '' })
        .expect(400)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      expect(tokenAmountAfter).toEqual(tokenAmountBefore)
      expect(error.body).toHaveProperty('error')
    })
  })
})