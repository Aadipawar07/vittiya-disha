import { Router } from 'express'
import { list } from '../controllers/lender.controller.js'
const router = Router()
router.get('/', list)
export default router
