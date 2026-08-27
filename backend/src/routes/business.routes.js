import { Router } from 'express'
import { estimate } from '../controllers/business.controller.js'
import { validate } from '../middleware/validation.js'
import { businessEstimateSchema } from '../schemas/financial.schema.js'
const router = Router()
router.post('/estimate', validate(businessEstimateSchema), estimate)
export default router
