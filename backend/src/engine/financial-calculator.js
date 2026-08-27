export function calculatePercentageFinance(projectCost = 0, percentage = 0) { return Math.max(0, projectCost * percentage) }
export function calculateEligibleLoan({ loanRequired = 0, projectCost = 0, financingPercentage = 1, maximum = Infinity }) { return Math.max(0, Math.min(loanRequired, calculatePercentageFinance(projectCost, financingPercentage), maximum)) }
export function calculateRequiredContribution(projectCost = 0, eligibleLoan = 0) { return Math.max(0, projectCost - eligibleLoan) }
export function calculateSanitationFinancingGap({ projectCost = 0, subsidyAmount = 0, ownContribution = 0 }) { return Math.max(0, projectCost - subsidyAmount - ownContribution) }
