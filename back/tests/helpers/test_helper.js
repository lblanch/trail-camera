const mongoose = require('mongoose')

const { app, store } = require('../../app')

const handleTestConnection = async () => {
  let server
  //Connect to MongoDB
  await mongoose.connect(process.env.TEST_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

  //Start the server
  await new Promise((resolve, reject) => {
    server = app.listen(5000, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })

  return server
}

const handleTestDisconnection = async (server) => {
  //Close MongoDB
  mongoose.connection.close()

  //Close server
  await new Promise((resolve, reject) => server.close((err) => {
    if (err) return reject(err)

    resolve()
  }))

  //Close store connection to DB
  await store.client.close()
}

const clearSessionStore = async () => {
  //Clear session store
  await new Promise((resolve, reject) => store.clear((err) => {
    if (err) return reject(err)

    resolve()
  }))
}

module.exports = { handleTestConnection, clearSessionStore, handleTestDisconnection }