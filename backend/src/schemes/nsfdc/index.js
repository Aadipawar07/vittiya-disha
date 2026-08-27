import { baseMeta, categoryRule, incomeRule, interest, rangeInterest, purposeRule } from '../scheme-helpers.js'
const common = [categoryRule('SC'), incomeRule(500000)]
const business = (code, name, purpose, maximum, rate, tenure = 3) => ({ ...baseMeta(code, 'NSFDC', name, purpose, `${name} for scheduled caste applicants.`), eligibility_rules: [...common, purposeRule(purpose)], financial_rules: { financing_percentage: 0.9, maximum }, interest_rules: typeof rate === 'number' ? interest(rate) : rangeInterest(...rate), repayment_rules: { tenure_years: tenure, moratorium_months: 0 } })
export const nsfdcSchemes = [
  business('NSFDC_MICRO_FINANCE', 'Micro Finance Scheme', 'micro_finance', 125000, 6.5),
  { ...business('NSFDC_AAJEEVIKA', 'Aajeevika Micro Finance Yojana', 'micro_finance_nbfc', 125000, 15), eligibility_rules: [...common, purposeRule('micro_finance_nbfc'), { id: 'ROUTE_NBFC_MFI', getActual: (user) => user.requirement.route, test: (value) => value === 'NBFC_MFI', expected: 'NBFC_MFI' }] },
  business('NSFDC_TERM_LOAN', 'Term Loan', 'large_income_generating_project', 4500000, 8, 7),
  business('NSFDC_UDYAM_NIDHI', 'Udyam Nidhi Yojana', 'small_business', 450000, [13, 15], 5),
  { ...baseMeta('NSFDC_EDUCATION', 'NSFDC', 'Education Loan', 'education', 'Education finance up to the specified course limit.'), eligibility_rules: [...common, purposeRule('education')], financial_rules: { courseFee: true, financing_percentage: 0.9, maximum: 4000000 }, interest_rules: interest(6.5), repayment_rules: { tenure_years: 12, moratorium_months: 0 } }
]
