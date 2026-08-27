export function calculateSchemeScore(result) {
  const purposeMatch = result.purposeMatch ? 30 : 0
  const eligibility = result.status === 'ELIGIBLE' ? 30 : result.status === 'NEEDS_VERIFICATION' ? 15 : 0
  const financialFit = result.financial.requested_loan > 0 && result.financial.eligible_loan >= result.financial.requested_loan ? 20 : result.financial.eligible_loan > 0 ? 10 : 0
  const verification = result.status === 'ELIGIBLE' ? 10 : 5
  const loanFit = result.financial.requested_loan ? Math.round(Math.min(10, result.financial.eligible_loan / result.financial.requested_loan * 10)) : 0
  return { match_score: purposeMatch + eligibility + financialFit + verification + loanFit, score_breakdown: { purpose_match: purposeMatch, eligibility, financial_fit: financialFit, verification, loan_fit: loanFit } }
}

export function rankSchemeResults(results) {
  return [...results].sort((a, b) => b.match_score - a.match_score || b.financial.eligible_loan - a.financial.eligible_loan || a.scheme_code.localeCompare(b.scheme_code))
}
