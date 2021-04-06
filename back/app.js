const express = require('express')
require('express-async-errors')
require('dotenv').config()

const { logger, errorHandler } = require('./utils/middleware')

const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')

const app = express()
app.use(express.json())

app.use(logger)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

app.use(errorHandler)

module.exports = app

