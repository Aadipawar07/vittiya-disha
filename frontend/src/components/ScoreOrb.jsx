// The signature animated circular feasibility-score visual
import './ScoreOrb.css'

const colorMap = {
  go: {
    main: '#2F6B4F',
    soft: '#D9E8DF'
  },
  caution: {
    main: '#C6961D',
    soft: '#E8D9B8'
  },
  reconsider: {
    main: '#9C2B1E',
    soft: '#D9A9A0'
  }
}

export default function ScoreOrb({ score = 0, state = 'go', size = 'large' }) {
  const isSmall = size === 'small'

  const styleProps = {
    '--state-color': colorMap[state].main,
    '--state-soft': colorMap[state].soft
  }

  return (
    <div
      className={`orb-wrap ${isSmall ? 'small' : ''}`}
      style={styleProps}
    >
      {/* Outer pulsing dashed ring */}
      <div className="orb-ring"></div>

      {/* Core circle with rotating conic gradient */}
      <div className="orb-core"></div>

      {/* Glass highlight overlay */}
      <div className="orb-glass"></div>

      {/* Score text */}
      <div className="orb-score">
        <div className={`font-mono font-bold text-white ${isSmall ? 'text-3xl' : 'text-6xl'}`}>
          {Math.round(score)}
        </div>
        {!isSmall && (
          <div className="orb-label font-sans text-white text-xs mt-0">FEASIBILITY</div>
        )}
      </div>
    </div>
  )
}
