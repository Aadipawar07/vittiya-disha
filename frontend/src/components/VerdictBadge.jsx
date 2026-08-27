// GO/CAUTION/RECONSIDER colored pill
export default function VerdictBadge({ verdict = 'GO' }) {
  const verdictMap = {
    GO: {
      emoji: '✅',
      bgClass: 'bg-go/15',
      textClass: 'text-go'
    },
    CAUTION: {
      emoji: '⚠️',
      bgClass: 'bg-gold/15',
      textClass: 'text-gold'
    },
    RECONSIDER: {
      emoji: '🛑',
      bgClass: 'bg-maroon/15',
      textClass: 'text-maroon'
    }
  }

  const config = verdictMap[verdict] || verdictMap.GO

  return (
    <span className={`inline-block rounded-full px-5 py-2 text-sm font-bold ${config.bgClass} ${config.textClass}`}>
      {config.emoji} {verdict}
    </span>
  )
}
