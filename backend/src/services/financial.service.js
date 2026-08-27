import { calculateFinancialRecommendation } from '../financial/financial-engine.js'
import { estimateBusinessCost, estimateScenarios } from '../business/index.js'
import { eligibleLenders } from '../lenders/index.js'
import { getFinancialRules } from '../financial/financial-rules.js'

export function calculateFinancial(input) {
  const financial = calculateFinancialRecommendation(input)
  const rate = financial.interest.rate ?? financial.interest.beneficiaryRate
  return { ...financial, lenders: eligibleLenders({ district: input.district || input.profile?.district, schemeId: input.schemeId, beneficiaryRate: rate }) }
}

export function estimateFinancial(input) {
  const businessInput = input.business || input
  const business = estimateBusinessCost(businessInput)
  const result = calculateFinancial({ ...input, projectCost: input.projectCost ?? business.estimatedProjectCost })
  return { business, financial: result }
}

export function getSchemeFinancialConfiguration(schemeId) { const rules = getFinancialRules(schemeId); if (!rules) throw Object.assign(new Error('Unknown financial scheme'), { statusCode: 404, code: 'UNKNOWN_SCHEME' }); return rules }
export function getSchemeRate(schemeId) { const rules = getSchemeFinancialConfiguration(schemeId); return rules.interest.beneficiaryRate ?? null }
export { estimateScenarios }
