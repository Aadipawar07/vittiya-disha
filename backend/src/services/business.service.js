import { estimateBusinessCost, estimateScenarios } from '../business/index.js'
export function createBusinessEstimate(input) { return { ...estimateBusinessCost(input), scenarios: estimateScenarios(input) } }
