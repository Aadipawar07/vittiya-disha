/**
 * Capital Structure Recommendation Component
 *
 * Deterministically calculates target monthly income, maximum affordable EMI,
 * and suggested loan adjustment targets to keep the repayment burden below 30%.
 */

import { TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react'

export default function CapitalStructureRecommendation({
  capitalStructure = {},
  monthlyEMI = 0,
  baseMonthlyIncome = 0,
  requiresBuffer = false,
  recommendation = ''
}) {
  const {
    targetComfortRatioPercent = 30,
    requiredMonthlyIncomeForTarget = 0,
    maximumAffordableMonthlyEMI = 0,
    targetAffordableLoanAmount = 0
  } = capitalStructure

  return (
    <div className="p-6 rounded-2xl border-2 border-line bg-beigeCard/70 space-y-4">
      <div className="flex items-start gap-3">
        {requiresBuffer ? (
          <AlertCircle className="text-saffronDeep shrink-0 mt-1" size={22} />
        ) : (
          <ShieldCheck className="text-go shrink-0 mt-1" size={22} />
        )}
        <div>
          <h4 className="font-display text-lg font-semibold text-ink">
            Capital Structure & Buffer Guidance
          </h4>
          <p className="text-xs text-inkSoft mt-0.5">
            Deterministic adjustments to maintain comfortable repayment margins (target ≤ {targetComfortRatioPercent}% of income)
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl border border-line bg-beige/80">
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">
            Target Income for ≤30% EMI
          </p>
          <p className="font-mono text-xl font-bold text-ink mt-1.5">
            ₹{Number(requiredMonthlyIncomeForTarget).toLocaleString('en-IN')}/mo
          </p>
          <p className="text-[11px] text-inkSoft mt-1">
            Needed to support ₹{Number(monthlyEMI).toLocaleString('en-IN')} EMI comfortably
          </p>
        </div>

        <div className="p-4 rounded-xl border border-line bg-beige/80">
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">
            Max Affordable EMI at Current Income
          </p>
          <p className="font-mono text-xl font-bold text-saffronDeep mt-1.5">
            ₹{Number(maximumAffordableMonthlyEMI).toLocaleString('en-IN')}/mo
          </p>
          <p className="text-[11px] text-inkSoft mt-1">
            30% of ₹{Number(baseMonthlyIncome).toLocaleString('en-IN')} baseline income
          </p>
        </div>

        {targetAffordableLoanAmount > 0 && (
          <div className="p-4 rounded-xl border border-line bg-beige/80 sm:col-span-2 lg:col-span-1">
            <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">
              Suggested Loan Ceiling
            </p>
            <p className="font-mono text-xl font-bold text-ink mt-1.5">
              ₹{Number(targetAffordableLoanAmount).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-inkSoft mt-1">
              Loan size maintaining ≤30% EMI at current tenure
            </p>
          </div>
        )}
      </div>

      {recommendation && (
        <div className="p-3.5 rounded-xl bg-saffron/10 border border-saffron/30 text-xs text-ink leading-relaxed">
          <strong className="font-semibold block mb-0.5">Recommendation:</strong>
          {recommendation}
        </div>
      )}
    </div>
  )
}
