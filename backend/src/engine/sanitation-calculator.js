import { calculateSanitationFinancingGap } from './financial-calculator.js'

export function calculateSanitationLoan(input) {
  return { loan_required: calculateSanitationFinancingGap(input), calculation: 'project_cost - subsidy_amount - own_contribution', subsidy_percentage_assumed: false }
}
