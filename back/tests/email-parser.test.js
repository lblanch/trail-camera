const hoodiecrow = require('hoodiecrow-imap')
const pino = require('pino')

const { start, disconnect } = require('../email-parser')

const logger = require('../utils/logger')

//TODO: this works, but need to check if imapServer can listen again after close, or server needs to
//be recreated...
const imapServer = hoodiecrow()
const imapServerListen = port => new Promise(resolve => imapServer.listen(port, resolve))
const imapServerClose = () => new Promise(resolve => imapServer.close(resolve))


let imapClient

beforeEach(async () => {
  await imapServerListen(1143)

  const imapOptions = {
    host: 'localhost',
    port: 1143,
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

test('Imap server is on and INBOX is selected', () => {
  logger.info('INBOX TEST')
  expect(imapClient.mailbox.path).toEqual('INBOX')
})

//TODO: check how to test emited events in jest. might not work very well...
/*test('Imap server is on and INBOX is selected', async () => {
  imapClient.on('close', () => {
    console.log('connection closed in test')
  })

  imapClient.on('mailboxOpen', () => {
    console.log('inbox opened again, we were able to reconnect')
    expect(imapClient.mailbox.path).toEqual('INBOX')
  })

  await imapServerClose()
  await imapServerListen(1143)
})*/