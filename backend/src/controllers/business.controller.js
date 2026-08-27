import { createBusinessEstimate } from '../services/business.service.js'
export function estimate(request, response, next) { try { response.json({ success: true, data: createBusinessEstimate(request.body) }) } catch (error) { next(error) } }
