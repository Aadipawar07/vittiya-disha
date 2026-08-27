import { NemotronProvider } from './nemotron/nemotron.provider.js'

function fallback(result) {
  const passed = result.rules.filter((rule) => rule.result === 'PASS').map((rule) => rule.rule)
  const failed = result.rules.filter((rule) => rule.result === 'FAIL').map((rule) => rule.rule)
  const status = result.status === 'ELIGIBLE' ? 'matches the recorded requirements' : result.status === 'NOT_ELIGIBLE' ? 'does not meet one or more recorded requirements' : 'needs more information or verification'
  return { generated: false, fallback: true, provider: 'deterministic-template', summary: `This assessment ${status} for ${result.scheme_name}.`, why_this_scheme: passed.length ? [`Deterministic rules passed: ${passed.join(', ')}.`] : [], eligibility_explanation: failed.length ? [`Deterministic rules failed: ${failed.join(', ')}.`] : [`Current status: ${result.status}.`], financial_explanation: `The estimated eligible loan is INR ${result.financial.eligible_loan}.`, verification_required: result.missing_information, important_note: 'Final eligibility is subject to official and channel-partner verification.' }
}

export async function explainRecommendation(result, user, provider = new NemotronProvider()) {
  try { return { generated: true, fallback: false, provider: 'nemotron', ...await provider.generateExplanation({ normalized_user: user, deterministic_result: result, rules: result.rules, financial: result.financial, metadata: { scheme_code: result.scheme_code, scheme_name: result.scheme_name } }) } } catch { return fallback(result) }
}
