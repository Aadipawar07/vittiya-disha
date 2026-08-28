/**
 * Repayment Stress Test Engine — Deterministic Cash-Flow Analysis
 *
 * Tests loan repayment obligations under 4 revenue/income scenarios:
 * Optimistic (+20%), Expected (0%), Conservative (-20%), Severe (-40%).
 */

import { calculateEstimatedEmi } from '../engine/emi-calculator.js'
import stressConfig from './stress-test-config.json' with { type: 'json' }
import { STRESS_VERDICTS } from './types.js'

export class RepaymentStressEngine {
  constructor() {
    this.config = stressConfig
  }

  /**
   * Evaluates repayment stress across 4 scenarios.
   * @param {Object} params
   * @param {number} params.loanAmount - Principal loan amount in INR
   * @param {number} [params.annualInterestRate=8.0] - Annual interest rate percentage (e.g. 6.0 or 8.0)
   * @param {number} [params.tenureMonths=60] - Repayment tenure in months
   * @param {number} [params.tenureYears] - Repayment tenure in years (alternative to tenureMonths)
   * @param {number} params.monthlyIncome - Expected monthly disposable income / business cash flow
   * @param {number} [params.monthlyEMI] - Pre-calculated monthly EMI if provided by Financial Engine
   * @param {number} [params.monthlyExpenses] - Optional estimated monthly business expenses
   * @returns {Object} Deterministic stress test results
   */
  runStressTest({
    loanAmount = 0,
    annualInterestRate = 8.0,
    tenureMonths = 60,
    tenureYears,
    monthlyIncome = 0,
    monthlyEMI,
    monthlyExpenses
  }) {
    const principal = Math.max(0, Number(loanAmount) || 0)
    const rate = Math.max(0, Number(annualInterestRate) || 8.0)
    const months = tenureMonths ? Number(tenureMonths) : (Number(tenureYears) || 5) * 12
    const years = months / 12
    const income = Number(monthlyIncome) || 0

    // 1. Determine Monthly EMI from Financial Engine / canonical math
    let emi = 0
    let totalRepayment = 0
    let totalInterest = 0

    if (monthlyEMI !== undefined && monthlyEMI !== null && Number(monthlyEMI) > 0) {
      emi = Math.round(Number(monthlyEMI))
      totalRepayment = emi * months
      totalInterest = Math.max(0, totalRepayment - principal)
    } else if (principal > 0 && months > 0) {
      const calc = calculateEstimatedEmi(principal, rate, years)
      emi = Math.round(calc.emi)
      totalRepayment = calc.total_repayment
      totalInterest = calc.total_interest
    }

    // 2. Division-by-Zero Protection / Invalid Income Input
    if (income <= 0) {
      return {
        status: 'INSUFFICIENT_DATA',
        reason: 'A positive expected monthly business income is required to perform repayment stress testing.',
        monthlyEMI: emi,
        principal,
        annualInterestRate: rate,
        tenureMonths: months,
        baseMonthlyIncome: income,
        scenarios: [],
        disclaimer: this.config.disclaimers.mathematicalSimulation,
        limitationNote: 'Repayment stress testing is paused until expected monthly income is specified.'
      }
    }

    // 3. Evaluate the 4 Scenarios
    const scenarios = this.config.scenarios.map((sc) => {
      const adjIncome = Math.round(income * (1 + sc.incomeAdjustment))
      const ratio = adjIncome > 0 ? emi / adjIncome : 1.0
      const ratioPercent = Math.round(ratio * 10000) / 100 // e.g. 26.67
      const verdict = this._determineVerdict(ratio)

      return {
        scenario: sc.key,
        label: sc.label,
        incomeAdjustment: sc.incomeAdjustment,
        adjustmentPercent: `${sc.incomeAdjustment >= 0 ? '+' : ''}${Math.round(sc.incomeAdjustment * 100)}%`,
        monthlyIncome: adjIncome,
        monthlyEMI: emi,
        emiToIncomeRatio: Math.round(ratio * 10000) / 10000,
        ratioPercent,
        verdict: verdict.verdict,
        verdictLabel: verdict.label,
        verdictColor: verdict.color,
        description: sc.description
      }
    })

    const expectedScenario = scenarios.find((s) => s.scenario === 'EXPECTED') || scenarios[1]
    const conservativeScenario = scenarios.find((s) => s.scenario === 'CONSERVATIVE') || scenarios[2]
    const severeScenario = scenarios.find((s) => s.scenario === 'SEVERE') || scenarios[3]

    // 4. Deterministic Buffer & Capital Restructuring Math
    const targetComfortRatio = this.config.targetComfortRatio // 0.30 (30%)
    const requiredIncomeForTargetRatio = Math.round(emi / targetComfortRatio)
    const maximumAffordableEMI = Math.round(income * targetComfortRatio)

    // Calculate maximum affordable loan for 30% ratio at current rate & tenure
    let targetLoanForAffordableEMI = 0
    if (rate > 0 && months > 0 && maximumAffordableEMI > 0) {
      const monthlyRate = rate / 12 / 100
      const factor = ((1 + monthlyRate) ** months - 1) / (monthlyRate * (1 + monthlyRate) ** months)
      targetLoanForAffordableEMI = Math.round(maximumAffordableEMI * factor)
    }

    // 5. Tailored Recommendation Text based on scenario verdicts
    let recommendation = this.config.recommendations.comfortable
    let requiresBuffer = false

    if (severeScenario.verdict === STRESS_VERDICTS.HIGH_RISK) {
      recommendation = this.config.recommendations.severeHighRisk
      requiresBuffer = true
    } else if (conservativeScenario.verdict === STRESS_VERDICTS.TIGHT || conservativeScenario.verdict === STRESS_VERDICTS.HIGH_RISK) {
      recommendation = this.config.recommendations.tightScenario
      requiresBuffer = true
    }

    return {
      status: 'AVAILABLE',
      monthlyEMI: emi,
      principal,
      annualInterestRate: rate,
      tenureMonths: months,
      baseMonthlyIncome: income,
      baseEMIToIncomeRatio: expectedScenario.emiToIncomeRatio,
      baseRatioPercent: expectedScenario.ratioPercent,
      overallVerdict: expectedScenario.verdict,
      overallVerdictLabel: expectedScenario.verdictLabel,
      overallVerdictColor: expectedScenario.verdictColor,
      scenarios,
      recommendation,
      requiresBuffer,
      capitalStructure: {
        targetComfortRatioPercent: Math.round(targetComfortRatio * 100),
        requiredMonthlyIncomeForTarget: requiredIncomeForTargetRatio,
        maximumAffordableMonthlyEMI: maximumAffordableEMI,
        targetAffordableLoanAmount: targetLoanForAffordableEMI,
        surplusDeficitAtBaseline: income - requiredIncomeForTargetRatio
      },
      auditTrail: {
        stressRulesVersion: this.config.rulesVersion,
        tenureYears: years,
        totalRepayment,
        totalInterest,
        calculatedAt: new Date().toISOString()
      },
      disclaimers: {
        simulation: this.config.disclaimers.mathematicalSimulation,
        expensesNote: monthlyExpenses
          ? `Analysis includes reported operating expenses of ₹${Number(monthlyExpenses).toLocaleString('en-IN')}/month.`
          : this.config.disclaimers.incomeLimitation
      }
    }
  }

  /**
   * Maps an EMI-to-income ratio to a deterministic verdict.
   * @private
   */
  _determineVerdict(ratio) {
    for (const t of this.config.verdictThresholds) {
      if (ratio < t.maxRatio) {
        return t
      }
    }
    return this.config.verdictThresholds.at(-1)
  }
}

export const repaymentStressEngine = new RepaymentStressEngine()
