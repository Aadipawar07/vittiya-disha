import { eligibleLenders } from '../lenders/index.js'
import { getSchemeRate } from '../services/financial.service.js'
export function list(request, response, next) { try { const { district, schemeId } = request.query; response.json({ success: true, data: eligibleLenders({ district, schemeId, beneficiaryRate: getSchemeRate(schemeId) }) }) } catch (error) { next(error) } }
