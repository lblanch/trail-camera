const supertest = require('supertest')
const mongoose = require('mongoose')

const Recording = require('../../models/recording')
const { connect, disconnect, clearSessionStore } = require('../../app')
const { reloadAdminUser, reloadBasicUser, clearUsers, clearTokens } = require('../helpers/users_helper')
const { reloadRecordings, clearRecordings } = require('../helpers/recordings_helper')

let agentAdmin, agentBasic, agentLogout
let server
let testAdminUser
let testRecordings

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
  await clearRecordings()

  testRecordings = await reloadRecordings()
  testAdminUser = await reloadAdminUser()
})

afterAll(async () => {
  await disconnect()
})

describe('Add a tag to a recording', () => {
  describe('successfully', () => {
    test('When logged in as admin and providing a valid recording id and tag, returns status 200', async () => {
      const amountTagsBefore = testRecordings[0].recordings[0].tags.length

      await agentAdmin
        .post('/api/auth/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })

      const tagToBeAdded = {
        tag: 'Short text',
        color: 'blue.500'
      }

      const result = await agentAdmin
        .patch(`/api/recordings/tags/${testRecordings[0].recordings[0]._id}`)
        .send(tagToBeAdded)
        .expect(200)
        .expect('Content-type', /application\/json/)

      expect(result.body.tags).toHaveLength(amountTagsBefore + 1)
      expect(result.body.tags[amountTagsBefore].tag).toEqual(tagToBeAdded.tag)
      expect(result.body.tags[amountTagsBefore].color).toEqual(tagToBeAdded.color)
      expect(result.body.tags[amountTagsBefore]).toHaveProperty('_id')
    })

    test('When logged in as admin and providing a valid recording id and tag without color, default color is set and returns status 200', async () => {
      const amountTagsBefore = testRecordings[0].recordings[0].tags.length

      await agentAdmin
        .post('/api/auth/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })

      const tagToBeAdded = {
        tag: 'Short text',
      }

      const result = await agentAdmin
        .patch(`/api/recordings/tags/${testRecordings[0].recordings[0]._id}`)
        .send(tagToBeAdded)
        .expect(200)
        .expect('Content-type', /application\/json/)

      expect(result.body.tags).toHaveLength(amountTagsBefore + 1)
      expect(result.body.tags[amountTagsBefore].tag).toEqual(tagToBeAdded.tag)
      expect(result.body.tags[amountTagsBefore].color).toEqual('red.400')
      expect(result.body.tags[amountTagsBefore]).toHaveProperty('_id')
    })

    test('When logged in as admin and providing a valid recording id and tag with additional fields, only tag and color are set and returns status 200', async () => {
      const amountTagsBefore = testRecordings[0].recordings[0].tags.length

      await agentAdmin
        .post('/api/auth/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })

      const tagToBeAdded = {
        tag: 'Short text',
        color: 'blue.500',
        randomField1: 'random',
        randomField2: 34545
      }

      const result = await agentAdmin
        .patch(`/api/recordings/tags/${testRecordings[0].recordings[0]._id}`)
        .send(tagToBeAdded)
        .expect(200)
        .expect('Content-type', /application\/json/)

      expect(result.body.tags).toHaveLength(amountTagsBefore + 1)
      expect(result.body.tags[amountTagsBefore].tag).toEqual(tagToBeAdded.tag)
      expect(result.body.tags[amountTagsBefore].color).toEqual(tagToBeAdded.color)
      expect(result.body.tags[amountTagsBefore]).not.toHaveProperty('randomField1')
      expect(result.body.tags[amountTagsBefore]).not.toHaveProperty('randomField2')
      expect(result.body.tags[amountTagsBefore]).toHaveProperty('_id')
    })

    test('When logged in as basic and providing a valid recording id and tag, returns status 200', async () => {
      const amountTagsBefore = testRecordings[0].recordings[0].tags.length

      const testBasicUser = await reloadBasicUser()
      await agentBasic
        .post('/api/auth/login')
        .send({ email: testBasicUser.email, password: testBasicUser.password })

      const tagToBeAdded = {
        tag: 'Short text',
        color: 'blue.500'
      }

      const result = await agentBasic
        .patch(`/api/recordings/tags/${testRecordings[0].recordings[0]._id}`)
        .send(tagToBeAdded)
        .expect(200)
        .expect('Content-type', /application\/json/)

      expect(result.body.tags).toHaveLength(amountTagsBefore + 1)
      expect(result.body.tags[amountTagsBefore].tag).toEqual(tagToBeAdded.tag)
      expect(result.body.tags[amountTagsBefore].color).toEqual(tagToBeAdded.color)
      expect(result.body.tags[amountTagsBefore]).toHaveProperty('_id')
    })
  })

  describe('unsuccessfully', () => {
    beforeEach(async () => {
      await agentAdmin
        .post('/api/auth/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })
    })

    test('When logged out and providing a valid recording id and tag, returns status 401 and error', async () => {
      const amountTagsBefore = testRecordings[0].recordings[0].tags.length

      const tagToBeAdded = {
        tag: 'Short text',
        color: 'blue.500'
      }

      const error = await agentLogout
        .patch(`/api/recordings/tags/${testRecordings[0].recordings[0]._id}`)
        .send(tagToBeAdded)
        .expect(401)
        .expect('Content-type', /application\/json/)

      const recordingAfter = await Recording.findOne({ 'recordings._id': testRecordings[0].recordings[0]._id })

      expect(recordingAfter.recordings[0].tags).toHaveLength(amountTagsBefore)
      expect(error.body).toHaveProperty('error')
    })

    test('When logged in and not providing a recording id, returns status 404', async () => {
      const tagToBeAdded = {
        tag: 'Short text',
        color: 'blue.500'
      }

      await agentAdmin
        .patch('/api/recordings/tags')
        .send(tagToBeAdded)
        .expect(404)

    })

    test('When logged in and providing an invalid recording id, returns status 400 and error', async () => {
      const tagToBeAdded = {
        tag: 'Short text',
        color: 'blue.500'
      }

      const error = await agentAdmin
        .patch('/api/recordings/tags/invalidRecordingId')
        .send(tagToBeAdded)
        .expect(400)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })

    test('When logged in and providing a non existing recording id, returns status 400 and error', async () => {
      const tagToBeAdded = {
        tag: 'Short text',
        color: 'blue.500'
      }

      const error = await agentAdmin
        .patch(`/api/recordings/tags/${new mongoose.Types.ObjectId()}`)
        .send(tagToBeAdded)
        .expect(400)
        .expect('Content-type', /application\/json/)

      expect(error.body).toHaveProperty('error')
    })

    test('When logged in and providing a valid recording id and invalid tag, returns status 400 and error', async () => {
      const amountTagsBefore = testRecordings[0].recordings[0].tags.length

      const tagToBeAdded = {
        invalidTag: 'invalidTag',
        color: 'blue.500'
      }

      const error = await agentAdmin
        .patch(`/api/recordings/tags/${testRecordings[0].recordings[0]._id}`)
        .send(tagToBeAdded)
        .expect(400)
        .expect('Content-type', /application\/json/)

      const recordingAfter = await Recording.findOne({ 'recordings._id': testRecordings[0].recordings[0]._id })

      expect(recordingAfter.recordings[0].tags).toHaveLength(amountTagsBefore)
      expect(error.body).toHaveProperty('error')
    })

    test('When logged in and providing a valid recording without a tag, returns status 400 and error', async () => {
      const amountTagsBefore = testRecordings[0].recordings[0].tags.length

      const error = await agentAdmin
        .patch(`/api/recordings/tags/${testRecordings[0].recordings[0]._id}`)
        .send()
        .expect(400)
        .expect('Content-type', /application\/json/)

      const recordingAfter = await Recording.findOne({ 'recordings._id': testRecordings[0].recordings[0]._id })

      expect(recordingAfter.recordings[0].tags).toHaveLength(amountTagsBefore)
      expect(error.body).toHaveProperty('error')
    })
  })
})
