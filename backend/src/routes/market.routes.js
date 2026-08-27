/**
 * Market Routes — /api/market
 */

import { Router } from 'express'
import { marketEngine } from '../market/market-engine.js'

const router = Router()

// POST /api/market/analyze
router.post('/analyze', async (req, res, next) => {
  try {
    const { businessType, location, radiusKm, financialContext } = req.body

    if (!businessType) {
      return res.status(400).json({
        success: false,
        error: { message: 'businessType is required' }
      })
    }

    const result = await marketEngine.analyzeMarket({
      businessType,
      location: location || {},
      radiusKm: Number(radiusKm) || 10,
      financialContext: financialContext || {}
    })

    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

export default router
