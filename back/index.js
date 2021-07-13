const { app } = require('./app')
const http = require('http')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
require('dotenv').config()

const dbUri = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : process.env.TEST_MONGODB_URI
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => logger.info('connected to MongoDB in mode ', process.env.NODE_ENV))
  .catch(error => logger.error('error connecting to MongoDB', error.message))

const server = http.createServer(app)

server.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT}. ENV = ${process.env.NODE_ENV}`)
})