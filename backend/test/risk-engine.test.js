import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { riskEngine } from '../src/risk/risk-engine.js'
import { RISK_FLAGS, RISK_SEVERITIES, RISK_LEVELS } from '../src/risk/types.js'

describe('RiskEngine Unit Tests', () => {
  // Test 1: Seasonal category
  it('identifies seasonal demand risk for seasonal category (dairy)', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'dairy',
      marketContext: { competitionScore: 75, poiConfidence: 'HIGH' }
    })
    const seasonal = res.flags.find((f) => f.flag === RISK_FLAGS.SEASONAL_DEMAND)
    assert.ok(seasonal, 'Seasonal demand flag should be present')
    assert.equal(seasonal.active, true)
    assert.equal(seasonal.severity, RISK_SEVERITIES.MEDIUM)
    assert.equal(seasonal.source, 'CATEGORY_RULE')
  })

  // Test 2: Non-seasonal category
  it('does not activate seasonal demand risk for stable category (grocery_shop)', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'grocery_shop',
      marketContext: { competitionScore: 80, poiConfidence: 'HIGH' }
    })
    const seasonal = res.flags.find((f) => f.flag === RISK_FLAGS.SEASONAL_DEMAND)
    assert.equal(seasonal, undefined, 'Seasonal flag should not exist for grocery_shop')
  })

  // Test 3: Single buyer = YES
  it('activates single buyer dependency when user confirms (yes)', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'dairy',
      userInputs: { singleBuyerDependency: true }
    })
    const singleBuyer = res.flags.find((f) => f.flag === RISK_FLAGS.SINGLE_BUYER_DEPENDENCY)
    assert.ok(singleBuyer)
    assert.equal(singleBuyer.active, true)
    assert.equal(singleBuyer.confidence, 'HIGH')
    assert.equal(singleBuyer.source, 'USER_REPORTED')
  })

  // Test 4: Single buyer = NO
  it('deactivates single buyer dependency when user explicitly denies (no)', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'dairy',
      userInputs: { singleBuyerDependency: false }
    })
    const singleBuyer = res.flags.find((f) => f.flag === RISK_FLAGS.SINGLE_BUYER_DEPENDENCY)
    assert.equal(singleBuyer, undefined, 'Should not flag single buyer when user reports no')
  })

  // Test 5: Single buyer = not_sure
  it('activates single buyer as medium confidence when user is not sure', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'dairy',
      userInputs: { singleBuyerDependency: 'not_sure' }
    })
    const singleBuyer = res.flags.find((f) => f.flag === RISK_FLAGS.SINGLE_BUYER_DEPENDENCY)
    assert.ok(singleBuyer)
    assert.equal(singleBuyer.confidence, 'MEDIUM')
  })

  // Test 5b: Single buyer absent for inherently exposed category
  it('flags potential risk with LOW confidence when user input is absent for exposed category', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'dairy',
      userInputs: {}
    })
    const singleBuyer = res.flags.find((f) => f.flag === RISK_FLAGS.SINGLE_BUYER_DEPENDENCY)
    assert.ok(singleBuyer)
    assert.equal(singleBuyer.potentialRisk, true)
    assert.equal(singleBuyer.confidence, 'LOW')
  })

  // Test 6: Supply chain fragility for perishable categories
  it('activates supply chain fragility for perishable category (dairy)', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'dairy'
    })
    const supply = res.flags.find((f) => f.flag === RISK_FLAGS.SUPPLY_CHAIN_FRAGILITY)
    assert.ok(supply)
    assert.equal(supply.active, true)
    assert.equal(supply.severity, RISK_SEVERITIES.HIGH)
  })

  // Test 7: High competition density
  it('activates high competition density when competitionScore is below 40', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'grocery_shop',
      marketContext: { competitionScore: 35, poiConfidence: 'HIGH' }
    })
    const comp = res.flags.find((f) => f.flag === RISK_FLAGS.HIGH_COMPETITION_DENSITY)
    assert.ok(comp)
    assert.equal(comp.active, true)
    assert.equal(comp.severity, RISK_SEVERITIES.HIGH)
    assert.equal(comp.source, 'MARKET_DATA')
  })

  // Test 8: Low POI coverage protection
  it('protects against low POI coverage by NOT flagging false density risk', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'grocery_shop',
      marketContext: { competitionScore: 20, poiCoverageConfidence: 'LOW' }
    })
    const comp = res.flags.find((f) => f.flag === RISK_FLAGS.HIGH_COMPETITION_DENSITY)
    assert.ok(comp)
    assert.equal(comp.active, false, 'Should be inactive due to low POI coverage')
    assert.equal(comp.confidence, 'LOW')
    assert.ok(comp.dataWarning, 'Should include dataWarning')
  })

  // Test 9 & 10: Zero competitors / insufficient market data
  it('handles zero competitors without false zero risk claim', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'grocery_shop',
      marketContext: { competitionScore: null, competitorCount10Km: 0, poiConfidence: 'LOW' }
    })
    assert.equal(res.confidence, 'LOW')
  })

  // Deterministic Risk Score calculation
  it('calculates deterministic RiskScore (0-100) based on severity penalties', () => {
    const res = riskEngine.evaluateRisks({
      businessType: 'grocery_shop',
      marketContext: { competitionScore: 85, poiConfidence: 'HIGH' },
      userInputs: { singleBuyerDependency: false }
    })
    assert.equal(res.activeFlagsCount, 0)
    assert.equal(res.riskScore, 95)
    assert.equal(res.overallRiskLevel, RISK_LEVELS.LOW)
  })
})
