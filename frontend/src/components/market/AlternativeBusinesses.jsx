/**
 * Alternative Businesses Component
 *
 * Displays deterministically ranked alternative business categories evaluated
 * under the exact same location and demographic dataset.
 */

import { Lightbulb, ArrowRight, TrendingUp } from 'lucide-react'

export default function AlternativeBusinesses({ alternatives = [] }) {
  if (!alternatives || alternatives.length === 0) return null

  return (
    <section className="result-section">
      <div className="flex items-center gap-3 mb-2">
        <Lightbulb size={24} className="text-saffronDeep" />
        <h2 className="font-display text-2xl font-semibold">Other Business Ideas Worth Considering</h2>
      </div>

      <p className="text-sm text-inkSoft mb-6">
        The Market Engine evaluated alternative business categories at your exact location using the same geospatial and demographic rules:
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {alternatives.map((alt, i) => (
          <div
            key={alt.businessType || i}
            className="p-5 rounded-2xl border-2 border-line bg-beigeCard/70 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-display text-xl font-semibold text-ink">
                  {alt.displayName}
                </h3>
                <div className="font-mono text-right">
                  <span className="text-xl font-bold text-saffronDeep">{alt.feasibilityScore}</span>
                  <span className="text-xs text-inkSoft">/100</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-inkSoft mb-4">
                <div className="flex justify-between">
                  <span>Demand Potential:</span>
                  <strong className="text-ink">{alt.demandRating}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Competition:</span>
                  <strong className="text-ink">{alt.competitionRating}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Financial Fit:</span>
                  <strong className="text-ink">{alt.financialFitRating}</strong>
                </div>
              </div>

              <p className="text-xs text-inkSoft leading-relaxed border-t border-line pt-3">
                {alt.summary}
              </p>
            </div>

            <div className="mt-4 pt-3">
              <span className="text-xs font-semibold text-saffronDeep inline-flex items-center gap-1">
                Evaluated under identical market model <TrendingUp size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
