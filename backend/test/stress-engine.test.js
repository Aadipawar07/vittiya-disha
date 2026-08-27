import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { repaymentStressEngine } from '../src/risk/repayment-stress-engine.js'
import { STRESS_VERDICTS } from '../src/risk/types.js'

describe('RepaymentStressEngine Unit Tests', () => {
  // Test case from Prompt Section 57
  it('calculates expected, optimistic, conservative, and severe ratios accurately for baseline case', () => {
    const res = repaymentStressEngine.runStressTest({
      monthlyIncome: 30000,
      monthlyEMI: 8000
    })

    assert.equal(res.status, 'CALCULATED')
    assert.equal(res.monthlyEMI, 8000)
    assert.equal(res.baseMonthlyIncome, 30000)

    const opt = res.scenarios.find((s) => s.scenario === 'OPTIMISTIC')
    const exp = res.scenarios.find((s) => s.scenario === 'EXPECTED')
    const cons = res.scenarios.find((s) => s.scenario === 'CONSERVATIVE')
    const sev = res.scenarios.find((s) => s.scenario === 'SEVERE')

    // Expected: 8000 / 30000 = 26.67%
    assert.equal(exp.ratioPercent, 26.67)
    assert.equal(exp.verdict, STRESS_VERDICTS.COMFORTABLE)

    // Optimistic (+20% income = 36000): 8000 / 36000 = 22.22%
    assert.equal(opt.ratioPercent, 22.22)
    assert.equal(opt.verdict, STRESS_VERDICTS.COMFORTABLE)

    // Conservative (-20% income = 24000): 8000 / 24000 = 33.33%
    assert.equal(cons.ratioPercent, 33.33)
    assert.equal(cons.verdict, STRESS_VERDICTS.MANAGEABLE)

    // Severe (-40% income = 18000): 8000 / 18000 = 44.44%
    assert.equal(sev.ratioPercent, 44.44)
    assert.equal(sev.verdict, STRESS_VERDICTS.TIGHT)
  })

  // Test case for Zero / Negative Income
  it('handles zero or negative income safely with INSUFFICIENT_DATA without NaN or Infinity', () => {
    const resZero = repaymentStressEngine.runStressTest({
      monthlyIncome: 0,
      monthlyEMI: 8000
    })
    assert.equal(resZero.status, 'INSUFFICIENT_DATA')
    assert.equal(resZero.scenarios.length, 0)
    assert.equal(Number.isNaN(resZero.baseEMIToIncomeRatio), false)

    const resNeg = repaymentStressEngine.runStressTest({
      monthlyIncome: -5000,
      monthlyEMI: 8000
    })
    assert.equal(resNeg.status, 'INSUFFICIENT_DATA')
  })

  // Test High-Risk Case (Prompt Section 58)
  it('correctly evaluates high repayment risk (Income 20,000, EMI 12,000)', () => {
    const res = repaymentStressEngine.runStressTest({
      monthlyIncome: 20000,
      monthlyEMI: 12000
    })

    assert.equal(res.status, 'CALCULATED')
    assert.equal(res.baseRatioPercent, 60.0)
    assert.equal(res.overallVerdict, STRESS_VERDICTS.HIGH_RISK)

    const opt = res.scenarios.find((s) => s.scenario === 'OPTIMISTIC')
    const cons = res.scenarios.find((s) => s.scenario === 'CONSERVATIVE')
    const sev = res.scenarios.find((s) => s.scenario === 'SEVERE')

    // Optimistic (+20% income = 24000): 12000 / 24000 = 50.0% -> HIGH_RISK
    assert.equal(opt.ratioPercent, 50.0)
    assert.equal(opt.verdict, STRESS_VERDICTS.HIGH_RISK)

    // Conservative (-20% income = 16000): 12000 / 16000 = 75.0% -> HIGH_RISK
    assert.equal(cons.ratioPercent, 75.0)
    assert.equal(cons.verdict, STRESS_VERDICTS.HIGH_RISK)

    // Severe (-40% income = 12000): 12000 / 12000 = 100.0% -> HIGH_RISK
    assert.equal(sev.ratioPercent, 100.0)
    assert.equal(sev.verdict, STRESS_VERDICTS.HIGH_RISK)

    assert.equal(res.requiresBuffer, true)
  })

  // Test Low-Risk Case (Prompt Section 59)
  it('correctly evaluates comfortable low-risk profile (Income 50,000, EMI 7,000)', () => {
    const res = repaymentStressEngine.runStressTest({
      monthlyIncome: 50000,
      monthlyEMI: 7000
    })

    assert.equal(res.status, 'CALCULATED')
    // Expected: 7000 / 50000 = 14.0%
    assert.equal(res.baseRatioPercent, 14.0)
    assert.equal(res.overallVerdict, STRESS_VERDICTS.COMFORTABLE)

    const sev = res.scenarios.find((s) => s.scenario === 'SEVERE')
    // Severe (-40% income = 30000): 7000 / 30000 = 23.33%
    assert.equal(sev.ratioPercent, 23.33)
    assert.equal(sev.verdict, STRESS_VERDICTS.COMFORTABLE)
  })

  // Test Capital Restructuring Math
  it('calculates deterministic capital structure targets', () => {
    const res = repaymentStressEngine.runStressTest({
      monthlyIncome: 26000,
      monthlyEMI: 8000,
      loanAmount: 700000,
      annualInterestRate: 8.0,
      tenureMonths: 84
    })

    assert.equal(res.capitalStructure.targetComfortRatioPercent, 30)
    // Required Income = 8000 / 0.30 = 26667
    assert.equal(res.capitalStructure.requiredMonthlyIncomeForTarget, 26667)
    // Max Affordable EMI = 26000 * 0.30 = 7800
    assert.equal(res.capitalStructure.maximumAffordableMonthlyEMI, 7800)
    assert.ok(res.capitalStructure.targetAffordableLoanAmount > 0)
  })
})
