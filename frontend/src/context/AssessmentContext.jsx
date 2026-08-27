// Global assessment state context
import React, { createContext, useState } from 'react'

export const AssessmentContext = createContext()

export function AssessmentProvider({ children }) {
  const [assessment, setAssessment] = useState({})

  return (
    <AssessmentContext.Provider value={{ assessment, setAssessment }}>
      {children}
    </AssessmentContext.Provider>
  )
}
