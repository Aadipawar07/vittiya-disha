/**
 * WeightedBreakdown — visual "score × weight" breakdown.
 *
 * CRITICAL: This is EXPLANATORY ONLY.
 * The final score is NOT recalculated here.
 * We only display what the backend returned.
 *
 * Shows how each component contributes relative to its weight.
 * The backend overallScore is always the displayed total.
 */

/**
 * @param {{
 *   components: import('../../types/feasibility.js').FeasibilityComponents,
 *   overallScore: number | null
 * }} props
 */
export default function WeightedBreakdown({ components, overallScore }) {
  const PILLARS = [
    { key: 'demandFit',    label: 'Demand Fit',    icon: '📊' },
    { key: 'competition',  label: 'Competition',   icon: '🏪' },
    { key: 'financialFit', label: 'Financial Fit', icon: '💰' },
    { key: 'risk',         label: 'Risk',          icon: '⚠️' },
    { key: 'executionFit', label: 'Execution Fit', icon: '🤝' }
  ]

  return (
    <section className="result-section">
      <p className="result-note mb-1">HOW WE CALCULATED THIS</p>
      <h2 className="font-display text-2xl font-semibold mb-2">Score methodology</h2>
      <p className="text-sm text-inkSoft mb-6">
        Each factor is calculated separately by the backend. The final score is
        weighted according to these factors. This breakdown is explanatory — the
        backend is the sole source of truth.
      </p>

      {/* Weight table */}
      <div className="space-y-4">
        {PILLARS.map(({ key, label, icon }) => {
          const comp = components?.[key]
          const score = comp?.score
          const weight = comp?.weight ?? 0
          const weightPct = Math.round(weight * 100)
          const isInsufficient = score === null || score === undefined

          // Bar width = how much this component contributes to the 100 max possible
          // We show the component's own score bar, not the weighted contribution
          // (to avoid implying we're recalculating)
          const barWidth = isInsufficient ? 0 : Math.min(100, Math.max(0, score))

          return (
            <div key={key}>
              <div className="flex items-center justify-between gap-4 mb-1.5">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{icon}</span>
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="font-mono text-xs text-inkSoft">{weightPct}% weight</span>
                </div>
                <div className="font-mono text-sm font-semibold shrink-0">
                  {isInsufficient ? (
                    <span className="text-inkSoft">—</span>
                  ) : (
                    <>
                      <span>{Math.round(score)}</span>
                      <span className="text-inkSoft font-normal">/100</span>
                    </>
                  )}
                </div>
              </div>

              {/* Visual bar */}
              <div
                className="h-2.5 rounded-full bg-beigeDeep overflow-hidden"
                role="presentation"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-saffron fillbar"
                  style={{ width: isInsufficient ? '0%' : `${barWidth}%` }}
                />
              </div>

              {isInsufficient && (
                <p className="text-xs text-inkSoft mt-1">Insufficient data — omitted from weighted total</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Formula display */}
      <div className="mt-6 pt-6 border-t border-line">
        <p className="font-mono text-xs text-inkSoft uppercase tracking-wider mb-3">Weighting formula</p>
        <p className="font-mono text-xs text-inkSoft leading-relaxed">
          Score = 0.25 × Demand + 0.25 × Competition + 0.20 × Financial + 0.15 × Risk + 0.15 × Execution
        </p>
        <p className="text-xs text-inkSoft mt-3">
          The backend applies this formula to compute the overall score.
          The frontend displays only the value returned by the backend.
        </p>
      </div>
    </section>
  )
}
