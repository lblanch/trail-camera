const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    minLength: 5,
    unique: true,
    required: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email address.']
  },
  name: {
    type: String,
    minLength: 1,
    required: true
  },
  passwordHash: {
    type: String
  },
  role: {
    type: String,
    default: 'user'
  }
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)