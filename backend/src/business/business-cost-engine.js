import { getBusinessTemplate } from './business-cost-catalog.js'

const number = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0
const component = (amount, sourceType, confidence = 'HIGH') => ({ amount: number(amount), sourceType, confidence })

export function estimateBusinessCost(input) {
  input = { ...input, businessType: input.businessType || input.type, propertyPurchaseCost: input.propertyPurchaseCost ?? input.property_purchase_cost, renovationCost: input.renovationCost ?? input.renovation_cost, vehiclePurchaseCost: input.vehiclePurchaseCost ?? input.vehicle_purchase_cost, marketingBudget: input.marketingBudget ?? input.marketing_budget, installationCost: input.installationCost ?? input.installation_cost, licenseCost: input.licenseCost ?? input.license_cost, otherCost: input.otherCost ?? input.other_cost }
  input = {
    ...input,
    property: {
      ...(input.property || {}),
      path: input.property?.path || (input.locationType === 'rented_shop' || input.locationType === 'rented_commercial_space' ? 'RENTED_PROPERTY' : input.shop?.setupType === 'purchase_space' ? 'PURCHASE_PROPERTY' : input.shop?.setupType === 'build_from_scratch' ? 'BUILD_FROM_SCRATCH' : input.locationType === 'owned_shop' || input.locationType === 'owned_commercial_space' ? 'OWNED_PROPERTY' : undefined),
      monthlyRent: input.property?.monthlyRent ?? input.monthlyRent,
      securityDepositMonths: input.property?.securityDepositMonths ?? input.securityDepositMonths,
      renovationCost: input.property?.renovationCost ?? input.renovationCost
    },
    inventory: input.inventory?.amount ?? input.inventory,
    vehiclePurchaseCost: input.vehicle?.cost ?? input.vehiclePurchaseCost,
    licenseCost: input.license?.amount ?? input.licenseCost
  }
  const explicitProjectCost = input.projectCost ?? input.project_cost
  if (explicitProjectCost !== undefined) {
    const total = number(explicitProjectCost)
    return { estimatedProjectCost: total, costRange: { low: total, high: total }, breakdown: { project_cost: component(total, 'USER_INPUT', 'HIGH') }, label: 'Estimated business setup cost' }
  }
  const property = input.property || {}
  const components = {}
  const add = (id, amount, source = 'USER_INPUT', confidence = 'HIGH') => { if (components[id]) throw new Error(`Duplicate cost component: ${id}`); components[id] = component(amount, source, confidence) }
  if (property.path === 'RENTED_PROPERTY' || property.location === 'rented_shop' || property.location === 'rented_commercial_space') add('rent_deposit', number(property.monthlyRent) * number(property.securityDepositMonths), 'CALCULATED')
  if (property.path === 'PURCHASE_PROPERTY') { add('property_purchase', input.propertyPurchaseCost); add('registration', input.registrationCost, input.registrationCost === undefined ? 'REQUIRES_VERIFICATION' : 'USER_INPUT', input.registrationCost === undefined ? 'REQUIRES_VERIFICATION' : 'HIGH') }
  if (property.path === 'BUILD_FROM_SCRATCH') add('construction', number(input.builtUpAreaSqFt) * number(input.constructionCostPerSqFt), 'CALCULATED')
  add('renovation', input.renovationCost)
  const catalog = getBusinessTemplate(input.businessType)
  for (const key of ['equipment', 'furniture', 'inventory']) {
    const supplied = input[key]
    if (Array.isArray(supplied)) add(key, supplied.reduce((sum, item) => sum + number(item.quantity) * number(item.unitCost), 0), 'USER_INPUT')
    else if (supplied !== undefined && typeof supplied !== 'object') add(key, supplied)
    else if (catalog?.[key]) add(key, catalog[key].min, 'BUSINESS_COST_CATALOG', 'MEDIUM')
  }
  if (input.workingCapital) add('working_capital', number(input.workingCapital.monthlyOperatingExpense) * number(input.workingCapital.months), 'CALCULATED')
  if (Array.isArray(input.employees)) add('employees', input.employees.reduce((sum, item) => sum + number(item.count) * number(item.monthlySalary) * number(input.workingCapital?.months || 1), 0), 'CALCULATED')
  add('vehicle', input.vehiclePurchaseCost)
  add('licenses', input.licenseCost, input.licenseCost === undefined ? 'REQUIRES_VERIFICATION' : 'USER_INPUT', input.licenseCost === undefined ? 'REQUIRES_VERIFICATION' : 'HIGH')
  add('installation', input.installationCost)
  add('marketing', input.marketingBudget)
  add('other', input.otherCost)
  const values = Object.values(components)
  const estimatedProjectCost = values.reduce((sum, item) => sum + item.amount, 0)
  const catalogHigh = input.businessType && catalog ? Object.entries(catalog).reduce((sum, [, range]) => sum + range.max, 0) : estimatedProjectCost
  return { estimatedProjectCost, costRange: { low: estimatedProjectCost, high: Math.max(estimatedProjectCost, catalogHigh) }, breakdown: components, label: 'Estimated business setup cost' }
}
