//require('leaked-handles')
const supertest = require('supertest')

const User = require('../../models/user')
const Token = require('../../models/token')
const { handleTestConnection, clearSessionStore, handleTestDisconnection } = require('../helpers/test_helper')
const { reloadAdminUser, reloadBasicUser, clearUsers, clearTokens } = require('../helpers/users_helper')

let agentAdmin, agentBasic, agentLogout
let server
let testAdminUser, testBasicUser

const newUser = {
  name: 'Person2',
  email: 'person2@email.com',
  role: 'admin',
}

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
  await clearTokens()
  testAdminUser = await reloadAdminUser()
})

afterAll(async () => {
  await handleTestDisconnection(server)
})

test('Create user with no user logged in returns status 401 and error message', async () => {
  const userAmountBefore = await User.estimatedDocumentCount()
  const error = await agentLogout
    .post('/api/users')
    .send(newUser)
    .expect(401)
    .expect('Content-type', /application\/json/)

  const userAmountAfter = await User.estimatedDocumentCount()

  expect(error.body).toHaveProperty('error')
  expect(userAmountAfter).toEqual(userAmountBefore)
})

test('Create user with non admin user logged in returns status 403 and error message', async () => {
  //create basic user and login
  testBasicUser = await reloadBasicUser()
  await agentBasic
    .post('/api/login')
    .send({ email: testBasicUser.email, password: testBasicUser.password })

  const userAmountBefore = await User.estimatedDocumentCount()
  const error = await agentBasic
    .post('/api/users')
    .send(newUser)
    .expect(403)
    .expect('Content-type', /application\/json/)

  const userAmountAfter = await User.estimatedDocumentCount()

  expect(error.body).toHaveProperty('error')
  expect(userAmountAfter).toEqual(userAmountBefore)
})

