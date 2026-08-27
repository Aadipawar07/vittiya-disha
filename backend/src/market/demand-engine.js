/**
 * Demand Engine
 *
 * Deterministic demand estimation and audit trail computation.
 * Exposes every formula variable with data provenance.
 */

import assumptions from './market-assumptions.json' with { type: 'json' }
import benchmarks from './market-benchmarks.json' with { type: 'json' }
import { CONFIDENCE_LEVELS } from './types.js'

/**
 * Calculates demand and audit trail for a given businessType and population.
 * @param {string} businessType
 * @param {number} populationWithinRadius
 * @param {string} [populationConfidence]
 * @returns {Object}
 */
export function calculateDemand(
  businessType,
  populationWithinRadius,
  populationConfidence = CONFIDENCE_LEVELS.MEDIUM
) {
  const norm = String(businessType || '').toLowerCase().trim()
  const categoryAssumptions = assumptions[norm] || assumptions.grocery_shop
  const categoryBenchmark = benchmarks[norm] || benchmarks.grocery_shop

  const pop = Math.max(100, Number(populationWithinRadius) || 10000)

  const demoShare = categoryAssumptions.relevantDemographicShare.value
  const addressableCustomers = Math.round(pop * demoShare)

  const adoptionRate = categoryAssumptions.categoryAdoptionRate.value
  const purchaseFrequency = categoryAssumptions.purchaseFrequency.value
  const avgTicket = categoryAssumptions.averageTransactionValue.value

  // Transparent step-by-step formula:
  // Demand = AddressableCustomers * AdoptionRate * PurchaseFrequency * AvgTransactionValue
  const annualDemand = Math.round(addressableCustomers * adoptionRate * purchaseFrequency * avgTicket)

  // DemandFit Score normalization (0-100) vs Benchmark
  const benchmarkDemand = categoryBenchmark.benchmarkAnnualDemand || 10000000
  const ratio = annualDemand / benchmarkDemand

  // Non-linear scoring curve capped at 95 to avoid false perfection
  let demandScore = Math.round(Math.min(95, Math.max(25, 40 + ratio * 45)))

  // Propagate confidence from population and assumption availability
  const confidence =
    populationConfidence === CONFIDENCE_LEVELS.HIGH
      ? CONFIDENCE_LEVELS.HIGH
      : populationConfidence === CONFIDENCE_LEVELS.MEDIUM
        ? CONFIDENCE_LEVELS.MEDIUM
        : CONFIDENCE_LEVELS.LOW

  return {
    populationWithinRadius: pop,
    addressableCustomers,
    estimatedDemandValue: annualDemand,
    demandScore,
    confidence,
    auditTrail: {
      population: {
        value: pop,
        source: 'Census of India 2011 10km Aggregation',
        type: 'MEASURED'
      },
      relevantDemographicShare: {
        value: demoShare,
        percentage: Math.round(demoShare * 100) + '%',
        source: categoryAssumptions.relevantDemographicShare.source,
        type: categoryAssumptions.relevantDemographicShare.sourceType
      },
      addressableCustomers: {
        value: addressableCustomers,
        source: 'Derived (Population × Demographic Share)',
        type: 'CALCULATED'
      },
      categoryAdoptionRate: {
        value: adoptionRate,
        percentage: Math.round(adoptionRate * 100) + '%',
        source: categoryAssumptions.categoryAdoptionRate.source,
        type: categoryAssumptions.categoryAdoptionRate.sourceType
      },
      purchaseFrequency: {
        value: purchaseFrequency,
        unit: categoryAssumptions.purchaseFrequency.unit,
        source: categoryAssumptions.purchaseFrequency.source,
        type: categoryAssumptions.purchaseFrequency.sourceType
      },
      averageTransactionValue: {
        value: avgTicket,
        currency: 'INR',
        source: categoryAssumptions.averageTransactionValue.source,
        type: categoryAssumptions.averageTransactionValue.sourceType
      },
      annualDemandValue: {
        value: annualDemand,
        formatted: `₹${(annualDemand / 10000000).toFixed(2)} Cr`,
        source: 'Transparent Calculation',
        type: 'ESTIMATED'
      }
    },
    disclaimer:
      'Demand is an estimate based on population, category assumptions and available market data. It is not measured sales demand.'
  }
}
