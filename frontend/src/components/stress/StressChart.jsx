/**
 * Stress Visualization Chart
 *
 * Lightweight responsive SVG chart plotting the EMI-to-Income ratio curve
 * across the 4 scenarios with 30%, 40%, 50% threshold benchmark lines.
 */

export default function StressChart({ scenarios = [] }) {
  if (!scenarios || scenarios.length === 0) return null

  // Chart dimensions
  const width = 600
  const height = 240
  const padding = { top: 30, right: 40, bottom: 40, left: 60 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Y-axis range: 0% to max ratio + 10% (at least 60%)
  const maxDataRatio = Math.max(...scenarios.map((s) => s.ratioPercent || 0))
  const yMax = Math.max(65, Math.ceil((maxDataRatio + 10) / 10) * 10)
  const yMin = 0

  const getY = (val) => padding.top + plotHeight - ((val - yMin) / (yMax - yMin)) * plotHeight
  const getX = (index) => padding.left + (index / (scenarios.length - 1)) * plotWidth

  // Points path
  const points = scenarios.map((s, i) => ({
    x: getX(i),
    y: getY(Math.min(yMax, s.ratioPercent)),
    scenario: s
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="p-5 rounded-2xl border-2 border-line bg-beigeCard/80">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="font-display text-base font-semibold text-ink">
            Repayment Burden Trajectory
          </h4>
          <p className="text-xs text-inkSoft">
            How EMI / Income ratio scales when monthly income shifts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-go">
            <span className="w-3 h-0.5 border-t border-dashed border-go inline-block"></span>
            30% (Comfortable)
          </span>
          <span className="flex items-center gap-1.5 text-gold">
            <span className="w-3 h-0.5 border-t border-dashed border-gold inline-block"></span>
            40% (Manageable)
          </span>
          <span className="flex items-center gap-1.5 text-maroon">
            <span className="w-3 h-0.5 border-t border-dashed border-maroon inline-block"></span>
            50% (High Risk)
          </span>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible font-sans"
        >
          {/* Threshold reference lines */}
          {/* 30% line */}
          <line
            x1={padding.left}
            y1={getY(30)}
            x2={width - padding.right}
            y2={getY(30)}
            stroke="#2F6B4F"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text
            x={padding.left - 8}
            y={getY(30) + 4}
            textAnchor="end"
            className="text-[10px] font-mono fill-go"
          >
            30%
          </text>

          {/* 40% line */}
          <line
            x1={padding.left}
            y1={getY(40)}
            x2={width - padding.right}
            y2={getY(40)}
            stroke="#D97706"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text
            x={padding.left - 8}
            y={getY(40) + 4}
            textAnchor="end"
            className="text-[10px] font-mono fill-gold"
          >
            40%
          </text>

          {/* 50% line */}
          <line
            x1={padding.left}
            y1={getY(50)}
            x2={width - padding.right}
            y2={getY(50)}
            stroke="#9C2B1E"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text
            x={padding.left - 8}
            y={getY(50) + 4}
            textAnchor="end"
            className="text-[10px] font-mono fill-maroon font-bold"
          >
            50%
          </text>

          {/* Connective Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#E8762C"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const isExpected = p.scenario.scenario === 'EXPECTED'
            return (
              <g key={i}>
                {/* Vertical drop line */}
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={p.x}
                  y2={height - padding.bottom}
                  stroke="#E8762C"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.4"
                />

                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isExpected ? 6 : 5}
                  fill={isExpected ? '#B8541A' : '#FFFFFF'}
                  stroke="#B8541A"
                  strokeWidth={isExpected ? 3 : 2.5}
                />

                {/* Value label above point */}
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="text-xs font-mono font-bold fill-ink"
                >
                  {p.scenario.ratioPercent}%
                </text>

                {/* Scenario label below axis */}
                <text
                  x={p.x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-mono ${
                    isExpected ? 'font-bold fill-saffronDeep' : 'fill-inkSoft'
                  }`}
                >
                  {p.scenario.label.split(' ')[0]}
                </text>
                <text
                  x={p.x}
                  y={height - padding.bottom + 30}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-inkSoft"
                >
                  ({p.scenario.adjustmentPercent})
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 pt-3 border-t border-line text-xs text-inkSoft leading-relaxed">
        <strong>How to read this trajectory:</strong> If monthly business income falls by 20% to 40%, your repayment ratio climbs along this slope because the EMI is fixed while available cash decreases.
      </div>
    </div>
  )
}
