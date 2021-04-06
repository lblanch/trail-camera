const app = require('./app')
const http = require('http')
const mongoose = require('mongoose')
require('dotenv').config()

const db_uri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('connected to MongoDB in mode ', process.env.NODE_ENV))
  .catch(error => console.error('error connecting to MongoDB', error.message))

const server = http.createServer(app)

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}. ENV = ${process.env.NODE_ENV}`)
})