import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
})

export async function submitFinancialAssessment(payload) {
  try {
    const response = await client.post('/api/assessment/financial-recommendation', payload)
    return response.data
  } catch (error) {
    const message = error.response?.data?.error?.message || 'We could not calculate your funding options.'
    throw new Error(message)
  }
}
