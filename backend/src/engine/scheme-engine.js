import { randomUUID } from 'node:crypto'
import { ENGINE_VERSION, STATUS } from '../config/constants.js'
import { evaluateRules, statusFromRules } from './rule-evaluator.js'
import { calculateEligibleLoan, calculateRequiredContribution } from './financial-calculator.js'
import { calculateEstimatedEmi } from './emi-calculator.js'
import { calculateSchemeScore, rankSchemeResults } from './ranking-engine.js'

function annualRate(interest) { return interest.rate ?? interest.rate_min ?? 0 }

export function evaluateScheme(user, scheme) {
  const rules = evaluateRules(user, scheme.eligibility_rules)
  const status = statusFromRules(rules)
  const r = user.requirement
  const base = scheme.financial_rules
  const projectCost = r.project_cost || user.group.project_cost || user.education.course_fee || 0
  const requested = r.loan_required || 0
  const maximum = typeof base.maximum === 'function' ? base.maximum(user) : base.maximum
  const eligibleLoan = base.courseFee ? Math.min(requested, (user.education.course_fee || 0) * base.financing_percentage, maximum) : base.group ? Math.max(0, Math.min(requested, projectCost * base.financing_percentage, maximum, (user.group.group_size || 0) * base.per_beneficiary)) : Math.max(0, Math.min(requested, projectCost * (base.financing_percentage ?? 1), maximum))
  const financial = { requested_loan: requested, eligible_loan: eligibleLoan, required_own_contribution: calculateRequiredContribution(projectCost, eligibleLoan) }
  const interest = scheme.interest_rules.tiered ? (eligibleLoan <= scheme.interest_rules.threshold ? scheme.interest_rules.low_amount : scheme.interest_rules.high_amount) : scheme.interest_rules
  const repayment = { tenure_years: scheme.repayment_rules.tenure_years, moratorium_months: scheme.repayment_rules.moratorium_months }
  const result = { scheme_code: scheme.scheme_code, scheme_name: scheme.scheme_name, corporation: scheme.corporation, description: scheme.description, status, purposeMatch: scheme.purpose.includes(r.purpose), rules, rule_ids: rules.map((rule) => rule.rule_id), financial, interest, repayment, emi: calculateEstimatedEmi(eligibleLoan, annualRate(interest), repayment.tenure_years), required_documents: scheme.required_documents, verification_conditions: scheme.verification_conditions, source_reference: scheme.source_reference }
  return { ...result, ...calculateSchemeScore(result), missing_information: rules.filter((rule) => rule.result === 'UNKNOWN').map((rule) => rule.rule) }
}

export function recommendScheme(user, repository) {
  const evaluations = repository.getActiveSchemes(user.corporation).map((scheme) => evaluateScheme(user, scheme))
  const ranked = rankSchemeResults(evaluations)
  const bestMatch = ranked.find((result) => result.status === STATUS.ELIGIBLE) || ranked.find((result) => result.status === STATUS.NEEDS_VERIFICATION) || ranked[0]
  const audit = { assessment_id: randomUUID(), timestamp: new Date().toISOString(), corporation: user.corporation, engine_version: ENGINE_VERSION, evaluated_schemes: ranked.map((result) => result.scheme_code), selected_scheme: bestMatch?.scheme_code || null, rule_results: ranked.flatMap((result) => result.rules), financial_calculations: bestMatch?.financial || {}, ai_explanation_generated: false }
  return { bestMatch, alternatives: ranked.filter((result) => result.scheme_code !== bestMatch?.scheme_code), audit }
}
