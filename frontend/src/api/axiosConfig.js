import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_API_URL : '/api',
  withCredentials: true, // send cookies (refresh token)
  timeout: 15000,
})

export default axiosInstance
