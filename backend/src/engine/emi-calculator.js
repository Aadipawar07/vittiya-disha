export function calculateEstimatedEmi(principal = 0, annualRate = 0, tenureYears = 1) {
  const payments = tenureYears * 12
  if (!principal || !payments) return { calculation_type: 'estimated_emi', is_official_repayment_schedule: false, emi: 0, total_repayment: 0, total_interest: 0 }
  const monthlyRate = annualRate / 12 / 100
  const emi = monthlyRate === 0 ? principal / payments : principal * monthlyRate * ((1 + monthlyRate) ** payments) / (((1 + monthlyRate) ** payments) - 1)
  return { calculation_type: 'estimated_emi', is_official_repayment_schedule: false, emi: Math.round(emi * 100) / 100, total_repayment: Math.round(emi * payments * 100) / 100, total_interest: Math.round((emi * payments - principal) * 100) / 100 }
}
