/**
 * Population Card Component
 *
 * Displays Census of India 2011 population within radius,
 * settlement breakdown, and data level confidence.
 */

import { Users, AlertCircle } from 'lucide-react'
import DataTypeBadge from '../feasibility/DataTypeBadge.jsx'
import ConfidenceBadge from '../feasibility/ConfidenceBadge.jsx'

export default function PopulationCard({ population = {} }) {
  const {
    populationWithinRadius = 0,
    householdsWithinRadius = 0,
    settlementCount = 0,
    censusYear = 2011,
    dataLevel = 'VILLAGE',
    confidence = 'MEDIUM',
    coverageWarning = null,
    freshnessNote = 'Census 2011 official dataset.',
    settlements = []
  } = population

  return (
    <section className="result-section">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-saffronDeep" />
          <div>
            <p className="result-note mb-0.5">DEMOGRAPHICS</p>
            <h2 className="font-display text-2xl font-semibold">Population in Analysis Area</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DataTypeBadge type="MEASURED" />
          <ConfidenceBadge level={confidence} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-px bg-line border border-line rounded-2xl overflow-hidden mb-6">
        <div className="bg-beige p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">10 km Radius Population</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-ink mt-2">
            {Number(populationWithinRadius).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-inkSoft mt-1">Total residents</p>
        </div>

        <div className="bg-beige p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">Estimated Households</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-ink mt-2">
            {Number(householdsWithinRadius).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-inkSoft mt-1">Consumer units</p>
        </div>

        <div className="bg-beige p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">Data Source & Year</p>
          <p className="font-mono text-xl font-bold text-ink mt-2">
            Census {censusYear}
          </p>
          <p className="text-xs text-inkSoft mt-1">Primary Census Abstract</p>
        </div>
      </div>

      {coverageWarning && (
        <div className="mb-5 flex gap-3 p-4 rounded-xl border border-gold/30 bg-gold/10 text-xs text-inkSoft">
          <AlertCircle size={18} className="text-gold shrink-0 mt-0.5" />
          <p className="leading-relaxed">{coverageWarning}</p>
        </div>
      )}

      {settlements && settlements.length > 0 && (
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-3">
            Settlements Aggregated ({settlements.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {settlements.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl border border-line bg-beigeCard"
              >
                <strong>{s.name}</strong>
                <span className="text-inkSoft">({Number(s.population).toLocaleString('en-IN')})</span>
                <span className="text-saffronDeep">{s.distanceKm} km</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-inkSoft mt-5 pt-4 border-t border-line">
        {freshnessNote} Population coverage is based on official Census geography and is not extrapolated to a fabricated projection without documented methodology.
      </p>
    </section>
  )
}
