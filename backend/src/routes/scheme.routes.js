import { Router } from 'express'
import { recommend } from '../controllers/scheme.controller.js'
import { validate } from '../middleware/validation.js'
import { assessmentSchema } from '../schemas/assessment.schema.js'

const router = Router()
router.post('/recommend', validate(assessmentSchema), recommend)
export default router
