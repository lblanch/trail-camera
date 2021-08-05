const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    minLength: 5,
    unique: true,
    required: true
  },
  name: {
    type: String,
    minLength: 1,
    required: true
  },
  passwordHash: {
    type: String
  }
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)