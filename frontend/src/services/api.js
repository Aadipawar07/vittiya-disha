// API service - all HTTP calls routed through this module
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
})

export default apiClient

export async function submitAssessment(payload) {
  if (import.meta.env.VITE_USE_MOCK_API !== 'false') {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve({ received: true, recommendation: null }), 900)
    })
  }

  const response = await apiClient.post('/api/schemes/recommend', payload)
  return response.data
}
