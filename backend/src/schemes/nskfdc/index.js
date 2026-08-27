import { baseMeta, interest, rangeInterest, purposeRule, rule } from '../scheme-helpers.js'
const beneficiary = (allowed) => rule('BENEFICIARY_TYPE', 'nskfdc.beneficiary_type', (value) => allowed.includes(String(value).toLowerCase().replaceAll(' ', '_')), allowed)
const base = (code, name, purpose, maximum, terms, rules = []) => ({ ...baseMeta(code, 'NSKFDC', name, purpose, `${name} for eligible Safai Karamchari, scavenger or dependant pathways.`), eligibility_rules: [...rules, purposeRule(purpose)], financial_rules: { financing_percentage: 1, maximum }, interest_rules: terms.rateRange ? rangeInterest(...terms.rateRange) : interest(terms.rate), repayment_rules: { tenure_years: terms.tenure, moratorium_months: terms.moratorium || 0 } })
const eligibleBeneficiaries = ['safai_karamchari', 'wastepicker', 'manual_scavenger', 'eligible_dependant', 'scavenger', 'dependant_daughter']
export const nskfdcSchemes = [
  base('NSKFDC_MAHILA_SAMRIDHI', 'Mahila Samridhi', 'small_business', 100000, { rate: 6, tenure: 3 }, [rule('GENDER', 'profile.gender', (value) => String(value).toLowerCase() === 'female', 'female'), beneficiary(eligibleBeneficiaries)]),
  base('NSKFDC_MAHILA_ADHIKARITA', 'Mahila Adhikarita', 'women_business', 200000, { rate: 7, tenure: 5 }, [rule('GENDER', 'profile.gender', (value) => String(value).toLowerCase() === 'female', 'female'), beneficiary(['safai_karamchari', 'scavenger', 'dependant_daughter'])]),
  base('NSKFDC_MICRO_CREDIT', 'Micro Credit', 'micro_credit', 100000, { rate: 7, tenure: 3 }, [beneficiary(eligibleBeneficiaries)]),
  base('NSKFDC_GENERAL_TERM_LOAN', 'General Term Loan', 'large_business', 1500000, { rateRange: [8, 9], tenure: 10 }, [beneficiary(eligibleBeneficiaries)]),
  base('NSKFDC_EDUCATION', 'Education Loan', 'education', 1000000, { rateRange: [6, 7], tenure: 10 }, [beneficiary(eligibleBeneficiaries)]),
  base('NSKFDC_PAY_USE_TOILET', 'Pay & Use Toilet Project', 'pay_use_toilet', 2500000, { rate: 8, tenure: 10 }, [beneficiary(eligibleBeneficiaries)]),
  base('NSKFDC_SANITARY_MART', 'Sanitary Mart', 'sanitary_mart', 1500000, { rate: 7, tenure: 10 }, [beneficiary(eligibleBeneficiaries)]),
  base('NSKFDC_GREEN_BUSINESS', 'Green Business', 'green_business', 3000000, { rateRange: [6, 8], tenure: 10 }, [beneficiary(eligibleBeneficiaries)]),
  { ...base('NSKFDC_SWACHHTA_UDYAMI', 'Swachhta Udyami Yojana', 'sanitation_enterprise', 1500000, { rate: 6, tenure: 7 }, [beneficiary(eligibleBeneficiaries)]), financial_rules: { financing_percentage: 1, maximum: (user) => String(user.nskfdc.applicant_type).toLowerCase() === 'group' ? 5000000 : 1500000 }, promoter_contribution_policy: 'not_insisted_upon' }
]
