const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const loginRouter = require('./controllers/login')

const app = express()
app.use(express.json())

const db_uri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('connected to MongoDB'))
  .catch(error => console.error('error connecting to MongoDB', error.message))


app.use('/api/login', loginRouter)

app.use((request, response, next) => {
  let logMessage = `${request.method} ${request.path}`
  if (Object.keys(request.params).length > 0) {
    logMessage = logMessage.concat(' Params: ', request.params)
  }
  if (Object.keys(request.body).length > 0) {
    logMessage = logMessage.concat(' Body: ', request.body)
  }

  response.on('close', () => {
    logMessage = logMessage.concat(' - ', response.statusCode)
    console.log(logMessage)
  })

  response.on('aborted', () => {
    logMessage= logMessage.concat(' - ', response.statusCode, ' ABORTED')
    console.error(logMessage)
  })

  next()
})

module.exports = app

