import { estimateBusinessCost } from './business-cost-engine.js'
export function estimateScenarios(input) { const base = estimateBusinessCost(input); return { LOW_COST_SCENARIO: { ...base, estimatedProjectCost: base.costRange.low }, BASE_SCENARIO: base, HIGH_COST_SCENARIO: { ...base, estimatedProjectCost: base.costRange.high } } }
