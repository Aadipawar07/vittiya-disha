/**
 * Interactive Loan & Repayment Adjustment Simulation
 *
 * Lets the applicant interactively simulate "Try a lower loan amount" or
 * "Adjust monthly income" to instantly see how their EMI and stress verdicts change.
 * Uses 100% deterministic mathematics.
 */

import { useState, useMemo } from 'react'
import { Sliders, RefreshCw, ArrowRight } from 'lucide-react'
import RepaymentBurdenBadge from './RepaymentBurdenBadge.jsx'

function calculateSimulatedEmi(principal, annualRate = 8.0, tenureYears = 5) {
  const payments = tenureYears * 12
  if (!principal || !payments) return 0
  const monthlyRate = annualRate / 12 / 100
  if (monthlyRate === 0) return Math.round(principal / payments)
  const emi = (principal * monthlyRate * ((1 + monthlyRate) ** payments)) / (((1 + monthlyRate) ** payments) - 1)
  return Math.round(emi)
}

export default function InteractiveLoanSlider({
  initialLoanAmount = 700000,
  initialMonthlyIncome = 26000,
  annualInterestRate = 8.0,
  tenureYears = 5
}) {
  const [loanAmount, setLoanAmount] = useState(initialLoanAmount)
  const [monthlyIncome, setMonthlyIncome] = useState(initialMonthlyIncome)

  const minLoan = Math.max(50000, Math.round(initialLoanAmount * 0.3))
  const maxLoan = Math.max(initialLoanAmount, Math.round(initialLoanAmount * 1.5))
  const step = 25000

  // Pure deterministic calculations
  const simulation = useMemo(() => {
    const emi = calculateSimulatedEmi(loanAmount, annualInterestRate, tenureYears)

    const calcScenario = (adj) => {
      const inc = Math.round(monthlyIncome * (1 + adj))
      const ratio = inc > 0 ? emi / inc : 1.0
      const ratioPercent = Math.round(ratio * 10000) / 100
      let verdict = 'HIGH_RISK'
      if (ratio < 0.30) verdict = 'COMFORTABLE'
      else if (ratio < 0.40) verdict = 'MANAGEABLE'
      else if (ratio < 0.50) verdict = 'TIGHT'
      return { income: inc, ratioPercent, verdict }
    }

    const expected = calcScenario(0.0)
    const severe = calcScenario(-0.40)

    return {
      emi,
      expectedRatio: expected.ratioPercent,
      expectedVerdict: expected.verdict,
      severeRatio: severe.ratioPercent,
      severeVerdict: severe.verdict
    }
  }, [loanAmount, monthlyIncome, annualInterestRate, tenureYears])

  const resetToOriginal = () => {
    setLoanAmount(initialLoanAmount)
    setMonthlyIncome(initialMonthlyIncome)
  }

  const isModified = loanAmount !== initialLoanAmount || monthlyIncome !== initialMonthlyIncome

  return (
    <div className="p-6 rounded-2xl border-2 border-dashed border-saffron/40 bg-saffron/5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sliders className="text-saffronDeep" size={20} />
          <div>
            <h4 className="font-display text-lg font-semibold text-ink">
              Interactive Planning Simulation
            </h4>
            <p className="text-xs text-inkSoft">
              Test how a smaller loan or higher income transforms your repayment burden
            </p>
          </div>
        </div>

        {isModified && (
          <button
            type="button"
            onClick={resetToOriginal}
            className="text-xs font-mono font-semibold text-saffronDeep hover:text-saffron flex items-center gap-1 bg-beige px-3 py-1.5 rounded-full border border-line"
          >
            <RefreshCw size={12} />
            Reset to Original
          </button>
        )}
      </div>

      {/* Sliders Grid */}
      <div className="grid md:grid-cols-2 gap-6 pt-2">
        {/* Loan Amount Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-ink uppercase tracking-wider">
              Financed Loan Amount
            </span>
            <span className="font-mono font-bold text-sm text-saffronDeep">
              ₹{Number(loanAmount).toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min={minLoan}
            max={maxLoan}
            step={step}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-saffronDeep cursor-pointer"
          />
          <div className="flex justify-between font-mono text-[10px] text-inkSoft">
            <span>₹{(minLoan / 100000).toFixed(1)}L</span>
            <span>Current: ₹{(initialLoanAmount / 100000).toFixed(1)}L</span>
            <span>₹{(maxLoan / 100000).toFixed(1)}L</span>
          </div>
        </div>

        {/* Monthly Income Input / Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-ink uppercase tracking-wider">
              Expected Monthly Income
            </span>
            <span className="font-mono font-bold text-sm text-ink">
              ₹{Number(monthlyIncome).toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min={10000}
            max={Math.max(100000, initialMonthlyIncome * 2)}
            step={2000}
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full accent-saffronDeep cursor-pointer"
          />
          <div className="flex justify-between font-mono text-[10px] text-inkSoft">
            <span>₹10k</span>
            <span>Baseline: ₹{Number(initialMonthlyIncome).toLocaleString('en-IN')}</span>
            <span>₹{Math.round(Math.max(100000, initialMonthlyIncome * 2) / 1000)}k</span>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Results */}
      <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-saffron/20">
        <div className="p-3.5 rounded-xl bg-beige/90 border border-line">
          <p className="font-mono text-[11px] text-inkSoft uppercase">Simulated Monthly EMI</p>
          <p className="font-mono text-xl font-bold text-ink mt-1">
            ₹{Number(simulation.emi).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-inkSoft mt-0.5">{tenureYears} yrs @ {annualInterestRate}% interest</p>
        </div>

        <div className="p-3.5 rounded-xl bg-beige/90 border border-line">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] text-inkSoft uppercase">Expected Burden</p>
            <RepaymentBurdenBadge verdict={simulation.expectedVerdict} size="xs" />
          </div>
          <p className="font-mono text-xl font-bold text-saffronDeep mt-1">
            {simulation.expectedRatio}%
          </p>
          <p className="text-[10px] text-inkSoft mt-0.5">At baseline income</p>
        </div>

        <div className="p-3.5 rounded-xl bg-beige/90 border border-line">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] text-inkSoft uppercase">Severe Shock (-40%)</p>
            <RepaymentBurdenBadge verdict={simulation.severeVerdict} size="xs" />
          </div>
          <p className="font-mono text-xl font-bold text-ink mt-1">
            {simulation.severeRatio}%
          </p>
          <p className="text-[10px] text-inkSoft mt-0.5">At 40% revenue dip</p>
        </div>
      </div>

      <p className="text-[11px] text-inkSoft leading-relaxed">
        <strong>Note:</strong> This is an illustrative planning simulation only. Official loan sanction amounts are governed by statutory scheme guidelines and channel-partner appraisals.
      </p>
    </div>
  )
}
