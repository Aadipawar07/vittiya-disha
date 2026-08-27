import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'

async function withServer(callback) {
  const server = createApp().listen(0)
  try { await callback(`http://127.0.0.1:${server.address().port}`) } finally { server.close() }
}

test('health endpoint works', () => withServer(async (base) => {
  const response = await fetch(`${base}/health`)
  assert.equal(response.status, 200)
  assert.equal((await response.json()).status, 'ok')
}))
test('recommendation endpoint validates and returns deterministic result with fallback', () => withServer(async (base) => {
  const response = await fetch(`${base}/api/schemes/recommend`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ corporation: 'NBCFDC', profile: { category: 'OBC', caste_certificate: true, annual_family_income: 250000 }, requirement: { purpose: 'business', project_cost: 800000, loan_required: 680000 } }) })
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.success, true)
  assert.equal(body.data.recommendation.scheme_code, 'NBCFDC_INDIVIDUAL')
  assert.equal(body.data.explanation.fallback, true)
  assert.equal(body.data.audit.engine_version, '1.0.0')
}))
test('invalid corporation returns consistent validation error', () => withServer(async (base) => {
  const response = await fetch(`${base}/api/schemes/recommend`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ corporation: 'INVALID', requirement: { purpose: 'business' } }) })
  const body = await response.json()
  assert.equal(response.status, 400)
  assert.equal(body.error.code, 'VALIDATION_ERROR')
}))

test('financial and business APIs return deterministic calculations', () => withServer(async (base) => {
  const financial = await fetch(`${base}/api/financial/calculate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ corporation: 'NSFDC', schemeId: 'NSFDC_MICRO_FINANCE', projectCost: 200000, requestedLoan: 180000 }) })
  const financialBody = await financial.json()
  assert.equal(financial.status, 200)
  assert.equal(financialBody.data.financing.eligibleLoan, 125000)
  assert.equal(financialBody.data.financing.beneficiaryContribution, 75000)

  const business = await fetch(`${base}/api/business/estimate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ businessType: 'grocery_shop', property: { path: 'RENTED_PROPERTY' }, monthlyRent: 10000, securityDepositMonths: 2 }) })
  const businessBody = await business.json()
  assert.equal(business.status, 200)
  assert.equal(businessBody.data.breakdown.rent_deposit.amount, 20000)
  assert.ok(businessBody.data.estimatedProjectCost > 0)
}))

test('composite financial recommendation adapts frontend business payload', () => withServer(async (base) => {
  const response = await fetch(`${base}/api/assessment/financial-recommendation`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ corporation: 'NBCFDC', profile: { category: 'OBC', caste_certificate: true, annual_family_income: 250000, district: 'Jalgaon' }, requirement: { purpose: 'business' }, business: { type: 'Dairy farming', status: 'new', project_cost: 800000, loan_required: 680000, own_contribution: 120000, existing_loans: false } }) })
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.data.business.estimatedProjectCost, 800000)
  assert.equal(body.data.financing.eligibleLoan, 680000)
}))
