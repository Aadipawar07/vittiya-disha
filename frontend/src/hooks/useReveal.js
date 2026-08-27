// Hook for progressive reveal animation on component mount
import { useEffect, useRef, useState } from 'react'

export function useReveal() {
  const ref = useRef(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    if (ref.current) {
      setIsRevealed(true)
    }
  }, [ref])

  return [ref, isRevealed]
}
