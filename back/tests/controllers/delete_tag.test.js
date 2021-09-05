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

describe('Remove a tag from a recording', () => {
  describe('successfully', () => {
    test('When logged in as admin and providing a valid tag id, returns status 200', async () => {
      const amountTagsBefore = testRecordings[1].recordings[0].tags.length

      await agentAdmin
        .post('/api/auth/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })

      await agentAdmin
        .delete(`/api/recordings/tags/${testRecordings[1].recordings[0].tags[0]._id}`)
        .send()
        .expect(200)

      const recordingAfter = await Recording.findOne({ 'recordings._id': testRecordings[1].recordings[0]._id })

      expect(recordingAfter.recordings[0].tags).toHaveLength(amountTagsBefore - 1)
    })

    test('When logged in as basic and providing a valid tag id, returns status 200', async () => {
      const amountTagsBefore = testRecordings[1].recordings[0].tags.length

      const testBasicUser = await reloadBasicUser()
      await agentBasic
        .post('/api/auth/login')
        .send({ email: testBasicUser.email, password: testBasicUser.password })

      await agentBasic
        .delete(`/api/recordings/tags/${testRecordings[1].recordings[0].tags[0]._id}`)
        .send()
        .expect(200)

      const recordingAfter = await Recording.findOne({ 'recordings._id': testRecordings[1].recordings[0]._id })

      expect(recordingAfter.recordings[0].tags).toHaveLength(amountTagsBefore - 1)
    })
  })

  describe('unsuccessfully', () => {
    beforeEach(async () => {
      await agentAdmin
        .post('/api/auth/login')
        .send({ email: testAdminUser.email, password: testAdminUser.password })
    })

    test('When logged out and providing a valid tag id, returns status 401 and error', async () => {
      const amountTagsBefore = testRecordings[1].recordings[0].tags.length

      const error = await agentLogout
        .delete(`/api/recordings/tags/${testRecordings[1].recordings[0].tags[0]._id}`)
        .send()
        .expect(401)
        .expect('Content-type', /application\/json/)

      const recordingAfter = await Recording.findOne({ 'recordings._id': testRecordings[1].recordings[0]._id })

      expect(recordingAfter.recordings[0].tags).toHaveLength(amountTagsBefore)
      expect(error.body).toHaveProperty('error')
    })

    test('When logged in and providing an invalid tag id, returns status 400 and error', async () => {
      const amountTagsBefore = testRecordings[1].recordings[0].tags.length

      const error = await agentAdmin
        .delete('/api/recordings/tags/invalidId')
        .send()
        .expect(400)
        .expect('Content-type', /application\/json/)

      const recordingAfter = await Recording.findOne({ 'recordings._id': testRecordings[1].recordings[0]._id })

      expect(recordingAfter.recordings[0].tags).toHaveLength(amountTagsBefore)
      expect(error.body).toHaveProperty('error')
    })

    test('When logged in and providing a non existing tag id, returns status 400 and error', async () => {
      const amountTagsBefore = testRecordings[1].recordings[0].tags.length

      const error = await agentAdmin
        .delete(`/api/recordings/tags/${new mongoose.Types.ObjectId()}`)
        .send()
        .expect(400)
        .expect('Content-type', /application\/json/)

      const recordingAfter = await Recording.findOne({ 'recordings._id': testRecordings[1].recordings[0]._id })

      expect(recordingAfter.recordings[0].tags).toHaveLength(amountTagsBefore)
      expect(error.body).toHaveProperty('error')
    })

    test('When logged in and not providing a tag id, returns status 404', async () => {
      await agentAdmin
        .delete('/api/recordings/tags')
        .send()
        .expect(404)
    })
  })
})
