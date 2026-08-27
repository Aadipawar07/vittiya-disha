import { Router } from 'express'
import { financialRecommendation } from '../controllers/assessment-financial.controller.js'
import { validate } from '../middleware/validation.js'
import { assessmentSchema } from '../schemas/assessment.schema.js'
const router = Router()
router.post('/financial-recommendation', validate(assessmentSchema), financialRecommendation)
export default router
