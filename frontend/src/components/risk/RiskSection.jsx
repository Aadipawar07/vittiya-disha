/**
 * Risk Section Component
 *
 * Displays overall risk profile, active flags count, and list of risk cards.
 */

import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import RiskFlagCard from './RiskFlagCard.jsx'
import ConfidenceBadge from '../feasibility/ConfidenceBadge.jsx'

export default function RiskSection({ risk = {} }) {
  const {
    riskScore = 75,
    overallRiskLevel = 'MEDIUM',
    activeFlagsCount = 0,
    confidence = 'HIGH',
    flags = [],
    activeFlags = [],
    dataNote = 'Business risk flags are derived from deterministic category rules, self-reported dependencies, and geospatial market density.'
  } = risk

  const riskLevelLabels = {
    LOW: { label: 'Low Overall Risk', color: 'text-go bg-go/10 border-go/30' },
    MEDIUM: { label: 'Moderate Overall Risk', color: 'text-ink bg-gold/15 border-gold/40' },
    HIGH: { label: 'High Overall Risk', color: 'text-saffronDeep bg-saffron/15 border-saffron/40' },
    CRITICAL: { label: 'Critical Risk Profile', color: 'text-maroon bg-maroon/15 border-maroon/40 font-bold' }
  }

  const levelInfo = riskLevelLabels[overallRiskLevel] || riskLevelLabels.MEDIUM

  return (
    <section className="result-section" id="business-risks">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <ShieldAlert size={26} className="text-saffronDeep" />
          <div>
            <p className="result-note mb-0.5">CATEGORY & OPERATIONAL RISKS</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">
              Business Risk Analysis
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`font-mono text-xs px-3 py-1 rounded-full border ${levelInfo.color}`}>
            {levelInfo.label}
          </span>
          <ConfidenceBadge level={confidence} size="md" />
        </div>
      </div>

      <p className="text-sm text-inkSoft mb-6 leading-relaxed">
        We evaluated operational, supply chain, seasonal, and customer-concentration factors specific to your business category. All evaluations follow deterministic rules rather than speculative guesses.
      </p>

      {/* Risk Summary Metrics */}
      <div className="grid sm:grid-cols-3 gap-px bg-line border border-line rounded-2xl overflow-hidden mb-6">
        <div className="bg-beige p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">Risk Score</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display text-3xl font-bold text-ink">
              {riskScore !== null && riskScore !== undefined ? riskScore : '—'}
            </span>
            <span className="text-xs text-inkSoft font-mono">/100 (higher = safer)</span>
          </div>
        </div>

        <div className="bg-beige p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">Active Risk Flags</p>
          <p className="font-mono text-2xl font-bold text-ink mt-1">
            {activeFlagsCount} active {activeFlagsCount === 1 ? 'factor' : 'factors'}
          </p>
        </div>

        <div className="bg-beige p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft">Methodology</p>
          <p className="font-mono text-base font-bold text-ink mt-1">
            Deterministic Rules
          </p>
          <p className="text-[11px] text-inkSoft mt-0.5">Category norms & market data</p>
        </div>
      </div>

      {/* Risk Cards List */}
      {flags.length > 0 ? (
        <div className="space-y-4">
          {flags.map((flag, idx) => (
            <RiskFlagCard key={flag.flag || idx} flag={flag} />
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-line bg-beigeCard text-center">
          <CheckCircle2 size={24} className="text-go mx-auto mb-2" />
          <p className="text-sm font-semibold text-ink">
            No major rule-based risk flags identified from the available data.
          </p>
          <p className="text-xs text-inkSoft mt-1">
            Standard business discipline and working capital monitoring still apply.
          </p>
        </div>
      )}

      <p className="text-xs text-inkSoft mt-6 pt-4 border-t border-line">
        {dataNote} Numerical risk scores and severity ratings are computed server-side from pre-configured benchmarks.
      </p>
    </section>
  )
}
