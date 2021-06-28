const Recording = require('../models/recording')

const getAllRecordings = async () => {
  return await Recording.find({})
}

module.exports = { getAllRecordings }