import axios from 'axios'

const baseUrl = '/api/auth'

const login = async (credentials) => {
  const response = await axios.post(`${baseUrl}/login`, credentials)
  return response.data
}

const loginServices = { login }

export default loginServices