jest.mock('../../email-parser')
const mockEmailParser = require('../../email-parser')
const hoodiecrow = require('hoodiecrow-imap')
const pino = require('pino')

const { start, disconnect, getClient } = require('../../email-client')

const TEST_PORT = 1143
const imapServer = hoodiecrow({ plugins: ['IDLE'] })
const imapServerListen = port => new Promise(resolve => imapServer.listen(port, resolve))
const imapServerClose = () => new Promise(resolve => imapServer.close(resolve))

let imapClient

beforeEach(async () => {
  await imapServerListen(TEST_PORT)

  const imapOptions = {
    host: 'localhost',
    port: TEST_PORT,
    secure: false,
    auth: {
      user: 'testuser',
      pass: 'testpass'
    },
    logger: pino({ level: 'silent' })
  }

  imapClient = await start(imapOptions)
})

afterEach(async () => {
  await disconnect()
  await imapServerClose()
})

test('Email-client has opened INBOX mailbox successfully', () => {
  expect(imapClient.mailbox.path).toEqual('INBOX')
})

test('Email-client calls email-parser when a new email is received', async () => {
  const rawMessage = 'From: sender name <sender@example.com>\r\n' +
    'To: Receiver name <receiver@example.com>\r\n' +
    'Subject: hello 4\r\n' +
    'Message-Id: <abcde>\r\n' +
    'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n' +
    '\r\n' +
    'World 4!'

  imapServer.appendMessage('INBOX', [], new Date(), rawMessage)

  //wait 20 sec for client to receive EXISTS event
  await new Promise(resolve => setTimeout(resolve, 20000))

  // The function was called exactly once
  //expect(mockEmailParser.parseEmail.mock.calls.length).toBe(1)
  expect(mockEmailParser.parseEmail).toHaveBeenCalledTimes(1)

  // The first arg of the first call to the function was not undefined
  expect(mockEmailParser.parseEmail.mock.calls[0][0]).not.toBeUndefined()
}, 30000)

test('Email-client automatically reconnects after disconnection', async () => {
  const oldId = imapClient.id

  //disconnect from imap server
  await imapClient.logout()

  //wait 1 sec for it to reconnect
  await new Promise(resolve => setTimeout(resolve, 1000))

  //refresh the client, check it has a new id and check it again has opened INBOX
  imapClient = getClient()
  expect(imapClient.id).not.toEqual(oldId)
  expect(imapClient.mailbox.path).toEqual('INBOX')
})