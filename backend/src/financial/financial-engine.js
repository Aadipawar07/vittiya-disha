import { calculateEstimatedEmi } from '../engine/emi-calculator.js'
import { ENGINE_VERSION } from '../config/constants.js'
import { calculateEligibleLoan, calculateFinancing, calculateFundingGap, calculateInterestTerms, calculateMoratorium, calculateRequiredContribution, calculateTier, projectCostFromMargin } from './calculators.js'
import { getFinancialRules } from './financial-rules.js'

export function calculateFinancialRecommendation(input) {
  const rules = getFinancialRules(input.schemeId)
  if (!rules) throw Object.assign(new Error('Unknown financial scheme'), { statusCode: 400, code: 'UNKNOWN_SCHEME' })
  const marginPercentage = rules.financing.beneficiaryMargin
  const projectCost = Number(input.projectCost ?? input.business?.projectCost ?? input.requirement?.project_cost ?? (input.marginCapital === undefined ? 0 : projectCostFromMargin(Number(input.marginCapital), marginPercentage)))
  const requestedLoan = input.requestedLoan ?? input.financial?.requestedLoan ?? input.requirement?.loan_required
  const otherFunding = Number(input.otherFunding ?? input.financial?.otherFunding ?? 0)
  const loanPercentage = rules.financing.corporationShare
  const financingCapacity = calculateFinancing(projectCost, loanPercentage)
  const maximumLoan = typeof rules.loanLimit.maximum === 'function' ? rules.loanLimit.maximum(input) : rules.loanLimit.maximum
  const eligibleLoan = calculateEligibleLoan({ requestedLoan: requestedLoan === undefined ? undefined : Number(requestedLoan), financingAmount: financingCapacity, loanLimit: maximumLoan })
  const beneficiaryContribution = calculateRequiredContribution(projectCost, eligibleLoan)
  const userContribution = Number(input.ownContribution ?? input.financial?.ownContribution ?? input.requirement?.own_contribution ?? 0)
  const fundingGap = calculateFundingGap(projectCost, eligibleLoan, otherFunding)
  const tier = input.schemeId.startsWith('NSFDC_') ? calculateTier(projectCost) : undefined
  const interest = calculateInterestTerms(rules, eligibleLoan, input)
  const moratoriumMonths = calculateMoratorium(rules, input)
  const fixedRate = interest.beneficiaryRate
  const emi = fixedRate === undefined ? { calculationType: 'estimated_emi', officialSchedule: false, unavailableReason: 'Rate range requires an explicit scenario rate' } : { ...calculateEstimatedEmi(eligibleLoan, fixedRate, rules.repayment.tenureYears), amount: calculateEstimatedEmi(eligibleLoan, fixedRate, rules.repayment.tenureYears).emi, type: 'ESTIMATED', officialSchedule: false }
  const audit = { engineVersion: ENGINE_VERSION, schemeVersion: rules.schemeVersion, effectiveFrom: rules.effectiveFrom, rulesApplied: [{ formula: 'projectCost * financingPercentage', inputs: { projectCost, financingPercentage: loanPercentage }, result: financingCapacity }, { formula: 'MIN(requestedLoan, financingCapacity, schemeMaximum)', inputs: { requestedLoan, financingCapacity, schemeMaximum: maximumLoan }, result: eligibleLoan }, { formula: 'MAX(0, projectCost - eligibleLoan - otherFunding)', inputs: { projectCost, eligibleLoan, otherFunding }, result: fundingGap }] }
  return { status: tier === 'SPECIAL_SANCTION_REQUIRED' ? 'SPECIAL_SANCTION_REQUIRED' : 'CALCULATED', reason: tier === 'SPECIAL_SANCTION_REQUIRED' ? 'Project cost exceeds standard NSFDC configured scope.' : undefined, tier, project: { estimatedCost: projectCost }, financing: { schemePercentage: loanPercentage, marginPercentage, schemeFinancingCapacity: financingCapacity, schemeMaximumLoan: maximumLoan, requestedLoan: requestedLoan ?? financingCapacity, eligibleLoan, beneficiaryContribution, userContribution, surplusContribution: Math.max(0, userContribution - beneficiaryContribution), additionalContributionRequired: Math.max(0, beneficiaryContribution - userContribution), fundingGap, otherFunding }, interest: { ...interest, rate: interest.beneficiaryRate ?? null, rateType: interest.type }, repayment: { ...rules.repayment, moratoriumMonths }, emi, fundingGap, audit }
}
