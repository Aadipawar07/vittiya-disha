import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nemotronBaseUrl: process.env.NEMOTRON_BASE_URL || '',
  nemotronModel: process.env.NEMOTRON_MODEL || '',
  nemotronApiKey: process.env.NEMOTRON_API_KEY || '',
  nemotronTimeoutMs: Number(process.env.NEMOTRON_TIMEOUT_MS || 5000)
}
