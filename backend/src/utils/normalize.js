export function normalizeUser(input) {
  const r = input.requirement || {}
  const g = input.group || {}
  const e = input.education || {}
  const n = input.nskfdc || {}
  return {
    corporation: input.corporation,
    profile: { ...(input.profile || {}) },
    requirement: { ...r, purpose: r.purpose, business_type: r.business_type || input.business?.type, existing_business: r.existing_business ?? (input.business?.status ? input.business.status === 'existing' : undefined), project_cost: r.project_cost ?? input.business?.project_cost, loan_required: r.loan_required ?? input.business?.loan_required, own_contribution: r.own_contribution ?? input.business?.own_contribution },
    group: { ...g, group_size: g.group_size ?? g.total_members },
    education: { ...e, course_fee: e.course_fee ?? input.business?.course_fee },
    nskfdc: { ...n, beneficiary_type: n.beneficiary_type || r.beneficiary_type }
  }
}
