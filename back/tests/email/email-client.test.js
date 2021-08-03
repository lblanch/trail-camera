jest.mock('../../email-parser')
const mockEmailParser = require('../../email-parser')
const hoodiecrow = require('hoodiecrow-imap')
const pino = require('pino')

const { start, disconnect, getClient } = require('../../email-client')

const TEST_PORT = 1143
const imapServer = hoodiecrow({ plugins: ['IDLE'] })
const imapServerListen = port => new Promise(resolve => imapServer.listen(port, resolve))
const imapServerClose = () => new Promise(resolve => imapServer.close(resolve))

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

let imapClient

describe('Imap server is available when email-client starts', () => {
  beforeEach(async () => {
    await imapServerListen(TEST_PORT)

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

  test('Email-client automatically tries to reconnect after server is unavailable for few seconds', async () => {
    const oldId = imapClient.id

    //close imap server
    await imapClient.logout()
    await imapServerClose()

    //wait 3 sec before starting imap server again, so a couple of attempts fail
    await new Promise(resolve => setTimeout(resolve, 3000))

    await imapServerListen(TEST_PORT)

    //wait 5 sec for client to reconnect
    await new Promise(resolve => setTimeout(resolve, 5000))

    //refresh the client, check it has a new id and check it again has opened INBOX
    imapClient = getClient()
    expect(imapClient.id).not.toEqual(oldId)
    expect(imapClient.mailbox.path).toEqual('INBOX')
  }, 10000)
})

describe('Imap server is not available when email-client starts', () => {
  test('When email-client starts and tries to connect, the retry procedure gets started and eventually connects', async () => {
    imapClient = await start(imapOptions)
    const oldId = imapClient.id

    //wait 3 sec before starting imap server, so a couple of attempts fail
    await new Promise(resolve => setTimeout(resolve, 3000))

    await imapServerListen(TEST_PORT)

    //wait 5 sec for client to reconnect
    await new Promise(resolve => setTimeout(resolve, 5000))

    //refresh the client, check it has a new id and check it has been able to open INBOX
    imapClient = getClient()
    expect(imapClient.id).not.toEqual(oldId)
    expect(imapClient.mailbox.path).toEqual('INBOX')

    await disconnect()
    await imapServerClose()
  }, 10000)
})

//TODO: test that it stops retrying after 100 attempts?
//TODO: test if email-parser throws error (mock it)
//TODO: what happens if INBOX cannot be opened?
//TODO: what happens in case of mongoDB connection issues?