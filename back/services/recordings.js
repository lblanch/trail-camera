const Recording = require('../models/recording')

const getRecordingsByPage = async (pageNumber) => {
  return await Recording.findOne({}, null, { sort: { date: -1, earliestTime: -1 }, skip: pageNumber })
}

module.exports = { getRecordingsByPage }