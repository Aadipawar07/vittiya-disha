import { normalizeUser } from '../utils/normalize.js'
import { recommendScheme } from '../engine/scheme-engine.js'
import { SchemeRepository } from '../repositories/scheme.repository.js'
import { estimateFinancial } from '../services/financial.service.js'

const repository = new SchemeRepository()
export function financialRecommendation(request, response, next) {
  try {
    const user = normalizeUser(request.body)
    const recommendation = recommendScheme(user, repository)
    if (!recommendation.bestMatch) throw Object.assign(new Error('No scheme route could be evaluated'), { statusCode: 422, code: 'NO_SCHEME_MATCH' })
    const result = estimateFinancial({ ...request.body, schemeId: recommendation.bestMatch.scheme_code, projectCost: user.requirement.project_cost, requestedLoan: user.requirement.loan_required, district: user.profile.district })
    response.json({ success: true, data: { scheme: { corporation: user.corporation, schemeId: recommendation.bestMatch.scheme_code, schemeVersion: result.financial.audit.schemeVersion }, recommendation: { ...recommendation.bestMatch, alternatives: recommendation.alternatives }, business: result.business, ...result.financial, eligibility: { status: recommendation.bestMatch.status, rules: recommendation.bestMatch.rules } } })
  } catch (error) { next(error) }
}
