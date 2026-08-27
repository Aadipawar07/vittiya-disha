/**
 * Repayment Burden Verdict Badge
 */

const VERDICT_CONFIG = {
  COMFORTABLE: {
    label: 'Comfortable',
    className: 'bg-go/15 text-go border-go/40'
  },
  MANAGEABLE: {
    label: 'Manageable',
    className: 'bg-gold/20 text-ink border-gold/40'
  },
  TIGHT: {
    label: 'Tight — Build Buffer',
    className: 'bg-saffron/20 text-saffronDeep border-saffron/40'
  },
  HIGH_RISK: {
    label: 'High Risk — Reconsider',
    className: 'bg-maroon/20 text-maroon border-maroon/40 font-bold'
  }
}

export default function RepaymentBurdenBadge({ verdict = 'MANAGEABLE', size = 'sm' }) {
  const norm = String(verdict || 'MANAGEABLE').toUpperCase()
  const conf = VERDICT_CONFIG[norm] || VERDICT_CONFIG.MANAGEABLE

  const sizeClass = size === 'lg' ? 'text-sm px-4 py-1.5' : size === 'md' ? 'text-xs px-3 py-1' : 'text-[11px] px-2.5 py-0.5'

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-full border ${conf.className} ${sizeClass}`}
    >
      {conf.label}
    </span>
  )
}
