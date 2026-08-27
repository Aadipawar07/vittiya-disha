export function projectCostFromMargin(marginCapital, marginPercentage) { if (!marginPercentage) return 0; return Math.max(0, marginCapital / marginPercentage) }
export function calculateFinancing(projectCost, loanPercentage) { return Math.max(0, projectCost * loanPercentage) }
export function calculateEligibleLoan({ requestedLoan, financingAmount, loanLimit }) { return Math.max(0, Math.min(requestedLoan ?? financingAmount, financingAmount, loanLimit)) }
export function calculateRequiredContribution(projectCost, eligibleLoan) { return Math.max(0, projectCost - eligibleLoan) }
export function calculateFundingGap(projectCost, eligibleLoan, otherFunding = 0) { return Math.max(0, projectCost - eligibleLoan - otherFunding) }
export function calculateTier(projectCost) { if (projectCost <= 125000) return 'MICRO_CREDIT'; if (projectCost <= 5000000) return 'TERM_LOAN'; return 'SPECIAL_SANCTION_REQUIRED' }
export function calculateInterestTerms(rules, eligibleLoan, input) {
  if (rules.interest.type === 'TIERED') return rules.interest.tiers.find((tier) => eligibleLoan <= tier.maximum) || rules.interest.tiers.at(-1)
  return rules.interest
}
export function calculateMoratorium(rules, input) { const special = rules.repayment.specialMoratorium; if (special && special.projectTypes.includes(input.business?.projectType || input.requirement?.project_type)) return special.months; return rules.repayment.moratoriumMonths }
