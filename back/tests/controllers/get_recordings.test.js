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
    .post('/api/auth/login')
    .send({ email: testBasicUser.email, password: testBasicUser.password })

  //login with Admin user
  testAdminUser = await reloadAdminUser()
  await agentAdmin
    .post('/api/auth/login')
    .send({ email: testAdminUser.email, password: testAdminUser.password })
})

afterAll(async () => {
  await disconnect()
})

const commonLoggedOutTests = () => {
  test('Get recordings returns status 401 and error message', async () => {
    const error = await agentLogout
      .get('/api/recordings')
      .expect(401)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('Get recordings with pagination returns status 401 and error message', async () => {
    const error = await agentLogout
      .get('/api/recordings/1')
      .expect(401)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('Get recordings with before date returns status 401 and error message', async () => {
    const beforeDate = new Date(Date.UTC(2021, 11, 1, 14, 30, 56, 100))
    const error = await agentLogout
      .get(`/api/recordings/before/${beforeDate.toISOString()}`)
      .expect(401)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('Get recordings with after date returns status 401 and error message', async () => {
    const afterDate = new Date(Date.UTC(2020, 11, 1, 7, 0, 24, 500))
    const error = await agentLogout
      .get(`/api/recordings/after/${afterDate.toISOString()}`)
      .expect(401)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })
}

const commonEmptyCollectionWhileLoggedInTests = (userType) => {
  let agent
  beforeAll(() => {
    if (userType === 'basic') {
      agent = agentBasic
    } else if (userType === 'admin') {
      agent = agentAdmin
    }
  })

  test('Get recordings returns status 200 and property count = 0', async () => {
    const recordings = await agent
      .get('/api/recordings')
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
  })

  test('Get recordings with pagination returns status 200 and property count = 0', async () => {
    const recordings = await agent
      .get('/api/recordings/1')
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
  })

  test('Get recordings with before date returns status 200 and property count = 0', async () => {
    const beforeDate = new Date(Date.UTC(2021, 11, 1, 14, 30, 56, 100))
    const recordings = await agent
      .get(`/api/recordings/before/${beforeDate.toISOString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
  })

  test('Get recordings with after date returns status 200 and property count = 0', async () => {
    const afterDate = new Date(Date.UTC(2020, 11, 1, 7, 0, 24, 500))
    const recordings = await agent
      .get(`/api/recordings/after/${afterDate.toISOString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
  })
}

const commonSuccessfulWhileLoggedInTests = (userType) => {
  let agent
  beforeAll(() => {
    if (userType === 'basic') {
      agent = agentBasic
    } else if (userType === 'admin') {
      agent = agentAdmin
    }
  })

  test('Get recordings returns status 200 and list of recordings from most recent page', async () => {
    const recordings = await agent
      .get('/api/recordings')
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[0].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)
    expect(recordings.body.recordings).toHaveLength(initialRecordings[0].count)
    expect(recordings.body.count).toEqual(initialRecordings[0].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed page = 1 returns status 200 and list of recordings from corresponding page', async () => {
    const recordings = await agent
      .get('/api/recordings/1')
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[0].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)
    expect(recordings.body.recordings).toHaveLength(initialRecordings[0].count)
    expect(recordings.body.count).toEqual(initialRecordings[0].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed page > 1 that still has content returns status 200 and list of recordings from corresponding page', async () => {
    const recordings = await agent
      .get('/api/recordings/2')
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[1].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)
    expect(recordings.body.recordings).toHaveLength(initialRecordings[1].count)
    expect(recordings.body.count).toEqual(initialRecordings[1].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed page > 1 that has no more content returns status 200 and property count = 0', async () => {
    const recordings = await agent
      .get('/api/recordings/6')
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
  })

  test('when passed a valid before date (ISO format) returns status 200 and list of recordings from first page before the given date', async () => {
    const beforeDate = new Date(initialRecordings[0].recording.mediaDate)
    const recordings = await agent
      .get(`/api/recordings/before/${beforeDate.toISOString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[1].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)
    expect(recordings.body.recordings).toHaveLength(initialRecordings[1].count)
    expect(recordings.body.count).toEqual(initialRecordings[1].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed a valid before date (ISO format) returns status 200 and list of recordings from first page before the given date and time', async () => {
    const beforeDate = new Date(initialRecordings[1].recording.mediaDate)
    const recordings = await agent
      .get(`/api/recordings/before/${beforeDate.toISOString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[3].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)

    expect(recordings.body.recordings).toHaveLength(initialRecordings[3].count)
    expect(recordings.body.count).toEqual(initialRecordings[3].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed a valid before date (ECMA-262 format) returns status 200 and list of recordings from first page before the given date', async () => {
    const beforeDate = new Date(initialRecordings[0].recording.mediaDate)
    const recordings = await agent
      .get(`/api/recordings/before/${beforeDate.toString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[1].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)
    expect(recordings.body.recordings).toHaveLength(initialRecordings[1].count)
    expect(recordings.body.count).toEqual(initialRecordings[1].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed a valid before date and there is no more content returns status 200 and property count = 0', async () => {
    const beforeDate = new Date(initialRecordings[4].recording.mediaDate)
    const recordings = await agent
      .get(`/api/recordings/before/${beforeDate.toISOString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
  })

  test('when passed a valid after date (ISO format) returns status 200 and list of recordings from first page after the given date', async () => {
    const afterDate = new Date(initialRecordings[1].recording.mediaDate)
    const recordings = await agent
      .get(`/api/recordings/after/${afterDate.toISOString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[0].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)
    expect(recordings.body.recordings).toHaveLength(initialRecordings[0].count)
    expect(recordings.body.count).toEqual(initialRecordings[0].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed a valid after date (ISO format) returns status 200 and list of recordings from first page after the given date and time', async () => {
    const afterDate = new Date(initialRecordings[4].recording.mediaDate)
    const recordings = await agent
      .get(`/api/recordings/after/${afterDate.toISOString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[2].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)

    expect(recordings.body.recordings).toHaveLength(initialRecordings[2].count)
    expect(recordings.body.count).toEqual(initialRecordings[2].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed a valid after date (ECMA-262 format) returns status 200 and list of recordings from first page after the given date', async () => {
    const afterDate = new Date(initialRecordings[1].recording.mediaDate)
    const recordings = await agent
      .get(`/api/recordings/after/${afterDate.toString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    const expectedDate = new Date(initialRecordings[0].recording.mediaDate)
    expectedDate.setUTCHours(0)
    expectedDate.setUTCMinutes(0)
    expectedDate.setUTCSeconds(0)
    expectedDate.setUTCMilliseconds(0)
    expect(recordings.body.recordings).toHaveLength(initialRecordings[0].count)
    expect(recordings.body.count).toEqual(initialRecordings[0].count)
    expect(recordings.body.date).toEqual(expectedDate.toISOString())
    expect(recordings.body).toHaveProperty('_id')
    expect(recordings.body.recordings[0]).toHaveProperty('emailDeliveryDate')
    expect(recordings.body.recordings[0]).toHaveProperty('sentTo')
    expect(recordings.body.recordings[0]).toHaveProperty('sentFrom')
    expect(recordings.body.recordings[0]).toHaveProperty('subject')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaType')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaThumbnailURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaURL')
    expect(recordings.body.recordings[0]).toHaveProperty('mediaDate')
    expect(recordings.body.recordings[0]).toHaveProperty('tags')

    //Recordings should be ordered from newest to oldest
    const firstRecordingDate = new Date(recordings.body.recordings[0].mediaDate)
    const lastRecordingDate = new Date(recordings.body.recordings[recordings.body.count - 1].mediaDate)

    expect(firstRecordingDate > lastRecordingDate).toEqual(true)
  })

  test('when passed a valid after date and there is no more content returns status 200 and property count = 0', async () => {
    const afterDate = new Date(initialRecordings[0].recording.mediaDate)
    const recordings = await agent
      .get(`/api/recordings/after/${afterDate.toISOString()}`)
      .expect(200)
      .expect('Content-type',  /application\/json/)

    expect(recordings.body.count).toEqual(0)
    expect(recordings.body).not.toHaveProperty('date')
    expect(recordings.body).not.toHaveProperty('recordings')
    expect(recordings.body).not.toHaveProperty('_id')
  })
}

const commonUnsuccesfulUsingPaginationWhileLoggedInTests = (userType) => {
  let agent
  beforeAll(() => {
    if (userType === 'basic') {
      agent = agentBasic
    } else if (userType === 'admin') {
      agent = agentAdmin
    }
  })

  test('when passed page = 0 returns status 400 and error message', async () => {
    const error = await agent
      .get('/api/recordings/0')
      .expect(400)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('when passed page < 0 returns status 400 and error message', async () => {
    const error = await agent
      .get('/api/recordings/-1')
      .expect(400)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('when passed page as a string returns status 400 and error message', async () => {
    const error = await agent
      .get('/api/recordings/something')
      .expect(400)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })
}

const commonUnsuccesfulUsingDatesWhileLoggedInTests = (endpoint, userType) => {
  let agent
  beforeAll(() => {
    if (userType === 'basic') {
      agent = agentBasic
    } else if (userType === 'admin') {
      agent = agentAdmin
    }
  })

  test('when passed an invalid date returns status 400 and error message', async () => {
    const error = await agent
      .get(`/api/recordings/${endpoint}/invalidDate`)
      .expect(400)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('when passed an invalid date format returns status 400 and error message', async () => {
    const requestedDate = new Date(initialRecordings[0].recording.mediaDate)
    const error = await agent
      .get(`/api/recordings/${endpoint}/${requestedDate.toLocaleString()}`)
      .expect(400)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })

  test('when not passed any date returns status 400 and error message', async () => {
    const error = await agent
      .get(`/api/recordings/${endpoint}`)
      .expect(400)
      .expect('Content-type',  /application\/json/)

    expect(error.body).toBeDefined()
  })
}

describe('The collection is empty', () => {
  describe('while being logged out', () => {
    commonLoggedOutTests()
  })

  describe.each([
    ['basic'],
    ['admin']
  ])('while being logged in as %s user', commonEmptyCollectionWhileLoggedInTests)
})

describe('The collection is not empty', () => {
  beforeAll(async () => await reloadRecordings())

  describe('while being logged out', () => {
    commonLoggedOutTests()
  })

  describe.each([
    ['basic'],
    ['admin']
  ])('successful, while being logged in as %s user', commonSuccessfulWhileLoggedInTests)

  describe.each([
    ['basic'],
    ['admin']
  ])('unsuccessful, while using pagination and being logged in as %s user', commonUnsuccesfulUsingPaginationWhileLoggedInTests)

  describe.each([
    ['before', 'basic'],
    ['before', 'admin'],
    ['after', 'basic'],
    ['after', 'admin']
  ])('unsuccessful, while using %s endpoint and being logged in as %s user', commonUnsuccesfulUsingDatesWhileLoggedInTests)
})
