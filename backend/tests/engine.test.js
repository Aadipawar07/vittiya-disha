import test from 'node:test'
import assert from 'node:assert/strict'
import { SchemeRepository } from '../src/repositories/scheme.repository.js'
import { normalizeUser } from '../src/utils/normalize.js'
import { evaluateScheme, recommendScheme } from '../src/engine/scheme-engine.js'
import { calculateEligibleLoan, calculateSanitationFinancingGap } from '../src/engine/financial-calculator.js'
import { calculateEstimatedEmi } from '../src/engine/emi-calculator.js'
import { explainRecommendation } from '../src/ai/explanation-service.js'

const repository = new SchemeRepository()
const user = (overrides = {}) => normalizeUser({ corporation: 'NBCFDC', profile: { category: 'OBC', caste_certificate: true, annual_family_income: 250000 }, requirement: { purpose: 'business', project_cost: 800000, loan_required: 680000, ...overrides } })

test('registry contains all 17 active schemes', () => assert.equal(repository.getAllSchemes().length, 17))
test('NBCFDC individual valid case is eligible and capped at 85 percent', () => {
  const result = recommendScheme(user(), repository).bestMatch
  assert.equal(result.scheme_code, 'NBCFDC_INDIVIDUAL')
  assert.equal(result.status, 'ELIGIBLE')
  assert.equal(result.financial.eligible_loan, 680000)
  assert.ok(result.rules.every((rule) => rule.result === 'PASS'))
})
test('known failed income condition is not eligible', () => {
  const result = evaluateScheme(normalizeUser({ corporation: 'NBCFDC', profile: { category: 'OBC', caste_certificate: true, annual_family_income: 400000 }, requirement: { purpose: 'business', project_cost: 800000, loan_required: 680000 } }), repository.getSchemeByCode('NBCFDC_INDIVIDUAL'))
  assert.equal(result.status, 'NOT_ELIGIBLE')
})
test('missing caste proof needs verification rather than failing', () => {
  const result = recommendScheme(normalizeUser({ corporation: 'NBCFDC', profile: { category: 'OBC', caste_certificate: null, annual_family_income: 250000 }, requirement: { purpose: 'business', project_cost: 800000, loan_required: 680000 } }), repository).bestMatch
  assert.equal(result.status, 'NEEDS_VERIFICATION')
})
test('SHG exactly at 60 percent passes', () => {
  const result = recommendScheme(normalizeUser({ corporation: 'NBCFDC', requirement: { purpose: 'group' }, group: { group_size: 10, backward_class_members: 6, project_cost: 1000000, loan_required: 500000 } }), repository).bestMatch
  assert.equal(result.scheme_code, 'NBCFDC_GROUP')
  assert.equal(result.status, 'ELIGIBLE')
})
test('reusable calculators handle finance and zero interest', () => {
  assert.equal(calculateEligibleLoan({ loanRequired: 900000, projectCost: 1000000, financingPercentage: 0.85, maximum: 1500000 }), 850000)
  assert.equal(calculateSanitationFinancingGap({ projectCost: 100, subsidyAmount: 30, ownContribution: 20 }), 50)
  assert.equal(calculateEstimatedEmi(1200, 0, 1).emi, 100)
})
test('NSKFDC group sanitation uses group maximum', () => {
  const result = recommendScheme(normalizeUser({ corporation: 'NSKFDC', profile: {}, requirement: { purpose: 'sanitation_enterprise', project_cost: 4000000, loan_required: 4000000 }, nskfdc: { beneficiary_type: 'Safai Karamchari', applicant_type: 'Group' } }), repository).bestMatch
  assert.equal(result.scheme_code, 'NSKFDC_SWACHHTA_UDYAMI')
  assert.equal(result.financial.eligible_loan, 4000000)
})
test('Nemotron contradiction cannot override deterministic NOT_ELIGIBLE', async () => {
  const result = evaluateScheme(normalizeUser({ corporation: 'NBCFDC', profile: { category: 'Other', caste_certificate: true, annual_family_income: 250000 }, requirement: { purpose: 'business', project_cost: 800000, loan_required: 680000 } }), repository.getSchemeByCode('NBCFDC_INDIVIDUAL'))
  assert.equal(result.status, 'NOT_ELIGIBLE')
  const explanation = await explainRecommendation(result, {}, { generateExplanation: async () => ({ summary: 'User is eligible.', why_this_scheme: ['Contradictory claim'] }) })
  assert.equal(explanation.generated, true)
  assert.equal(result.status, 'NOT_ELIGIBLE')
  assert.equal(result.scheme_code, 'NBCFDC_INDIVIDUAL')
})
