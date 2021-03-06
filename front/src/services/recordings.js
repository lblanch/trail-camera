import axios from 'axios'

const baseUrl = '/api/recordings'

const getInitialRecordings = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getRecordingsByPage = async (page) => {
  const response = await axios.get(`${baseUrl}/${page}`)
  return response.data
}

const getRecordingsByDate = async (endpoint, requestedDate) => {
  const response = await axios.get(`${baseUrl}/${endpoint}/${requestedDate}`)
  return response.data
}

const recordingsServices = { getRecordingsByPage, getInitialRecordings, getRecordingsByDate }

export default recordingsServices