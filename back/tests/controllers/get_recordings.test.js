const supertest = require('supertest')

const { handleTestConnection, clearSessionStore, handleTestDisconnection } = require('../helpers/connection_helper')
const { reloadAdminUser, reloadBasicUser, clearUsers } = require('../helpers/users_helper')
const { initialRecordings, reloadRecordings } = require('../helpers/recordings_helper')

let agentAdmin, agentBasic, agentLogout
let server
let testAdminUser, testBasicUser

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
  await reloadRecordings()
})

afterAll(async () => {
  await handleTestDisconnection(server)
})

test('Get recordings when logged out returns status 401 and error message', async () => {
  const error = await agentLogout
    .get('/api/recordings')
    .expect(401)
    .expect('Content-type',  /application\/json/)

  expect(error.body).toBeDefined()
})

test('Get recordings as non admin returns status 200 and list of recordings', async () => {
  //create and login Basic user
  testBasicUser = await reloadBasicUser()

  await agentBasic
    .post('/api/login')
    .send({ email: testBasicUser.email, password: testBasicUser.password })

  const recordings = await agentBasic
    .get('/api/recordings')
    .expect(200)
    .expect('Content-type',  /application\/json/)

  expect(recordings.body).toHaveLength(initialRecordings.length)
  expect(recordings.body[0]).toHaveProperty('_id')
  expect(recordings.body[0]).toHaveProperty('date')
  expect(recordings.body[0]).toHaveProperty('emailDeliveryDate')
  expect(recordings.body[0]).toHaveProperty('sentTo')
  expect(recordings.body[0]).toHaveProperty('sentFrom')
  expect(recordings.body[0]).toHaveProperty('subject')
  expect(recordings.body[0]).toHaveProperty('mediaType')
  expect(recordings.body[0]).toHaveProperty('mediaThumbnailURL')
  expect(recordings.body[0]).toHaveProperty('mediaURL')
  expect(recordings.body[0]).toHaveProperty('createdAt')
  expect(recordings.body[0]).toHaveProperty('updatedAt')
})

test('Get recordings as admin returns status 200 and list of recordings', async () => {
  //login with Admin user
  testAdminUser = await reloadAdminUser()

  await agentAdmin
    .post('/api/login')
    .send({ email: testAdminUser.email, password: testAdminUser.password })

  const recordings = await agentAdmin
    .get('/api/recordings')
    .expect(200)
    .expect('Content-type',  /application\/json/)

  expect(recordings.body).toHaveLength(initialRecordings.length)
  expect(recordings.body[0]).toHaveProperty('_id')
  expect(recordings.body[0]).toHaveProperty('date')
  expect(recordings.body[0]).toHaveProperty('emailDeliveryDate')
  expect(recordings.body[0]).toHaveProperty('sentTo')
  expect(recordings.body[0]).toHaveProperty('sentFrom')
  expect(recordings.body[0]).toHaveProperty('subject')
  expect(recordings.body[0]).toHaveProperty('mediaType')
  expect(recordings.body[0]).toHaveProperty('mediaThumbnailURL')
  expect(recordings.body[0]).toHaveProperty('mediaURL')
  expect(recordings.body[0]).toHaveProperty('createdAt')
  expect(recordings.body[0]).toHaveProperty('updatedAt')
})

//TODO: test pagination