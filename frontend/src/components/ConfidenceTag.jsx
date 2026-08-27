// Small confidence-level label (high/calculated/estimated/insufficient)
export default function ConfidenceTag({ level = 'high' }) {
  const confidenceMap = {
    high: {
      emoji: '🟢',
      label: 'High confidence',
      textClass: 'text-go'
    },
    calculated: {
      emoji: '🔵',
      label: 'Calculated',
      textClass: 'text-go'
    },
    estimated: {
      emoji: '🟡',
      label: 'Estimated',
      textClass: 'text-gold'
    },
    insufficient: {
      emoji: '🔴',
      label: 'Insufficient data',
      textClass: 'text-maroon'
    }
  }

  const config = confidenceMap[level] || confidenceMap.high

  return (
    <span className={`font-mono text-[10px] font-semibold ${config.textClass}`}>
      {config.emoji} {config.label}
    </span>
  )
}
