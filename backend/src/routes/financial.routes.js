import { Router } from 'express'
import { calculate, configuration, estimate } from '../controllers/financial.controller.js'
import { validate } from '../middleware/validation.js'
import { financialSchema } from '../schemas/financial.schema.js'
const router = Router()
router.post('/estimate', validate(financialSchema), estimate)
router.post('/calculate', validate(financialSchema), calculate)
router.get('/scheme/:schemeId', configuration)
export default router
