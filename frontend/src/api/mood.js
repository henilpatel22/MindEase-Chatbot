import axiosInstance from './axiosConfig'

export const moodAPI = {
  getLogs:  (days = 30) => axiosInstance.get(`/mood/logs?days=${days}`),
  getStats: (days = 7)  => axiosInstance.get(`/mood/stats?days=${days}`),
}
