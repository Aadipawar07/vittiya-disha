// Pure helper functions for financial calculations
// All calculations are deterministic; no LLM involvement

export function calculateEMI(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100
  if (monthlyRate === 0) return principal / months
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

export function calculateTotalInterest(emi, months, principal) {
  return emi * months - principal
}
