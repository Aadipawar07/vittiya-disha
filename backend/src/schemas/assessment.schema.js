import { z } from 'zod'
import { CORPORATIONS } from '../config/constants.js'

const optionalNumber = z.number().finite().nonnegative().optional()
const profile = z.object({
  age: z.number().positive().optional(), gender: z.string().optional(), category: z.string().optional(), caste_certificate: z.boolean().nullable().optional(),
  annual_family_income: optionalNumber, state: z.string().optional(), district: z.string().optional(), rural_urban: z.string().optional(), occupation: z.string().optional()
}).default({})
const requirement = z.object({ purpose: z.string().min(1), business_type: z.string().optional(), existing_business: z.boolean().optional(), project_cost: optionalNumber, loan_required: optionalNumber, own_contribution: optionalNumber, route: z.string().optional() }).default({})
const group = z.object({ group_type: z.string().optional(), group_size: z.number().positive().optional(), total_members: z.number().positive().optional(), backward_class_members: z.number().nonnegative().optional(), project_cost: optionalNumber, loan_required: optionalNumber }).default({})
const education = z.object({ course_name: z.string().optional(), course_type: z.string().optional(), institution: z.string().optional(), course_fee: optionalNumber, india_or_abroad: z.string().optional(), country: z.string().optional(), admission_status: z.string().optional(), education_level: z.string().optional() }).default({})
const nskfdc = z.object({ beneficiary_type: z.string().optional(), equipment_required: z.union([z.boolean(), z.string()]).optional(), vehicle_required: z.union([z.boolean(), z.string()]).optional(), equipment_type: z.string().optional(), vehicle_type: z.string().optional(), applicant_type: z.string().optional(), sanitation_project: z.string().optional() }).default({})
const business = z.record(z.any()).default({})
const financial = z.object({ requestedAmount: optionalNumber, ownContribution: optionalNumber, otherFunding: optionalNumber }).default({})

export const assessmentSchema = z.object({ corporation: z.enum(CORPORATIONS), profile, requirement, business, group, education, nskfdc, financial }).superRefine((value, context) => {
  const r = { ...value.business, ...value.requirement }
  if (r.project_cost !== undefined && r.loan_required !== undefined && r.loan_required > r.project_cost) context.addIssue({ code: z.ZodIssueCode.custom, path: ['requirement', 'loan_required'], message: 'Must not exceed project_cost' })
  if (r.own_contribution !== undefined && r.project_cost !== undefined && r.own_contribution > r.project_cost) context.addIssue({ code: z.ZodIssueCode.custom, path: ['requirement', 'own_contribution'], message: 'Must not exceed project_cost' })
  const g = value.group
  const size = g.group_size ?? g.total_members
  if (g.backward_class_members !== undefined && size !== undefined && g.backward_class_members > size) context.addIssue({ code: z.ZodIssueCode.custom, path: ['group', 'backward_class_members'], message: 'Must not exceed group size' })
})
