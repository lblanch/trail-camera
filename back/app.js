const express = require('express')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
require('express-async-errors')
require('dotenv').config()

const { logger, errorHandler } = require('./utils/middleware')

const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const recordingsRouter = require('./controllers/recordings')

const sessionMaxAge = 1000 * 60 * 60 * 24 * 30 //30 days in milliseconds
const dbUri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI

const store = new MongoDBStore({
  uri: dbUri,
  collection: 'sessions',
  expires: sessionMaxAge,
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
})

store.on('error', (error) => {
  console.error('STORE ERROR!! ', error.toString())
})

store.on('connected', () => {
  console.log('MONGODBSTORE connected')
})

const app = express()
app.use(express.json())

app.use(session({
  name: 'sid',
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    httpOnly: true,
    maxAge: sessionMaxAge,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production' ? true : false
  }
}))

app.use(logger)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/recordings', recordingsRouter)

app.use(errorHandler)

module.exports = { app, store }

