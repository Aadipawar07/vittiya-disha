/**
 * DataTypeBadge — small inline badge for data provenance.
 *
 * Types: MEASURED | ESTIMATED | CALCULATED | USER_REPORTED
 *
 * Communicates how the underlying data point was obtained.
 * Never uses color alone — always pairs with label text.
 */

const CONFIG = {
  MEASURED: {
    label: 'Measured',
    bg: 'bg-go/10',
    border: 'border-go/20',
    text: 'text-go',
    description: 'Directly observed or sourced data'
  },
  ESTIMATED: {
    label: 'Estimated',
    bg: 'bg-gold/10',
    border: 'border-gold/25',
    text: 'text-gold',
    description: 'Calculated using available proxies or category rules'
  },
  CALCULATED: {
    label: 'Calculated',
    bg: 'bg-saffron/10',
    border: 'border-saffron/25',
    text: 'text-saffronDeep',
    description: 'Deterministic calculation from known inputs'
  },
  USER_REPORTED: {
    label: 'User reported',
    bg: 'bg-ink/6',
    border: 'border-ink/15',
    text: 'text-inkSoft',
    description: 'Provided by the applicant'
  }
}

/**
 * @param {{ type: import('../../types/feasibility.js').DataType }} props
 */
export default function DataTypeBadge({ type }) {
  const config = CONFIG[type]
  if (!config) return null

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider uppercase
        ${config.bg} ${config.border} ${config.text}`}
      title={config.description}
      aria-label={`${config.label}: ${config.description}`}
    >
      {config.label}
    </span>
  )
}
