/**
 * Location Routes — /api/location
 */

import { Router } from 'express'
import { geocodeAddress, reverseGeocode, validateCoordinates } from '../market/location-engine.js'

const router = Router()

// POST /api/location/geocode
router.post('/geocode', async (req, res, next) => {
  try {
    const address = req.body.address || req.body
    const result = await geocodeAddress(address)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// POST /api/location/reverse-geocode
router.post('/reverse-geocode', async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body
    if (!validateCoordinates(Number(latitude), Number(longitude))) {
      return res.status(400).json({ success: false, error: { message: 'Invalid latitude or longitude coordinates' } })
    }
    const result = await reverseGeocode(Number(latitude), Number(longitude))
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

export default router
