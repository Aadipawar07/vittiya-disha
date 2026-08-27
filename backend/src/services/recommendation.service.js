import { normalizeUser } from '../utils/normalize.js'
import { recommendScheme } from '../engine/scheme-engine.js'
import { explainRecommendation } from '../ai/explanation-service.js'

export async function createRecommendation(input, repository, provider) {
  const user = normalizeUser(input)
  const recommendation = recommendScheme(user, repository)
  const explanation = await explainRecommendation(recommendation.bestMatch, user, provider)
  recommendation.audit.ai_explanation_generated = explanation.generated
  const result = recommendation.bestMatch
  return { assessment_id: recommendation.audit.assessment_id, engine_version: recommendation.audit.engine_version, corporation: user.corporation, recommendation: { scheme_code: result?.scheme_code, scheme_name: result?.scheme_name, status: result?.status, match_score: result?.match_score }, financial: result?.financial, interest: result?.interest, repayment: result?.repayment, emi: result?.emi, eligibility: { passed: result?.rules.filter((rule) => rule.result === 'PASS'), failed: result?.rules.filter((rule) => rule.result === 'FAIL'), unknown: result?.rules.filter((rule) => rule.result === 'UNKNOWN'), verification_required: result?.missing_information }, explanation, alternatives: recommendation.alternatives, audit: recommendation.audit, disclaimer: 'This deterministic assessment is not a guarantee of government approval. Official documents and channel-partner verification are required.' }
}
