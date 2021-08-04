jest.mock('../../email-parser')
const mockEmailParser = require('../../email-parser')
const hoodiecrow = require('hoodiecrow-imap')
const pino = require('pino')

const { start, disconnect, getClient, getClientStatus } = require('../../email-client')

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

describe('Imap server is available then email-client starts', () => {
  beforeEach(async () => {
    mockEmailParser.parseEmail.mockReset()
    await imapServerListen(TEST_PORT)

    imapClient = await start(imapOptions)
  })

  afterEach(async () => {
    await disconnect()
    await imapServerClose()
  })

  test('Email-client is connected to imap server and has opened INBOX mailbox successfully', () => {
    // 1 = connected
    expect(getClientStatus()).toEqual(1)
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

  test('Email-client handles errors in parseEmail when a new email is received, for example, without attachment', async () => {
    mockEmailParser.parseEmail.mockRejectedValueOnce(new Error())
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
    expect(mockEmailParser.parseEmail).toHaveBeenCalledTimes(1)

    // 1 = connected
    expect(getClientStatus()).toEqual(1)
  }, 30000)

  test('Email-client automatically reconnects after disconnection', async () => {
    const oldId = imapClient.id

    //disconnect from imap server
    await imapClient.logout()

    //wait 1 sec for it to reconnect
    await new Promise(resolve => setTimeout(resolve, 1000))

    //refresh the client, check it has a new id and check it again has opened INBOX
    imapClient = getClient()
    // 1 = connected
    expect(getClientStatus()).toEqual(1)
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

    // 2 = disconnected but retrying
    expect(getClientStatus()).toEqual(2)

    await imapServerListen(TEST_PORT)

    //wait 5 sec for client to reconnect
    await new Promise(resolve => setTimeout(resolve, 5000))

    //refresh the client, check it has a new id and check it again has opened INBOX
    imapClient = getClient()
    // 1 = connected
    expect(getClientStatus()).toEqual(1)
    expect(imapClient.id).not.toEqual(oldId)
    expect(imapClient.mailbox.path).toEqual('INBOX')
  }, 10000)
})

describe('Imap server is not available then email-client starts', () => {
  test('When email-client starts and tries to connect, the retry procedure starts. When IMAP server starts, client eventually connects', async () => {
    imapClient = await start(imapOptions)
    const oldId = imapClient.id

    //wait 3 sec before starting imap server, so a couple of attempts fail
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 2 = disconnected but retrying
    expect(getClientStatus()).toEqual(2)

    await imapServerListen(TEST_PORT)

    //wait 5 sec for client to reconnect
    await new Promise(resolve => setTimeout(resolve, 5000))

    //refresh the client, check it has a new id and check it has been able to open INBOX
    imapClient = getClient()
    // 1 = connected
    expect(getClientStatus()).toEqual(1)
    expect(imapClient.id).not.toEqual(oldId)
    expect(imapClient.mailbox.path).toEqual('INBOX')

    await disconnect()
    await imapServerClose()
  }, 10000)

  test('When email-client starts and tries to connect, retry procedure starts and eventually client disconnects after too many connection attempts', async () => {
    //start client with max amount of attempts = 10, default is 100 but that would take about 3.5h
    imapClient = await start(imapOptions, 10)

    // 2 = disconnected but retrying
    expect(getClientStatus()).toEqual(2)

    //wait 30 sec for all attempts to go through
    await new Promise(resolve => setTimeout(resolve, 30000))

    // 3 = disconnected and not retrying
    expect(getClientStatus()).toEqual(3)
  }, 40000)
})

test('When email-client tries to open a non-existing mailbox after successful connection to imap server, email-client disconnects gracefully', async () => {
  await imapServerListen(TEST_PORT)

  imapClient = await start(imapOptions, 10, 'NOT_INBOX')

  // 3 = disconnected and not retrying
  expect(getClientStatus()).toEqual(3)

  await imapServerClose()
})