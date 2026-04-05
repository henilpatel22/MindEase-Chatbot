import axiosInstance from './axiosConfig'

export const chatAPI = {
  /**
   * Send a message with optional face emotion + conversation context.
   * @param {{ message, conversationId, faceEmotion, faceEmotionScore, context }} data
   */
  sendMessage:     (data) => axiosInstance.post('/chat/message', data),
  getHistory:      ()     => axiosInstance.get('/chat/history'),
  getConversation: (id)   => axiosInstance.get(`/chat/conversation/${id}`),
  clearHistory:    ()     => axiosInstance.delete('/chat/history'),
}