describe('Create user with admin user logged in', () => {
  beforeEach(async () => {
    //login with Admin user
    await agentAdmin
      .post('/api/login')
      .send({ email: testAdminUser.email, password: testAdminUser.password })
  })

  describe('sucessful user creation', () => {
    test('when passed valid data creates invitation token and returns status 201', async () => {
      const tokenAmountBefore = await Token.estimatedDocumentCount()

      const tokenDate = new Date()
      tokenDate.setDate(tokenDate.getDate() + 7)

      const response = await agentAdmin
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-type', /application\/json/)

      const tokenAmountAfter = await Token.estimatedDocumentCount()

      const invitationToken = await Token.findOne({ userId: response.body._id })

      expect(tokenAmountAfter).toEqual(tokenAmountBefore + 1)
      expect(invitationToken).not.toBeNull()
      expect(invitationToken.expireAt.getUTCDay()).toEqual(tokenDate.getUTCDay())
      expect(invitationToken.expireAt.getUTCMonth()).toEqual(tokenDate.getUTCMonth())
      expect(invitationToken.expireAt.getUTCFullYear()).toEqual(tokenDate.getUTCFullYear())
      expect(invitationToken.type).toEqual('invitation')
      //SHA256 returns 256 bits. Base64 encodes 6 bits into one char. 256/6 = 42.6 => 43
      expect(invitationToken.token).toHaveLength(43)
      //Returned token should be url compatible (enconded with base64url)
      expect(invitationToken.token).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    test('when passed valid data returns valid user and status 201', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const response = await agentAdmin
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(response.body._id).toBeDefined()
      expect(response.body.name).toEqual(newUser.name)
      expect(response.body.email).toEqual(newUser.email)
      expect(response.body.role).toEqual(newUser.role)
      expect(response.body.createdBy).toEqual(testAdminUser.email)
      expect(userAmountAfter).toEqual(userAmountBefore + 1)
    })

    test('when missing role returns valid user with role "user" and status 201', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const response = await agentAdmin
        .post('/api/users')
        .send({ name: newUser.name, email: newUser.email })
        .expect(201)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(response.body._id).toBeDefined()
      expect(response.body.name).toEqual(newUser.name)
      expect(response.body.email).toEqual(newUser.email)
      expect(response.body.role).toEqual('user')
      expect(response.body.createdBy).toEqual(testAdminUser.email)
      expect(userAmountAfter).toEqual(userAmountBefore + 1)
    })

    test('when passed password or hash it is ignored and returns valid user and status 201', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const response = await agentAdmin
        .post('/api/users')
        .send({ ...newUser, password: 'secret', passwordHash: 'thisissupposedtobeahash' })
        .expect(201)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(response.body._id).toBeDefined()
      expect(response.body.name).toEqual(newUser.name)
      expect(response.body.email).toEqual(newUser.email)
      expect(response.body.role).toEqual(newUser.role)
      expect(response.body.createdBy).toEqual(testAdminUser.email)
      expect(response.body.passwordHash).toBeUndefined()
      expect(userAmountAfter).toEqual(userAmountBefore + 1)
    })

    test('when passed createdBy, createdAt or updatedAt fields they are ignored and returns valid user and status 201', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const wrongCreatedBy = 'wrongEmail@wrong.email'
      const wrongCreatedUpdatedAt = new Date()
      wrongCreatedUpdatedAt.setDate(wrongCreatedUpdatedAt.getDate() - 7)

      const response = await agentAdmin
        .post('/api/users')
        .send({ ...newUser, createdBy: wrongCreatedBy, createdAt: wrongCreatedUpdatedAt, updatedAt: wrongCreatedUpdatedAt })
        .expect(201)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(response.body._id).toBeDefined()
      expect(response.body.name).toEqual(newUser.name)
      expect(response.body.email).toEqual(newUser.email)
      expect(response.body.role).toEqual(newUser.role)
      expect(response.body.createdBy).not.toEqual(wrongCreatedBy)
      expect(response.body.createdAt).not.toEqual(wrongCreatedUpdatedAt.toJSON())
      expect(response.body.updatedAt).not.toEqual(wrongCreatedUpdatedAt.toJSON())
      expect(userAmountAfter).toEqual(userAmountBefore + 1)
    })
  })

  describe('unsuccessful user creation', () => {
    test('when missing email returns status 400 and error message', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const error = await agentAdmin
        .post('/api/users')
        .send({ name: newUser.name, role: newUser.role })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(error.body).toHaveProperty('error')
      expect(userAmountAfter).toEqual(userAmountBefore)
    })

    test('when missing name returns status 400 and error message', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const error = await agentAdmin
        .post('/api/users')
        .send({ email: newUser.email, role: newUser.role })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(error.body).toHaveProperty('error')
      expect(userAmountAfter).toEqual(userAmountBefore)
    })

    test('when passed existing user email returns status 400 and error message', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const error = await agentAdmin
        .post('/api/users')
        .send({ ...newUser, email: testAdminUser.email })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(error.body).toHaveProperty('error')
      expect(userAmountAfter).toEqual(userAmountBefore)
    })

    test('when passed invalid email returns status 400 and error message', async () => {
      const userAmountBefore = await User.estimatedDocumentCount()
      const error = await agentAdmin
        .post('/api/users')
        .send({ ...newUser, email: 'invalidEmail' })
        .expect(400)
        .expect('Content-type', /application\/json/)

      const userAmountAfter = await User.estimatedDocumentCount()

      expect(error.body).toHaveProperty('error')
      expect(userAmountAfter).toEqual(userAmountBefore)
    })
  })
})

//TODO: send invitation when creating user
// - send email with link with token.

//TODO: finalize user creation
// - users need to accept the invitation by clicking the link in email and creating a new password when prompted
// - same system could be used to "remember password"

//TODO: for a created user thar is not finalized, it should be possible to resend invitation at any point
// - it should invalidate the previous existing invitation
// - not possible if the user is finalized

//TODO: users to be able to recover their password
// - when logged out, by providing a valid email, they will receive a link to generate a new password
// - from profile page, by pressing a button they can send the same email