import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateFinancialRecommendation } from '../src/financial/financial-engine.js'
import { calculateTier, calculateFundingGap, projectCostFromMargin } from '../src/financial/calculators.js'
import { estimateBusinessCost } from '../src/business/business-cost-engine.js'
import { eligibleLenders } from '../src/lenders/lender-matcher.js'

const input = (projectCost, requestedLoan = projectCost) => ({ schemeId: 'NSFDC_TERM_LOAN', projectCost, requestedLoan, business: {} })
test('core financial formulas calculate margin and funding gap', () => {
  assert.equal(projectCostFromMargin(100000, 0.1), 1000000)
  assert.equal(calculateFundingGap(1000000, 810000, 100000), 90000)
  const result = calculateFinancialRecommendation(input(1000000, 800000))
  assert.equal(result.financing.schemeFinancingCapacity, 900000)
  assert.equal(result.financing.eligibleLoan, 800000)
  assert.equal(result.financing.beneficiaryContribution, 200000)
  assert.equal(result.interest.rate, 8)
  assert.equal(result.emi.officialSchedule, false)
})
test('NSFDC tiers have exact boundary behavior', () => {
  assert.equal(calculateTier(125000), 'MICRO_CREDIT')
  assert.equal(calculateTier(125001), 'TERM_LOAN')
  assert.equal(calculateTier(5000000), 'TERM_LOAN')
  assert.equal(calculateTier(5000001), 'SPECIAL_SANCTION_REQUIRED')
  assert.equal(calculateFinancialRecommendation(input(5000001)).status, 'SPECIAL_SANCTION_REQUIRED')
})
test('NBCFDC uses 85 percent and explicit two-sided interest tiers', () => {
  const result = calculateFinancialRecommendation({ schemeId: 'NBCFDC_INDIVIDUAL', projectCost: 1000000, requestedLoan: 1000000 })
  assert.equal(result.financing.schemePercentage, 0.85)
  assert.equal(result.financing.eligibleLoan, 850000)
  assert.deepEqual({ corporationRate: result.interest.corporationRate, beneficiaryRate: result.interest.beneficiaryRate }, { corporationRate: 5, beneficiaryRate: 8 })
})
test('range rates do not produce a fabricated EMI', () => {
  const result = calculateFinancialRecommendation({ schemeId: 'NSFDC_UDYAM_NIDHI', projectCost: 400000, requestedLoan: 300000 })
  assert.deepEqual({ min: result.interest.minRate, max: result.interest.maxRate }, { min: 13, max: 15 })
  assert.equal(result.emi.unavailableReason, 'Rate range requires an explicit scenario rate')
})
test('business costs are deterministic, transparent, and range-aware', () => {
  const result = estimateBusinessCost({ businessType: 'grocery_shop', property: { path: 'RENTED_PROPERTY' }, monthlyRent: 10000, securityDepositMonths: 3, workingCapital: { monthlyOperatingExpense: 20000, months: 3 }, equipment: [{ quantity: 2, unitCost: 10000 }], marketingBudget: 5000 })
  assert.equal(result.breakdown.rent_deposit.amount, 30000)
  assert.equal(result.breakdown.equipment.amount, 20000)
  assert.equal(result.breakdown.working_capital.amount, 60000)
  assert.ok(result.costRange.high >= result.costRange.low)
})
test('lender matching filters district and scheme without inventing charges', () => {
  const lenders = eligibleLenders({ district: 'Jalgaon', schemeId: 'NSFDC_EDUCATION', beneficiaryRate: 6.5 })
  assert.equal(lenders.length, 0)
  const matched = eligibleLenders({ district: 'Jalgaon', schemeId: 'NSFDC_TERM_LOAN', beneficiaryRate: 8 })
  assert.equal(matched[0].beneficiaryRate, 8)
  assert.equal(matched[0].processingFee, null)
})
