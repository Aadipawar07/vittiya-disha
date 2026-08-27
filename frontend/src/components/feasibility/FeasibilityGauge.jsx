/**
 * FeasibilityGauge — Clean SVG circular progress ring for the hero score.
 *
 * DESIGN PRINCIPLES:
 * - No spinning animation (unlike ScoreOrb) — this is a trustworthy financial result
 * - Accessible: role="img" + aria-label
 * - null score → shows "Insufficient data", never "0/100"
 * - Color communicates score band but is always accompanied by text
 */

import { getFallbackLabel } from '../../types/feasibility.js'

const SIZE = 200
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getScoreColor(score) {
  if (score === null || score === undefined) return '#8C7A64' // inkSoft
  if (score >= 75) return '#2F6B4F' // go
  if (score >= 60) return '#2F6B4F' // go (good)
  if (score >= 40) return '#C6961D' // gold
  return '#9C2B1E' // maroon
}

/**
 * @param {{
 *   score: number | null,
 *   label?: string,
 *   confidence?: import('../../types/feasibility.js').ConfidenceLevel,
 *   size?: number
 * }} props
 */
export default function FeasibilityGauge({ score, label, size = SIZE }) {
  const isInsufficient = score === null || score === undefined

  const pct = isInsufficient ? 0 : Math.min(100, Math.max(0, score)) / 100
  const dashOffset = CIRCUMFERENCE * (1 - pct)
  const color = getScoreColor(score)

  const displayLabel = label ?? getFallbackLabel(score)

  // Scale for different sizes
  const scale = size / SIZE
  const viewBox = `0 0 ${SIZE} ${SIZE}`

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="img"
      aria-label={
        isInsufficient
          ? 'Feasibility score: Insufficient data'
          : `Feasibility score: ${Math.round(score)} out of 100 — ${displayLabel}`
      }
    >
      <div style={{ width: size, height: size }}>
        <svg
          viewBox={viewBox}
          width={size}
          height={size}
          aria-hidden="true"
          className="block"
        >
          {/* Background track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#D8C6A0"
            strokeWidth={STROKE}
          />

          {/* Progress arc */}
          {!isInsufficient && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            />
          )}

          {/* Score text */}
          {isInsufficient ? (
            <>
              <text
                x={SIZE / 2}
                y={SIZE / 2 - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="600"
                fill="#5C4A34"
              >
                Insufficient
              </text>
              <text
                x={SIZE / 2}
                y={SIZE / 2 + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="600"
                fill="#5C4A34"
              >
                data
              </text>
            </>
          ) : (
            <>
              <text
                x={SIZE / 2}
                y={SIZE / 2 - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="42"
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="700"
                fill="#241B12"
              >
                {Math.round(score)}
              </text>
              <text
                x={SIZE / 2}
                y={SIZE / 2 + 28}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="400"
                fill="#5C4A34"
              >
                / 100
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Label below gauge */}
      <div className="text-center">
        <p
          className="font-display text-xl font-semibold"
          style={{ color: isInsufficient ? '#5C4A34' : color }}
        >
          {displayLabel}
        </p>
        <p className="font-mono text-xs text-inkSoft mt-1">Indicative feasibility score</p>
      </div>
    </div>
  )
}
