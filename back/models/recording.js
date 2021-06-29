const mongoose = require('mongoose')

//TODO: buckets by month instead of day?
const recordingSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  count: {
    type: Number,
    required: true,
    default: 1
  },
  earliestTime: {
    type: Date,
    required: true
  },
  recordings: [{
    emailDeliveryDate: {
      type: Date,
      required: true
    },
    sentTo: {
      type: String,
      required: true
    },
    sentFrom: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    mediaType: {
      type: String,
      default: 'picture',
      required: true
    },
    mediaThumbnailURL: {
      type: String,
      required: true
    },
    mediaURL: {
      type: String,
      required: true
    },
    emailBody: {
      type: Map,
      of: String
    }
  }]
}, { timestamps: true })

module.exports = mongoose.model('Recording', recordingSchema)