const express = require('express')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const mongoose = require('mongoose')
const { createHttpTerminator } = require('http-terminator')
const helmet = require('helmet')
require('express-async-errors')
require('dotenv').config()

const { requestLogger, errorHandler } = require('./utils/middleware')
const logger = require('./utils/logger')

const authRouter = require('./controllers/auth')
const usersRouter = require('./controllers/users')
const recordingsRouter = require('./controllers/recordings')

const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 30 //30 days in milliseconds
const dbUri = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : process.env.TEST_MONGODB_URI

let server
let httpTerminator

const store = new MongoDBStore({
  uri: dbUri,
  collection: 'sessions',
  expires: SESSION_MAX_AGE,
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
})

store.on('error', (error) => {
  logger.error('MONGODBSTORE ERROR!! ', error.toString())
})

store.on('connected', () => {
  logger.info('MONGODBSTORE connected')
})

const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      // To allow loading images not hosted in localhost, but in aws S3
      'img-src': [`https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`, '\'self\'', 'data:'],
    },
  },
}))

app.use(session({
  name: 'sid',
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production' ? true : false
  }
}))

app.use(requestLogger)

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/recordings', recordingsRouter)

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/build/index.html')
})

app.use(errorHandler)

const connect = async () => {
  //Connect to MongoDB database
  await mongoose.connect(dbUri)
  logger.info('connected to MongoDB in mode ', process.env.NODE_ENV)

  //Start listening
  server = app.listen(process.env.PORT, () => logger.info('Server running'))

  //set up http terminator
  httpTerminator = createHttpTerminator({ server })

  return server
}

const disconnect = async () => {
  //Disconnect database connection
  logger.info('mongoose ready state', mongoose.connection.readyState)
  //1 = connected
  if(mongoose.connection.readyState === 1) {
    await mongoose.disconnect()
    logger.info('Mongoose disconnected')
  }

  //Disconnect store database connection
  //logger.info('mongodb store connected', store.client.isConnected())
  //if(store.client.isConnected()) {
  await store.client.close()
  logger.info('MongoDB store disconnected')
  //}

  //Stop server
  logger.info('server listening', server.listening)
  if (server.listening) {
    await httpTerminator.terminate()
    logger.info('Terminator done')
  }
}

const clearSessionStore = async () => {
  //Clear session store
  await new Promise((resolve, reject) => store.clear((err) => {
    if (err) return reject(err)

    resolve()
  }))
}

module.exports = { connect, disconnect, clearSessionStore }

