/**
 * FeasibilityComponentCard — expandable card for a single feasibility pillar.
 *
 * KEY RULES:
 * - null score → renders "Insufficient data" NOT "0/100"
 * - Confidence is always visible (not hidden)
 * - Data type always labelled (Measured / Estimated / Calculated / User Reported)
 * - Data level always shown (Village / Block / District / etc.)
 * - Expandable via <details>/<summary> for native accessibility
 * - Never claims AI generated the score — only displays backend result
 */

import { ChevronDown } from 'lucide-react'
import ConfidenceBadge from './ConfidenceBadge.jsx'
import DataTypeBadge from './DataTypeBadge.jsx'

const DATA_LEVEL_LABELS = {
  VILLAGE: 'Village-level data',
  BLOCK: 'Block-level estimate',
  DISTRICT: 'District-level proxy',
  STATE: 'State-level proxy',
  USER_REPORTED: 'Based on your responses',
  CALCULATED: 'Deterministic calculation',
  CATEGORY_RULE: 'Category rule',
  INSUFFICIENT: 'Data unavailable'
}

function formatDataLevel(level) {
  return DATA_LEVEL_LABELS[level] ?? level ?? 'Unknown'
}

function formatWeight(weight) {
  if (weight === null || weight === undefined) return '—'
  return `${Math.round(weight * 100)}%`
}

function ScoreDisplay({ score, size = 'lg' }) {
  const isInsufficient = score === null || score === undefined

  if (isInsufficient) {
    return (
      <div>
        <p className="font-mono text-sm font-semibold text-inkSoft" aria-label="Insufficient data">
          Insufficient data
        </p>
        <p className="text-xs text-inkSoft mt-0.5">Not enough reliable local data</p>
      </div>
    )
  }

  const sizeClass = size === 'lg' ? 'text-3xl' : 'text-2xl'
  return (
    <p
      className={`font-mono font-bold text-ink ${sizeClass}`}
      aria-label={`Score: ${Math.round(score)} out of 100`}
    >
      {Math.round(score)}<span className="text-inkSoft font-normal text-base ml-1">/100</span>
    </p>
  )
}

/**
 * Demand Fit expanded details
 */
function DemandFitDetails({ details }) {
  if (!details) return null
  return (
    <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-4 text-sm">
      {details.population && (
        <>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Population</dt>
            <dd className="font-mono font-semibold">{Number(details.population).toLocaleString('en-IN')}</dd>
            <dd className="text-xs text-inkSoft mt-0.5">{details.populationNote ?? 'Potentially stale'}</dd>
          </div>
        </>
      )}
      {details.purchasingPowerNote && (
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">
            Purchasing power
            <span className="ml-2 inline-flex items-center rounded border border-gold/25 bg-gold/10 px-1.5 py-0.5 text-[9px] font-semibold text-gold tracking-wider">
              ESTIMATED
            </span>
          </dt>
          <dd className="text-xs text-inkSoft">{details.purchasingPowerNote}</dd>
        </div>
      )}
      {details.demandBasis && (
        <div className="sm:col-span-2">
          <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Demand basis</dt>
          <dd className="text-sm text-inkSoft">{details.demandBasis}</dd>
        </div>
      )}
    </dl>
  )
}

/**
 * Competition expanded details
 */
function CompetitionDetails({ details }) {
  if (!details) return null
  const hasCount = details.competitorCount !== null && details.competitorCount !== undefined
  return (
    <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-4 text-sm">
      <div>
        <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Businesses found</dt>
        {hasCount ? (
          <dd className="font-mono font-semibold">{details.competitorCount}</dd>
        ) : (
          <dd className="text-inkSoft">Competition data unavailable</dd>
        )}
        {details.searchRadiusKm && (
          <dd className="text-xs text-inkSoft mt-0.5">Within {details.searchRadiusKm} km radius</dd>
        )}
      </div>
      {details.dataSource && (
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Data source</dt>
          <dd className="text-inkSoft">{details.dataSource}</dd>
        </div>
      )}
      {details.limitation && (
        <div className="sm:col-span-2">
          <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Limitation</dt>
          <dd className="text-xs text-inkSoft">{details.limitation}</dd>
        </div>
      )}
    </dl>
  )
}

const money = (v) => v === null || v === undefined ? 'Not available' : `₹${Number(v).toLocaleString('en-IN')}`

/**
 * Financial Fit expanded details
 */
