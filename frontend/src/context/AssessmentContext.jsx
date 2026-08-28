// Global assessment state context
import React, { createContext, useState, useRef } from 'react'

export const AssessmentContext = createContext()

const loadSaved = (key, fallback) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = window.sessionStorage.getItem(key)
      if (saved) return JSON.parse(saved)
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return fallback
}

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
  financial: {
    requestedAmount: '',
    ownContribution: '',
    otherFunding: '',
    expectedMonthlyIncome: '',
    singleBuyerDependency: null
  },
  location: {},
  execution: {},
  education: {},
  group: {},
  nskfdc: {}
}

export function AssessmentProvider({ children }) {
  const [assessment, setAssessmentState] = useState(() => loadSaved('vittiya_assessment', initialAssessment))
  const [assessmentResult, setAssessmentResultState] = useState(() => loadSaved('vittiya_assessment_result', null))
  const [feasibilityResult, setFeasibilityResultState] = useState(() => loadSaved('vittiya_feasibility_result', null))

  const setAssessment = (updater) => {
    setAssessmentState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('vittiya_assessment', JSON.stringify(next))
        }
      } catch (e) {}
      return next
    })
  }

  const setAssessmentResult = (val) => {
    setAssessmentResultState(val)
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (val === null) {
          window.sessionStorage.removeItem('vittiya_assessment_result')
        } else {
          window.sessionStorage.setItem('vittiya_assessment_result', JSON.stringify(val))
        }
      }
    } catch (e) {}
  }

  const setFeasibilityResult = (val) => {
    setFeasibilityResultState(val)
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (val === null) {
          window.sessionStorage.removeItem('vittiya_feasibility_result')
        } else {
          window.sessionStorage.setItem('vittiya_feasibility_result', JSON.stringify(val))
        }
      }
    } catch (e) {}
  }

  // Stable assessment session ID — generated once per page session.
  const assessmentIdRef = useRef(
    (() => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const savedId = window.sessionStorage.getItem('vittiya_assessment_id')
          if (savedId) return savedId
        }
      } catch (e) {}
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess-${Date.now()}`
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('vittiya_assessment_id', newId)
        }
      } catch (e) {}
      return newId
    })()
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
