import { describe, test, expect } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import RepaymentStressTest from '../RepaymentStressTest.jsx'
import RiskSection from '../../risk/RiskSection.jsx'

describe('RepaymentStressTest UI Component', () => {
  const MOCK_STRESS = {
    status: 'CALCULATED',
    monthlyEMI: 8000,
    principal: 700000,
    annualInterestRate: 8.0,
    tenureMonths: 60,
    baseMonthlyIncome: 30000,
    baseRatioPercent: 26.67,
    overallVerdict: 'COMFORTABLE',
    overallVerdictLabel: 'Comfortable',
    overallVerdictColor: 'go',
    scenarios: [
      {
        scenario: 'OPTIMISTIC',
        label: 'Optimistic (+20%)',
        incomeAdjustment: 0.20,
        adjustmentPercent: '+20%',
        monthlyIncome: 36000,
        monthlyEMI: 8000,
        ratioPercent: 22.22,
        verdict: 'COMFORTABLE',
        description: 'Strong adoption'
      },
      {
        scenario: 'EXPECTED',
        label: 'Expected (Baseline)',
        incomeAdjustment: 0.00,
        adjustmentPercent: '+0%',
        monthlyIncome: 30000,
        monthlyEMI: 8000,
        ratioPercent: 26.67,
        verdict: 'COMFORTABLE',
        description: 'Planned target'
      },
      {
        scenario: 'CONSERVATIVE',
        label: 'Conservative (-20%)',
        incomeAdjustment: -0.20,
        adjustmentPercent: '-20%',
        monthlyIncome: 24000,
        monthlyEMI: 8000,
        ratioPercent: 33.33,
        verdict: 'MANAGEABLE',
        description: 'Slow traction'
      },
      {
        scenario: 'SEVERE',
        label: 'Severe (-40%)',
        incomeAdjustment: -0.40,
        adjustmentPercent: '-40%',
        monthlyIncome: 18000,
        monthlyEMI: 8000,
        ratioPercent: 44.44,
        verdict: 'TIGHT',
        description: 'Adverse shock'
      }
    ],
    capitalStructure: {
      targetComfortRatioPercent: 30,
      requiredMonthlyIncomeForTarget: 26667,
      maximumAffordableMonthlyEMI: 9000,
      targetAffordableLoanAmount: 787000
    },
    recommendation: 'Repayment burden remains comfortable across tested operating scenarios.'
  }

  test('renders hero baseline result and scenario percentages', () => {
    render(<RepaymentStressTest repaymentStress={MOCK_STRESS} />)

    expect(screen.getByText(/Can your business handle the repayment\?/i)).toBeInTheDocument()
    expect(screen.getAllByText('26.67%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('22.22%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('33.33%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('44.44%').length).toBeGreaterThanOrEqual(1)
  })

  test('renders graceful message when monthly income is missing', () => {
    render(<RepaymentStressTest repaymentStress={{ status: 'INSUFFICIENT_DATA', baseMonthlyIncome: 0 }} />)

    expect(screen.getByText(/Repayment stress test unavailable/i)).toBeInTheDocument()
  })
})

describe('RiskSection UI Component', () => {
  const MOCK_RISK = {
    riskScore: 65,
    overallRiskLevel: 'MEDIUM',
    activeFlagsCount: 2,
    confidence: 'HIGH',
    flags: [
      {
        flag: 'SEASONAL_DEMAND',
        name: 'Seasonal Demand Volatility',
        active: true,
        severity: 'MEDIUM',
        confidence: 'HIGH',
        source: 'CATEGORY_RULE',
        reason: 'Milk yields vary between seasons.',
        mitigation: 'Build silage reserves.'
      },
      {
        flag: 'SUPPLY_CHAIN_FRAGILITY',
        name: 'Supply Chain Fragility',
        active: true,
        severity: 'HIGH',
        confidence: 'HIGH',
        source: 'CATEGORY_RULE',
        reason: 'Raw milk is highly perishable.',
        mitigation: 'Ensure chilling logistics.'
      }
    ]
  }

  test('renders risk score metrics and active flag cards with mitigations', () => {
    render(<RiskSection risk={MOCK_RISK} />)

    expect(screen.getByText(/Business Risk Analysis/i)).toBeInTheDocument()
    expect(screen.getByText('65')).toBeInTheDocument()
    expect(screen.getByText('Seasonal Demand Volatility')).toBeInTheDocument()
    expect(screen.getByText('Supply Chain Fragility')).toBeInTheDocument()
    expect(screen.getByText(/Build silage reserves/i)).toBeInTheDocument()
  })
})
