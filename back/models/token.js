const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
  token: String,
  expireAt: Date,
  type: String,
  userId: mongoose.ObjectId
})

//Adding TTL to each specific document. Mongo Db check the expireAt field and delete them as needed.
tokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('Token', tokenSchema)