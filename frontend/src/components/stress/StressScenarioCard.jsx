/**
 * Stress Scenario Card (Mobile & Compact View)
 */

import RepaymentBurdenBadge from './RepaymentBurdenBadge.jsx'

export default function StressScenarioCard({ scenario = {} }) {
  const {
    label = 'Expected',
    adjustmentPercent = '0%',
    monthlyIncome = 0,
    monthlyEMI = 0,
    ratioPercent = 0,
    verdict = 'MANAGEABLE',
    description = ''
  } = scenario

  const isHighlighted = scenario.scenario === 'EXPECTED'

  return (
    <div
      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
        isHighlighted
          ? 'border-saffron/40 bg-saffron/5 shadow-sm'
          : 'border-line bg-beigeCard/60'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
            {label}
          </span>
          <span className="font-mono text-xs font-semibold text-inkSoft">
            {adjustmentPercent} income
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3 mb-1">
          <span className="text-xs text-inkSoft">Adjusted Income:</span>
          <span className="font-mono text-sm font-bold text-ink">
            ₹{Number(monthlyIncome).toLocaleString('en-IN')}/mo
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-inkSoft">EMI Burden Ratio:</span>
          <span className="font-display text-2xl font-bold text-saffronDeep">
            {ratioPercent}%
          </span>
        </div>

        {description && (
          <p className="text-[11px] text-inkSoft leading-relaxed border-t border-line/70 pt-2 mb-3">
            {description}
          </p>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <RepaymentBurdenBadge verdict={verdict} size="sm" />
      </div>
    </div>
  )
}
