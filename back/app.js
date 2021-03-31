const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const { logger, errorHandler } = require('./utils/middleware')

const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')

const app = express()
app.use(express.json())

const db_uri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('connected to MongoDB'))
  .catch(error => console.error('error connecting to MongoDB', error.message))


app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

app.use(logger)
app.use(errorHandler)

module.exports = app

