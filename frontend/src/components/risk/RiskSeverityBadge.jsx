/**
 * Risk Severity Badge
 *
 * Displays a color-coded badge for risk severities:
 * LOW (green/go), MEDIUM (gold), HIGH (saffron), CRITICAL (maroon).
 */

const SEVERITY_CONFIG = {
  LOW: {
    label: 'Low Severity',
    className: 'bg-go/10 text-go border-go/30'
  },
  MEDIUM: {
    label: 'Medium Severity',
    className: 'bg-gold/15 text-ink border-gold/40'
  },
  HIGH: {
    label: 'High Severity',
    className: 'bg-saffron/15 text-saffronDeep border-saffron/40'
  },
  CRITICAL: {
    label: 'Critical Severity',
    className: 'bg-maroon/15 text-maroon border-maroon/40 font-bold'
  }
}

export default function RiskSeverityBadge({ severity = 'MEDIUM', size = 'sm' }) {
  const norm = String(severity || 'MEDIUM').toUpperCase()
  const conf = SEVERITY_CONFIG[norm] || SEVERITY_CONFIG.MEDIUM

  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : size === 'md' ? 'text-xs px-3 py-1' : 'text-[11px] px-2.5 py-0.5'

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-full border ${conf.className} ${sizeClass}`}
    >
      {conf.label}
    </span>
  )
}
