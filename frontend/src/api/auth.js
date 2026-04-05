import axiosInstance from './axiosConfig'

export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login:    (data) => axiosInstance.post('/auth/login', data),
  logout:   ()     => axiosInstance.post('/auth/logout'),
  refresh:  ()     => axiosInstance.post('/auth/refresh'),
  getMe:    ()     => axiosInstance.get('/auth/me'),
}
