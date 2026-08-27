import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT || 5000),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000').split(',').map((origin) => origin.trim()).filter(Boolean),
  nemotronBaseUrl: process.env.NEMOTRON_BASE_URL || '',
  nemotronModel: process.env.NEMOTRON_MODEL || '',
  nemotronApiKey: process.env.NEMOTRON_API_KEY || '',
  nemotronTimeoutMs: Number(process.env.NEMOTRON_TIMEOUT_MS || 5000)
}
