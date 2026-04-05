import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // send cookies (refresh token)
  timeout: 15000,
})

export default axiosInstance
