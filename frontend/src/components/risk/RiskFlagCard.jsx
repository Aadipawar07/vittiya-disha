/**
 * Risk Flag Card
 *
 * Displays an individual risk flag with Severity, Confidence,
 * Reason ("Why Flagged"), Source attribution, and Actionable Mitigation.
 */

import { AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react'
import RiskSeverityBadge from './RiskSeverityBadge.jsx'
import ConfidenceBadge from '../feasibility/ConfidenceBadge.jsx'

export default function RiskFlagCard({ flag = {} }) {
  const {
    name = 'Business Risk Flag',
    severity = 'MEDIUM',
    confidence = 'HIGH',
    source = 'CATEGORY_RULE',
    reason = 'Identified business operating factor.',
    mitigation = 'Maintain standard operating cash buffer.',
    active = true,
    potentialRisk = false,
    dataWarning = null
  } = flag

  return (
    <div className={`p-5 rounded-2xl border-2 transition-all ${active ? 'bg-beigeCard/70 border-line shadow-sm' : 'bg-beige/40 border-line/60 opacity-80'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold text-ink">
              {name}
            </span>
            {potentialRisk && (
              <span className="font-mono text-[10px] text-inkSoft uppercase bg-beigeDeep px-2 py-0.5 rounded border border-line">
                Potential Exposure
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-inkSoft mt-0.5 block">
            Data Source: {source.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <RiskSeverityBadge severity={severity} />
          <ConfidenceBadge level={confidence} size="sm" />
        </div>
      </div>

      {dataWarning && (
        <div className="mb-3 p-2.5 rounded-lg bg-gold/10 border border-gold/30 text-xs text-inkSoft flex items-center gap-2">
          <HelpCircle size={14} className="text-gold shrink-0" />
          <span>{dataWarning}</span>
        </div>
      )}

      {/* Why Flagged */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider mb-1">
          Why Flagged:
        </p>
        <p className="text-sm text-ink leading-relaxed">
          {reason}
        </p>
      </div>

      {/* Possible Mitigation */}
      {mitigation && (
        <div className="mt-4 pt-3 border-t border-line/80 bg-beige/40 p-3 rounded-xl">
          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="text-go shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-go uppercase tracking-wider">
                Actionable Mitigation:
              </p>
              <p className="text-xs text-inkSoft mt-0.5 leading-relaxed">
                {mitigation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
