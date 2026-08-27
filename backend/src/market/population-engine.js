/**
 * Population Engine
 *
 * Sourced from official Census of India 2011.
 * Aggregates population across settlements within 10 km radius.
 */

import { populationRepository } from './repositories/population-repository.js'
import { CONFIDENCE_LEVELS } from './types.js'

/**
 * Calculates population within radius and retrieves census breakdown.
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} [villageName]
 * @param {string} [districtName]
 * @param {number} [radiusKm]
 * @returns {Object}
 */
export function getPopulationAnalysis(latitude, longitude, villageName = '', districtName = '', radiusKm = 10) {
  // 1. Check settlements within radius
  const settlements = populationRepository.findSettlementsInRadius(latitude, longitude, radiusKm)

  if (settlements.length > 0) {
    const totalPopulation = settlements.reduce((sum, item) => sum + item.settlement.population, 0)
    const totalHouseholds = settlements.reduce((sum, item) => sum + item.settlement.households, 0)

    const primaryVillage = settlements[0]?.settlement?.villageName || villageName || 'Local Village'

    return {
      populationWithinRadius: totalPopulation,
      householdsWithinRadius: totalHouseholds,
      settlementCount: settlements.length,
      primaryVillage,
      radiusKm,
      censusYear: 2011,
      source: 'CENSUS_OF_INDIA_2011',
      dataLevel: 'VILLAGE',
      confidence: settlements.length >= 3 ? CONFIDENCE_LEVELS.HIGH : CONFIDENCE_LEVELS.MEDIUM,
      settlements: settlements.map((s) => ({
        name: s.settlement.villageName,
        population: s.settlement.population,
        distanceKm: s.distanceKm
      })),
      coverageWarning:
        settlements.length < 2
          ? 'Population coverage within the selected radius is incomplete; Census settlement coordinates are limited.'
          : null,
      freshnessNote: 'Census 2011 official dataset. Current population may be 15–20% higher due to demographic growth.'
    }
  }

  // 2. Direct Village match fallback
  const directVillage = populationRepository.getVillagePopulation(villageName, districtName)
  if (directVillage) {
    // Estimate 10km radius as ~3.5x village cluster
    const estRadiusPop = directVillage.population * 3.5
    return {
      populationWithinRadius: Math.round(estRadiusPop),
      householdsWithinRadius: Math.round(directVillage.households * 3.5),
      settlementCount: 1,
      primaryVillage: directVillage.villageName,
      radiusKm,
      censusYear: 2011,
      source: 'CENSUS_OF_INDIA_2011',
      dataLevel: 'VILLAGE',
      confidence: CONFIDENCE_LEVELS.MEDIUM,
      settlements: [{ name: directVillage.villageName, population: directVillage.population, distanceKm: 0 }],
      coverageWarning: 'Radius population is estimated from the primary village census record.',
      freshnessNote: 'Census 2011 official dataset.'
    }
  }

  // 3. District proxy fallback
  const districtData = populationRepository.getDistrictPopulation(districtName)
  if (districtData) {
    // Approximate a 10 km circle area (314 sq km) against an average district area (5,000 sq km)
    // ~6% of district population
    const approxRadiusPop = Math.round(districtData.population * 0.04)
    return {
      populationWithinRadius: approxRadiusPop,
      householdsWithinRadius: Math.round(districtData.households * 0.04),
      settlementCount: 0,
      primaryVillage: villageName || 'District Area',
      radiusKm,
      censusYear: 2011,
      source: 'CENSUS_OF_INDIA_2011',
      dataLevel: 'DISTRICT',
      confidence: CONFIDENCE_LEVELS.LOW,
      settlements: [],
      coverageWarning: 'Village-level population data was unavailable. The assessment uses a district-level census proxy.',
      freshnessNote: 'Census 2011 district-level aggregate proxy.'
    }
  }

  // 4. Default rural baseline
  return {
    populationWithinRadius: 18500,
    householdsWithinRadius: 3700,
    settlementCount: 0,
    primaryVillage: villageName || 'Local Area',
    radiusKm,
    censusYear: 2011,
    source: 'CENSUS_OF_INDIA_2011',
    dataLevel: 'INSUFFICIENT',
    confidence: CONFIDENCE_LEVELS.LOW,
    settlements: [],
    coverageWarning: 'Insufficient local census data for this location — showing area-level demographic estimate.',
    freshnessNote: 'Census 2011 baseline proxy.'
  }
}
