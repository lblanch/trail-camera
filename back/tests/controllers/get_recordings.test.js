const supertest = require('supertest')

const { connect, disconnect, clearSessionStore } = require('../../app')
const { reloadAdminUser, reloadBasicUser, clearUsers } = require('../helpers/users_helper')
const { initialRecordings, reloadRecordings, clearRecordings } = require('../helpers/recordings_helper')

let agentAdmin, agentBasic, agentLogout
let server
let testAdminUser, testBasicUser

beforeAll(async () => {
  server = await connect()

  //Create 3 agents, to login different users
  agentLogout = supertest.agent(server)
  agentAdmin = supertest.agent(server)
  agentBasic = supertest.agent(server)

  await clearSessionStore()
  await clearUsers()
  await clearRecordings()

  //create and login Basic user
  testBasicUser = await reloadBasicUser()
  await agentBasic
    .post('/api/login')
    .send({ email: testBasicUser.email, password: testBasicUser.password })

  //login with Admin user
  testAdminUser = await reloadAdminUser()
  await agentAdmin
    .post('/api/login')
    .send({ email: testAdminUser.email, password: testAdminUser.password })
})

afterAll(async () => {
  await disconnect()
})

describe('The collection is empty', () => {
  test('Get recordings without pagination when logged out returns status 401 and error message', async () => {
    const error = await agentLogout
      .get('/api/recordings')
      .expect(401)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('Get recordings with pagination when logged out returns status 401 and error message', async () => {
    const error = await agentLogout
      .get('/api/recordings/1')
      .expect(401)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('Get recordings without pagination when logged in returns status 200 and property count = 0', async () => {
    const recordings = await agentBasic
      .get('/api/recordings')
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
    expect(recordings.body).not.toHaveProperty('earliestTime')
    expect(recordings.body).not.toHaveProperty('createdAt')
    expect(recordings.body).not.toHaveProperty('updatedAt')
  })

  test('Get recordings with pagination when logged in returns status 200 and property count = 0', async () => {
    const recordings = await agentBasic
      .get('/api/recordings/1')
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
    expect(recordings.body).not.toHaveProperty('earliestTime')
    expect(recordings.body).not.toHaveProperty('createdAt')
    expect(recordings.body).not.toHaveProperty('updatedAt')
  })
})

describe('The collection is not empty', () => {
  beforeAll(async () => await reloadRecordings())

  test('Get recordings without pagination when logged out returns status 401 and error message', async () => {
    const error = await agentLogout
      .get('/api/recordings')
      .expect(401)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('Get recordings with pagination when logged out returns status 401 and error message', async () => {
    const error = await agentLogout
      .get('/api/recordings/1')
      .expect(401)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  describe('successful get without pagination', () => {
    test('Get recordings as non admin returns status 200 and list of recordings from latest date', async () => {
      const recordings = await agentBasic
        .get('/api/recordings')
        .expect(200)
        .expect('Content-type',  /application\/json/)

      const expectedDate = new Date(initialRecordings[0].date)
      expectedDate.setUTCHours(0)
      expectedDate.setUTCMinutes(0)
      expectedDate.setUTCSeconds(0)
      expectedDate.setUTCMilliseconds(0)
      expect(recordings.body.recordings).toHaveLength(20)
      expect(recordings.body.count).toEqual(20)
      expect(recordings.body.date).toEqual(expectedDate.toISOString())
      expect(recordings.body).toHaveProperty('_id')
      expect(recordings.body).toHaveProperty('earliestTime')
      expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
      expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
      expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
      expect(recordings.body.recordings[0]).toHaveProperty('subject')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
      expect(recordings.body).toHaveProperty('createdAt')
      expect(recordings.body).toHaveProperty('updatedAt')
    })

    test('Get recordings as admin returns status 200 and first page of recordings from latest date', async () => {
      const recordings = await agentAdmin
        .get('/api/recordings')
        .expect(200)
        .expect('Content-type',  /application\/json/)

      const expectedDate = new Date(initialRecordings[0].date)
      expectedDate.setUTCHours(0)
      expectedDate.setUTCMinutes(0)
      expectedDate.setUTCSeconds(0)
      expectedDate.setUTCMilliseconds(0)
      expect(recordings.body.recordings).toHaveLength(20)
      expect(recordings.body.count).toEqual(20)
      expect(recordings.body.date).toEqual(expectedDate.toISOString())
      expect(recordings.body).toHaveProperty('_id')
      expect(recordings.body).toHaveProperty('earliestTime')
      expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
      expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
      expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
      expect(recordings.body.recordings[0]).toHaveProperty('subject')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
      expect(recordings.body).toHaveProperty('createdAt')
      expect(recordings.body).toHaveProperty('updatedAt')
    })
  })

  describe('successful get using basic user with pagination', () => {
    test('when passed page = 1 returns status 200 and list of recordings from corresponding page', async () => {
      const recordings = await agentBasic
        .get('/api/recordings/1')
        .expect(200)
        .expect('Content-type',  /application\/json/)

      const expectedDate = new Date(initialRecordings[0].date)
      expectedDate.setUTCHours(0)
      expectedDate.setUTCMinutes(0)
      expectedDate.setUTCSeconds(0)
      expectedDate.setUTCMilliseconds(0)
      expect(recordings.body.recordings).toHaveLength(20)
      expect(recordings.body.count).toEqual(20)
      expect(recordings.body.date).toEqual(expectedDate.toISOString())
      expect(recordings.body).toHaveProperty('_id')
      expect(recordings.body).toHaveProperty('earliestTime')
      expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
      expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
      expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
      expect(recordings.body.recordings[0]).toHaveProperty('subject')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
      expect(recordings.body).toHaveProperty('createdAt')
      expect(recordings.body).toHaveProperty('updatedAt')
    })

    test('when passed page > 1 that still has content returns status 200 and list of recordings from corresponding page', async () => {
      const recordings = await agentBasic
        .get('/api/recordings/2')
        .expect(200)
        .expect('Content-type',  /application\/json/)

      const expectedDate = new Date(initialRecordings[1].date)
      expectedDate.setUTCHours(0)
      expectedDate.setUTCMinutes(0)
      expectedDate.setUTCSeconds(0)
      expectedDate.setUTCMilliseconds(0)
      expect(recordings.body.recordings).toHaveLength(20)
      expect(recordings.body.count).toEqual(20)
      expect(recordings.body.date).toEqual(expectedDate.toISOString())
      expect(recordings.body).toHaveProperty('_id')
      expect(recordings.body).toHaveProperty('earliestTime')
      expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
      expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
      expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
      expect(recordings.body.recordings[0]).toHaveProperty('subject')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
      expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
      expect(recordings.body).toHaveProperty('createdAt')
      expect(recordings.body).toHaveProperty('updatedAt')
    })

    test('when passed page > 1 that has no more content returns status 200 and property count = 0', async () => {
      const recordings = await agentBasic
        .get('/api/recordings/6')
        .expect(200)
        .expect('Content-type',  /application\/json/)

      expect(recordings.body.count).toEqual(0)
      expect(recordings.body).not.toHaveProperty('date')
      expect(recordings.body).not.toHaveProperty('recordings')
      expect(recordings.body).not.toHaveProperty('_id')
      expect(recordings.body).not.toHaveProperty('earliestTime')
      expect(recordings.body).not.toHaveProperty('createdAt')
      expect(recordings.body).not.toHaveProperty('updatedAt')
    })
  })

  describe('unsuccessful get using basic user with pagination', () => {
    test('when passed page = 0 returns status 403 and error message', async () => {
      const error = await agentBasic
        .get('/api/recordings/0')
        .expect(403)
        .expect('Content-type',  /application\/json/)

      expect(error.body).toBeDefined()
    })

    test('when passed page < 0 returns status 403 and error message', async () => {
      const error = await agentBasic
        .get('/api/recordings/-1')
        .expect(403)
        .expect('Content-type',  /application\/json/)

      expect(error.body).toBeDefined()
    })

    test('when passed page as a string returns status 403 and error message', async () => {
      const error = await agentBasic
        .get('/api/recordings/something')
        .expect(403)
        .expect('Content-type',  /application\/json/)

      expect(error.body).toBeDefined()
    })
  })
})
