/**
 * ConfidenceBadge — displays a confidence level as a styled pill.
 *
 * Confidence levels: HIGH | MEDIUM | LOW | INSUFFICIENT_DATA
 *
 * IMPORTANT: Always pairs a visual indicator with text — never communicates
 * confidence through color alone (accessibility requirement).
 */

const CONFIG = {
  HIGH: {
    label: 'High',
    icon: '●',
    bg: 'bg-go/12',
    border: 'border-go/30',
    text: 'text-go',
    ariaLabel: 'High confidence data'
  },
  MEDIUM: {
    label: 'Medium',
    icon: '●',
    bg: 'bg-gold/12',
    border: 'border-gold/40',
    text: 'text-gold',
    ariaLabel: 'Medium confidence data'
  },
  LOW: {
    label: 'Low',
    icon: '●',
    bg: 'bg-maroon/10',
    border: 'border-maroon/30',
    text: 'text-maroon',
    ariaLabel: 'Low confidence data — limited local data available'
  },
  INSUFFICIENT_DATA: {
    label: 'Insufficient data',
    icon: '○',
    bg: 'bg-ink/6',
    border: 'border-ink/15',
    text: 'text-inkSoft',
    ariaLabel: 'Insufficient data to assess confidence'
  }
}

/**
 * @param {{ level: import('../../types/feasibility.js').ConfidenceLevel, size?: 'sm' | 'md' }} props
 */
export default function ConfidenceBadge({ level = 'MEDIUM', size = 'sm' }) {
  const config = CONFIG[level] ?? CONFIG.MEDIUM
  const sizeClass = size === 'md'
    ? 'text-xs px-3 py-1.5 gap-2'
    : 'text-[10px] px-2.5 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono font-semibold tracking-wide
        ${config.bg} ${config.border} ${config.text} ${sizeClass}`}
      aria-label={config.ariaLabel}
      role="status"
    >
      <span aria-hidden="true" className="text-[8px] leading-none">{config.icon}</span>
      {config.label}
    </span>
  )
}
