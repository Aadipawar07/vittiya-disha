import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'

createApp().listen(env.port, () => logger.info('server_started', { port: env.port }))
