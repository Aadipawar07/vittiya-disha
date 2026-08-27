import { z } from 'zod'

const nonNegative = z.number().finite().nonnegative()
export const financialSchema = z.object({
  corporation: z.enum(['NBCFDC', 'NSFDC', 'NSKFDC']), schemeId: z.string().min(1), projectCost: nonNegative.optional(), requestedLoan: nonNegative.optional(), otherFunding: nonNegative.optional(), projectType: z.string().optional(), business: z.record(z.any()).optional(), requirement: z.record(z.any()).optional(), financial: z.record(z.any()).optional(), education: z.record(z.any()).optional(), nskfdc: z.record(z.any()).optional()
}).superRefine((value, context) => {
  const projectCost = value.projectCost ?? value.financial?.projectCost ?? value.requirement?.project_cost
  const requestedLoan = value.requestedLoan ?? value.financial?.requestedLoan ?? value.requirement?.loan_required
  if (projectCost !== undefined && requestedLoan !== undefined && requestedLoan > projectCost) context.addIssue({ code: z.ZodIssueCode.custom, path: ['requestedLoan'], message: 'Requested loan cannot exceed estimated project cost.' })
})

export const businessEstimateSchema = z.object({ businessType: z.string().min(1), scale: z.string().optional(), property: z.record(z.any()).optional(), monthlyRent: nonNegative.optional(), securityDepositMonths: nonNegative.optional(), propertyPurchaseCost: nonNegative.optional(), registrationCost: nonNegative.optional(), renovationCost: nonNegative.optional(), builtUpAreaSqFt: nonNegative.optional(), constructionCostPerSqFt: nonNegative.optional(), equipment: z.union([z.array(z.object({ quantity: nonNegative, unitCost: nonNegative })), nonNegative]).optional(), furniture: z.union([z.array(z.object({ quantity: nonNegative, unitCost: nonNegative })), nonNegative]).optional(), inventory: nonNegative.optional(), workingCapital: z.object({ monthlyOperatingExpense: nonNegative, months: nonNegative }).optional(), employees: z.array(z.object({ count: nonNegative, monthlySalary: nonNegative })).optional(), vehiclePurchaseCost: nonNegative.optional(), marketingBudget: nonNegative.optional(), installationCost: nonNegative.optional(), licenseCost: nonNegative.optional(), otherCost: nonNegative.optional() })
