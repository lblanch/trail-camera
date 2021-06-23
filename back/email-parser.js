const { ImapFlow } = require('imapflow')
const simpleParser = require('mailparser').simpleParser
const pino = require('pino')()
require('dotenv').config()

//avoid ImapFlow log messages
pino.level = 'silent'

const client = new ImapFlow({
  host: process.env.IMAP_HOST,
  port: 993,
  secure: true,
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASSWORD
  },
  logger: pino
})

let lock

const connect = async () => {
  // Wait until client connects and authorizes
  await client.connect()

  // Select and lock a mailbox. Throws if mailbox does not exist
  lock = await client.getMailboxLock('INBOX')

  let status = await client.status('INBOX', { messages: true })
  console.log('Total amount of messages: ', status.messages)

  const emailToParse = 101 //90 for video, 101 for pic
  await parseEmail(emailToParse)

  lock.release()
  await client.logout()
}

client.on('exists', async data => {
  console.log(data)

  for (let emailId = data.prevCount+1; emailId <= data.count; emailId++) {
    await parseEmail(emailId)
  }
})

client.on('close', () => {
  //TODO: reconnect
  //lock.release()
  console.log('Connection closed')
})

const parseEmail = async (emailId) => {
  console.log('parsing ', emailId)
  const downloadedEmail = await client.download(emailId, null)

  const parsedEmail = await simpleParser(downloadedEmail.content)
  console.log(parsedEmail.headers)

  let newCameraInput = {}

  if (parsedEmail.text) {
    const emailInfoJson = parseEmailText(parsedEmail.text)

    newCameraInput.emailBody = emailInfoJson
    if (emailInfoJson.date && emailInfoJson.time) {
      const dateSplit = emailInfoJson.date.split('.')
      const timeSplit = emailInfoJson.time.split(':')
      newCameraInput.date = new Date(`20${dateSplit[2]}`, dateSplit[1]-1, dateSplit[0], timeSplit[0], timeSplit[1], timeSplit[2])
    }
  }

  newCameraInput.emailDeliveryDate = new Date(parsedEmail.headers.get('delivery-date'))
  newCameraInput.sentTo = parsedEmail.headers.get('to').text
  newCameraInput.sentFrom = parsedEmail.headers.get('from').text
  newCameraInput.subject = parsedEmail.subject

  if (parsedEmail.date) {
    console.log('Date: ', parsedEmail.date.toString())
  } else {
    console.log('Delivery-date: ', parsedEmail.headers.get('delivery-date'))
  }

  //TODO: Parse attachments, store to S3
  //TODO: Store camera input to DB
  console.log('JSON: ', newCameraInput)
}

const parseEmailText = (emailText) => {
  const emailInfo = emailText.split('\n').reduce((accumulator, currentValue) => {
    let workingAccumulator = accumulator
    const splitLine = currentValue.split(': ')

    if (splitLine.length === 2 && splitLine[1] !== '') {
      workingAccumulator[splitLine[0].replace(/ /g, '-').toLowerCase()] = splitLine[1]
      return workingAccumulator
    }
    return accumulator
  }, { })

  return emailInfo
}

connect().catch(err => console.error(err))