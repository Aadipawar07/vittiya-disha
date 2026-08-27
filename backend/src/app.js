import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import schemeRoutes from './routes/scheme.routes.js'
import { env } from './config/env.js'
import { notFound, errorHandler } from './middleware/error-handler.js'
import financialRoutes from './routes/financial.routes.js'
import businessRoutes from './routes/business.routes.js'
import lenderRoutes from './routes/lender.routes.js'
import assessmentFinancialRoutes from './routes/assessment-financial.routes.js'

export function createApp() {
  const app = express()
  app.use(helmet())
  app.use(cors({ origin: env.corsOrigins }))
  app.use(express.json({ limit: '32kb' }))
  app.get('/health', (request, response) => response.json({ status: 'ok', service: 'vittiya-disha-backend' }))
  app.use('/api/schemes', rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }), schemeRoutes)
  app.use('/api/financial', financialRoutes)
  app.use('/api/business', businessRoutes)
  app.use('/api/lenders', lenderRoutes)
  app.use('/api/assessment', assessmentFinancialRoutes)
  app.use(notFound)
  app.use(errorHandler)
  return app
}
