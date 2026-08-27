// Hook to access and update assessment context
import { useContext } from 'react'
import { AssessmentContext } from '../context/AssessmentContext'

export function useAssessment() {
  return useContext(AssessmentContext)
}
