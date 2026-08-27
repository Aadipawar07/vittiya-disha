/**
 * Actionable Improvements Component
 *
 * Displays rule-driven suggestions for improving business viability.
 */

import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function ActionableImprovements({ improvements = [] }) {
  if (!improvements || improvements.length === 0) return null

  return (
    <section className="result-section">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle2 size={24} className="text-go" />
        <h2 className="font-display text-2xl font-semibold">How to Improve Feasibility at this Location</h2>
      </div>

      <p className="text-sm text-inkSoft mb-5">
        Specific, data-driven suggestions to address identified weaknesses before committing capital:
      </p>

      <div className="space-y-3">
        {improvements.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-line bg-beigeCard/40 flex items-start gap-3 text-sm"
          >
            <span className="font-mono text-xs font-bold text-saffronDeep bg-saffron/10 px-2 py-0.5 rounded shrink-0 mt-0.5">
              {item.factor}
            </span>
            <p className="text-ink leading-relaxed">{item.recommendation}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
