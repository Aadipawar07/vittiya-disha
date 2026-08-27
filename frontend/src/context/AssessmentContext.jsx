// Global assessment state context
import React, { createContext, useState } from 'react'

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

  return (
    <AssessmentContext.Provider value={{ assessment, setAssessment, assessmentResult, setAssessmentResult }}>
      {children}
    </AssessmentContext.Provider>
  )
}