function FinancialFitDetails({ details }) {
  if (!details) return null
  return (
    <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-4 text-sm">
      <div>
        <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Project requirement</dt>
        <dd className="font-mono font-semibold">{money(details.projectRequirement)}</dd>
      </div>
      <div>
        <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Eligible loan</dt>
        <dd className="font-mono font-semibold text-saffronDeep">{money(details.eligibleLoan)}</dd>
      </div>
      <div>
        <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Own contribution</dt>
        <dd className="font-mono font-semibold">{money(details.ownContribution)}</dd>
      </div>
      <div>
        <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Repayment burden</dt>
        <dd className="font-mono font-semibold">
          {details.repaymentBurdenRatio !== null && details.repaymentBurdenRatio !== undefined
            ? `${details.repaymentBurdenRatio}%`
            : 'Not available'}
        </dd>
      </div>
      {details.financialBasis && (
        <div className="sm:col-span-2">
          <dt className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-1">Basis</dt>
          <dd className="text-xs text-inkSoft">{details.financialBasis}</dd>
        </div>
      )}
    </dl>
  )
}

/**
 * Risk expanded details
 */
function RiskDetails({ details }) {
  if (!details) return null
  return (
    <div className="mt-4">
      {details.riskFactors && details.riskFactors.length > 0 ? (
        <>
          <p className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-3">Risk factors</p>
          <ul className="space-y-2">
            {details.riskFactors.map((factor, i) => (
              <li key={i} className="flex gap-3 text-sm text-inkSoft">
                <span className="text-maroon font-bold mt-0.5" aria-hidden="true">→</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-inkSoft">Insufficient data to assess category-specific risk.</p>
      )}
      {details.dataNote && (
        <p className="text-xs text-inkSoft mt-4 pt-4 border-t border-line">{details.dataNote}</p>
      )}
    </div>
  )
}

/**
 * Execution Fit expanded details
 */
function ExecutionFitDetails({ details }) {
  if (!details) return null
  return (
    <div className="mt-4">
      <p className="font-mono text-xs uppercase tracking-wider text-inkSoft mb-3">Based on your responses</p>
      {details.inputs && details.inputs.length > 0 ? (
        <ul className="space-y-2">
          {details.inputs.map((input, i) => (
            <li key={i} className="flex gap-3 text-sm text-inkSoft">
              <span className="text-saffronDeep font-bold mt-0.5" aria-hidden="true">✓</span>
              <span>{input}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {details.note && (
        <p className="text-xs text-inkSoft mt-4 pt-4 border-t border-line">{details.note}</p>
      )}
    </div>
  )
}

const DETAIL_RENDERERS = {
  demandFit: DemandFitDetails,
  competition: CompetitionDetails,
  financialFit: FinancialFitDetails,
  risk: RiskDetails,
  executionFit: ExecutionFitDetails
}

/**
 * @param {{
 *   componentKey: string,
 *   title: string,
 *   icon: string,
 *   component: import('../../types/feasibility.js').FeasibilityComponent
 * }} props
 */
export default function FeasibilityComponentCard({ componentKey, title, icon, component }) {
  if (!component) return null

  const { score, weight, confidence, dataLevel, type, explanation, details } = component
  const DetailRenderer = DETAIL_RENDERERS[componentKey]

  return (
    <details className="group result-section p-0 overflow-hidden" open={false}>
      {/* Collapsed header — always visible */}
      <summary className="flex items-start gap-4 p-6 md:p-7 cursor-pointer list-none select-none hover:bg-ink/3 transition-colors rounded-2xl">
        {/* Icon */}
        <span className="text-2xl mt-0.5 shrink-0" aria-hidden="true">{icon}</span>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            {type && <DataTypeBadge type={type} />}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3">
            <ScoreDisplay score={score} />
            <div className="flex flex-wrap gap-2">
              <ConfidenceBadge level={confidence} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-inkSoft">
            <span>
              <span className="font-semibold text-ink">{formatWeight(weight)}</span> weight
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDataLevel(dataLevel)}</span>
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          size={18}
          className="text-inkSoft shrink-0 mt-1 transition-transform duration-300 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      {/* Expanded content */}
      <div className="px-6 md:px-7 pb-6 md:pb-7 pt-0 border-t border-line mt-0">
        {/* Explanation */}
        {explanation && (
          <p className="text-sm text-inkSoft leading-relaxed pt-5">{explanation}</p>
        )}

        {/* Component-specific details */}
        {DetailRenderer && <DetailRenderer details={details} />}

        {/* Score = null notice */}
        {score === null && (
          <div className="mt-4 rounded-xl border border-ink/10 bg-ink/4 px-4 py-3">
            <p className="text-xs text-inkSoft">
              Not enough reliable local data to calculate this component.
              It has been omitted from the overall score calculation.
            </p>
          </div>
        )}
      </div>
    </details>
  )
}
