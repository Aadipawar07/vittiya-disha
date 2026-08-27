/**
 * LocalDataWarning — prominent warning when majority of components have LOW confidence.
 *
 * Per spec: this warning must appear near the score, not buried at the bottom.
 * Exact warning text from spec:
 *   "Insufficient local data for this village — showing block-level estimate."
 */

import { AlertTriangle } from 'lucide-react'

/**
 * @param {{
 *   warning?: string | null,
 *   show?: boolean
 * }} props
 */
export default function LocalDataWarning({ warning, show = true }) {
  if (!show || !warning) return null

  return (
    <div
      className="flex gap-4 rounded-2xl border-2 border-gold/40 bg-gold/8 p-5 md:p-6"
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle
        size={22}
        className="text-gold shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold mb-2">
          Limited Local Data
        </p>
        <p className="text-sm font-semibold text-ink leading-relaxed">
          {warning}
        </p>
        <p className="text-sm text-inkSoft mt-2 leading-relaxed">
          Some parts of this assessment use block or district-level data because
          reliable village-level data was unavailable.
        </p>
      </div>
    </div>
  )
}
