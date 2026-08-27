export const businessCostCatalog = {
  grocery_shop: { equipment: { min: 45000, max: 90000 }, furniture: { min: 30000, max: 60000 }, inventory: { min: 100000, max: 200000 } },
  salon: { equipment: { min: 80000, max: 180000 }, furniture: { min: 50000, max: 120000 }, inventory: { min: 20000, max: 50000 } },
  dairy: { equipment: { min: 150000, max: 300000 }, inventory: { min: 50000, max: 120000 }, vehicle: { min: 250000, max: 600000 } },
  tailoring: { equipment: { min: 60000, max: 150000 }, furniture: { min: 20000, max: 50000 }, inventory: { min: 30000, max: 80000 } },
  restaurant: { equipment: { min: 250000, max: 600000 }, furniture: { min: 100000, max: 250000 }, inventory: { min: 100000, max: 250000 } }
}
export function getBusinessTemplate(type) { return businessCostCatalog[String(type || '').toLowerCase()] }
