// Global assessment state context
import React, { createContext, useState, useRef } from 'react'

export const AssessmentContext = createContext()

export const initialAssessment = {
  corporation: '',
  profile: {
    age: '',
    gender: '',
    category: '',
    caste_certificate: null,
    annual_family_income: '',
    state: '',
    district: '',
    rural_urban: '',
    occupation: ''
  },
  requirement: { purpose: '', beneficiary_type: '' },
  business: {},
  education: {},
  group: {},
  nskfdc: {}
}

export function AssessmentProvider({ children }) {
  const [assessment, setAssessment] = useState(initialAssessment)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [feasibilityResult, setFeasibilityResult] = useState(null)

  // Stable assessment session ID — generated once per page session.
  // Used as the :assessmentId URL param in /feasibility/:assessmentId.
  // This is a client-side transient ID, not persisted to a database.
  const assessmentIdRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sess-${Date.now()}`
  )
  const assessmentId = assessmentIdRef.current

  return (
    <AssessmentContext.Provider value={{
      assessment,
      setAssessment,
      assessmentResult,
      setAssessmentResult,
      feasibilityResult,
      setFeasibilityResult,
      assessmentId
    }}>
      {children}
    </AssessmentContext.Provider>
  )
}
