/**
 * Risk Routes — /api/risk
 *
 * Exposes deterministic endpoints for:
 * 1. POST /api/risk/analyze — Category risk evaluation & RiskScore
 * 2. POST /api/risk/stress-test — Repayment stress testing & interactive simulation
 */

import { Router } from 'express'
import { riskEngine } from '../risk/risk-engine.js'
import { repaymentStressEngine } from '../risk/repayment-stress-engine.js'

const router = Router()

// POST /api/risk/analyze
router.post('/analyze', (req, res, next) => {
  try {
    const { businessType, market, userInputs } = req.body || {}

    const result = riskEngine.evaluateRisks({
      businessType,
      marketContext: market || {},
      userInputs: userInputs || {}
    })

    res.json({
      status: 'SUCCESS',
      data: result
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/risk/stress-test
router.post('/stress-test', (req, res, next) => {
  try {
    const { loanAmount, interestRate, tenureMonths, tenureYears, monthlyIncome, monthlyEMI, monthlyExpenses } = req.body || {}

    const result = repaymentStressEngine.runStressTest({
      loanAmount: Number(loanAmount) || 0,
      annualInterestRate: interestRate !== undefined ? Number(interestRate) : 8.0,
      tenureMonths: Number(tenureMonths) || 60,
      tenureYears: Number(tenureYears) || 5,
      monthlyIncome: Number(monthlyIncome) || 0,
      monthlyEMI: monthlyEMI !== undefined ? Number(monthlyEMI) : undefined,
      monthlyExpenses: monthlyExpenses !== undefined ? Number(monthlyExpenses) : undefined
    })

    res.json({
      status: 'SUCCESS',
      data: result
    })
  } catch (err) {
    next(err)
  }
})

export default router
