const mongoose = require('mongoose')
const { validateEmail } = require('../utils/validators')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    minLength: 5,
    unique: true,
    required: true,
    validate: {
      validator: validateEmail,
      message: 'Invalid email address.'
    }
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
    default: 'user',
    enum: ['admin', 'user'],
    required: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)