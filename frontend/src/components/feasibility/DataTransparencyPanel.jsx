/**
 * DataTransparencyPanel — "How reliable is this assessment?"
 *
 * Makes the model's data limitations completely transparent.
 * Shows: what data was used, at what level, and how it was obtained.
 * Includes the Measured / Estimated / User Reported legend.
 */

import DataTypeBadge from './DataTypeBadge.jsx'

const DATA_LEVEL_DESCRIPTIONS = {
  VILLAGE: 'Village-level data',
  BLOCK: 'Block-level estimate',
  DISTRICT: 'District-level proxy',
  STATE: 'State-level proxy',
  USER_REPORTED: 'Your responses',
  CALCULATED: 'Calculated from inputs',
  CATEGORY_RULE: 'Category rules',
  INSUFFICIENT: 'Data unavailable'
}

function levelLabel(level) {
  return DATA_LEVEL_DESCRIPTIONS[level] ?? level ?? 'Unknown'
}

function DataRow({ label, level, type, note }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-line last:border-0">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {note && <p className="text-xs text-inkSoft mt-0.5">{note}</p>}
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="font-mono text-xs text-inkSoft">{levelLabel(level)}</span>
        {type && <DataTypeBadge type={type} />}
      </div>
    </div>
  )
}

/**
 * @param {{
 *   components: import('../../types/feasibility.js').FeasibilityComponents
 * }} props
 */
export default function DataTransparencyPanel({ components }) {
  const demand    = components?.demandFit
  const comp      = components?.competition
  const financial = components?.financialFit
  const risk      = components?.risk
  const execution = components?.executionFit

  return (
    <section className="result-section">
      <p className="result-note mb-1">TRANSPARENCY</p>
      <h2 className="font-display text-2xl font-semibold mb-2">How reliable is this assessment?</h2>
      <p className="text-sm text-inkSoft mb-6">
        The table below shows the data source, granularity, and derivation method
        for each component of this feasibility assessment.
      </p>

      {/* Data table */}
      <div>
        <DataRow
          label="Population"
          level={demand?.dataLevel}
          type={demand?.type}
          note={demand?.details?.populationNote ?? 'Potentially stale — sourced from census data'}
        />
        <DataRow
          label="Competition"
          level={comp?.dataLevel}
          type={comp?.type}
          note={comp?.details?.limitation ?? 'POI data coverage may vary'}
        />
        <DataRow
          label="Purchasing power"
          level="DISTRICT"
          type="ESTIMATED"
          note="Based on district-level per-capita proxy. Not measured at village level."
        />
        <DataRow
          label="Demand"
          level={demand?.dataLevel}
          type="ESTIMATED"
          note="Derived from population data and category demand norms"
        />
        <DataRow
          label="Financial fit"
          level={financial?.dataLevel ?? 'CALCULATED'}
          type={financial?.type ?? 'CALCULATED'}
          note="Calculated from scheme rules and your stated project requirement"
        />
        <DataRow
          label="Risk assessment"
          level={risk?.dataLevel ?? 'CATEGORY_RULE'}
          type={risk?.type ?? 'ESTIMATED'}
          note="Based on category-level risk rules"
        />
        <DataRow
          label="Execution fit"
          level={execution?.dataLevel ?? 'USER_REPORTED'}
          type={execution?.type ?? 'USER_REPORTED'}
          note="Based on your self-reported experience and training"
        />
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-line">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-inkSoft mb-4">Data legend</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { type: 'MEASURED',     desc: 'Directly observed or sourced data' },
            { type: 'ESTIMATED',    desc: 'Calculated using available proxies or category rules' },
            { type: 'CALCULATED',   desc: 'Deterministic calculation from known inputs' },
            { type: 'USER_REPORTED',desc: 'Provided by the applicant' }
          ].map(({ type, desc }) => (
            <div key={type} className="flex items-start gap-2.5">
              <DataTypeBadge type={type} />
              <p className="text-xs text-inkSoft leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
