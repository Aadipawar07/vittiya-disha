/**
 * Repayment Stress Test Main Component
 *
 * Prominently presents the deterministic stress test analysis:
 * 1. Hero Expected Scenario summary
 * 2. 4-Scenario comparison table and mobile cards
 * 3. Trajectory visualization chart with 30%/40%/50% threshold markers
 * 4. Capital Structure and Buffer guidance
 * 5. Interactive real-time simulation slider
 */

import { useState } from 'react'
import { Activity, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react'
import StressScenarioTable from './StressScenarioTable.jsx'
import StressScenarioCard from './StressScenarioCard.jsx'
import StressChart from './StressChart.jsx'
import CapitalStructureRecommendation from './CapitalStructureRecommendation.jsx'
import InteractiveLoanSlider from './InteractiveLoanSlider.jsx'
import RepaymentBurdenBadge from './RepaymentBurdenBadge.jsx'
import DataTypeBadge from '../feasibility/DataTypeBadge.jsx'

export default function RepaymentStressTest({ repaymentStress = {}, financialContext = {} }) {
  const {
    status = 'CALCULATED',
    monthlyEMI = 0,
    principal = 0,
    annualInterestRate = 8.0,
    tenureMonths = 60,
    baseMonthlyIncome = 0,
    baseRatioPercent = 0,
    overallVerdict = 'MANAGEABLE',
    overallVerdictLabel = 'Manageable',
    overallVerdictColor = 'gold',
    scenarios = [],
    recommendation = '',
    requiresBuffer = false,
    capitalStructure = {},
    disclaimers = {}
  } = repaymentStress

  // Missing / Zero Income State
  const isAvailable = (status === 'AVAILABLE' || status === 'CALCULATED') && baseMonthlyIncome > 0 && scenarios.length > 0

  if (!isAvailable) {
    return (
      <section className="result-section" id="repayment-stress-test">
        <div className="flex items-center gap-3 mb-4">
          <Activity size={24} className="text-saffronDeep" />
          <div>
            <p className="result-note mb-0.5">FINANCIAL RESILIENCE</p>
            <h2 className="font-display text-2xl font-semibold">Repayment Stress Test</h2>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-line bg-beigeCard text-center">
          <HelpCircle size={24} className="text-inkSoft mx-auto mb-2" />
          <p className="text-base font-semibold text-ink">
            Repayment stress test unavailable
          </p>
          <p className="text-xs text-inkSoft mt-1 max-w-md mx-auto">
            Add an expected monthly business income in your assessment to see how repayment behaves under different income scenarios.
          </p>
        </div>
      </section>
    )
  }

  const tenureYears = Math.round(tenureMonths / 12)

  return (
    <section className="result-section space-y-8" id="repayment-stress-test">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Activity size={28} className="text-saffronDeep" />
            <div>
              <p className="result-note mb-0.5">FINANCIAL RESILIENCE TESTING</p>
              <h2 className="font-display text-3xl font-semibold">
                Can your business handle the repayment?
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DataTypeBadge type="CALCULATED" />
            <span className="font-mono text-xs text-inkSoft border border-line rounded px-2.5 py-1 bg-beigeCard">
              4 Scenarios Tested
            </span>
          </div>
        </div>

        <p className="text-sm text-inkSoft leading-relaxed max-w-3xl">
          We mathematically tested your loan repayment obligation under four operating scenarios (+20% surge, baseline, -20% dip, and -40% severe shock) to verify cash-flow viability before borrowing.
        </p>
      </div>

      {/* Hero Expected Result Card */}
      <div className="p-6 md:p-8 rounded-3xl border-2 border-saffron/30 bg-saffron/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-mono text-xs font-bold text-saffronDeep uppercase tracking-wider block">
            Baseline Expected Repayment Burden
          </span>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="font-display text-5xl md:text-6xl font-bold text-ink">
              {baseRatioPercent}%
            </span>
            <span className="text-sm text-inkSoft">of expected monthly income</span>
          </div>
          <p className="text-sm text-ink mt-3 font-medium">
            Your estimated EMI of <strong>₹{Number(monthlyEMI).toLocaleString('en-IN')}/mo</strong> consumes approximately {baseRatioPercent}% of your ₹{Number(baseMonthlyIncome).toLocaleString('en-IN')} expected monthly income.
          </p>
        </div>

        <div className="text-left md:text-right shrink-0">
          <span className="font-mono text-xs text-inkSoft block mb-1">Repayment Verdict</span>
          <RepaymentBurdenBadge verdict={overallVerdict} size="lg" />
          <span className="font-mono text-[11px] text-inkSoft block mt-2">
            {tenureYears} Year Tenure @ {annualInterestRate}%
          </span>
        </div>
      </div>

      {/* Desktop Scenario Table */}
      <div className="hidden md:block">
        <StressScenarioTable scenarios={scenarios} />
      </div>

      {/* Mobile Stacked Cards */}
      <div className="grid sm:grid-cols-2 gap-4 md:hidden">
        {scenarios.map((s) => (
          <StressScenarioCard key={s.scenario} scenario={s} />
        ))}
      </div>

      {/* Visual Chart */}
      <StressChart scenarios={scenarios} />

      {/* Capital Structure & Recommendations */}
      <CapitalStructureRecommendation
        capitalStructure={capitalStructure}
        monthlyEMI={monthlyEMI}
        baseMonthlyIncome={baseMonthlyIncome}
        requiresBuffer={requiresBuffer}
        recommendation={recommendation}
      />

      {/* Interactive Simulation Slider */}
      <InteractiveLoanSlider
        initialLoanAmount={principal || 700000}
        initialMonthlyIncome={baseMonthlyIncome || 26000}
        annualInterestRate={annualInterestRate || 8.0}
        tenureYears={tenureYears || 5}
      />

      {/* Disclaimers & Limitations */}
      <div className="pt-4 border-t border-line text-xs text-inkSoft space-y-1.5 leading-relaxed">
        <p>
          <strong>Methodology Note:</strong> {disclaimers.simulation || 'Stress scenarios are illustrative mathematical simulations based on the income figure provided.'}
        </p>
        <p>
          {disclaimers.expensesNote || 'Stress testing uses the income figure provided and does not account for unreported operating expenses.'}
        </p>
      </div>
    </section>
  )
}
