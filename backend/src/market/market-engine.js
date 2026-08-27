/**
 * Market Engine — Master Orchestrator
 *
 * Combines Location, Census Population, Competitor POI Discovery,
 * Demand Modeling, and Business Opportunity Ranking.
 */

import { geocodeAddress, reverseGeocode, validateCoordinates } from './location-engine.js'
import { getPopulationAnalysis } from './population-engine.js'
import { analyzeCompetitorDensity } from './competitor-engine.js'
import { calculateDemand } from './demand-engine.js'
import { rankAlternativeOpportunities, generateActionableImprovements } from './opportunity-engine.js'
import { CONFIDENCE_LEVELS, LOCATION_SOURCES } from './types.js'

export class MarketEngine {
  /**
   * Performs end-to-end market analysis for a given business and location.
   * @param {Object} params
   * @param {string} params.businessType
   * @param {Object} params.location - { latitude, longitude, address, village, district, state, locationSource }
   * @param {number} [params.radiusKm=10]
   * @param {Object} [params.financialContext]
   * @returns {Promise<Object>}
   */
  async analyzeMarket({ businessType, location = {}, radiusKm = 10, financialContext = {} }) {
    let lat = location.latitude
    let lon = location.longitude
    let resolvedLoc = { ...location }

    // 1. Resolve coordinates if not provided
    if (!validateCoordinates(lat, lon)) {
      const geocoded = await geocodeAddress(location)
      if (geocoded.latitude && geocoded.longitude) {
        lat = geocoded.latitude
        lon = geocoded.longitude
        resolvedLoc = {
          ...location,
          ...geocoded,
          locationSource: geocoded.locationSource
        }
      } else {
        // Fallback default coordinates (Jalgaon, MH) for rural demo if geocoding fails completely
        lat = 21.0077
        lon = 75.5626
        resolvedLoc = {
          latitude: lat,
          longitude: lon,
          formattedAddress: location.village ? `${location.village}, ${location.district || ''}` : 'Jalgaon, Maharashtra',
          village: location.village || 'Jalgaon',
          district: location.district || 'Jalgaon',
          state: location.state || 'Maharashtra',
          locationSource: LOCATION_SOURCES.MANUAL_ADDRESS,
          confidence: CONFIDENCE_LEVELS.LOW
        }
      }
    } else if (!resolvedLoc.village || !resolvedLoc.district) {
      // Reverse geocode if coordinates provided directly by map picker
      const rev = await reverseGeocode(lat, lon)
      resolvedLoc = {
        ...resolvedLoc,
        ...rev,
        locationSource: location.locationSource || LOCATION_SOURCES.MAP_SELECTED
      }
    }

    // 2. Population Analysis (Census of India 2011 10km settlement aggregation)
    const populationData = getPopulationAnalysis(
      lat,
      lon,
      resolvedLoc.village,
      resolvedLoc.district,
      radiusKm
    )

    // 3. Demand Estimation (Step-by-step audit trail)
    const demandData = calculateDemand(
      businessType,
      populationData.populationWithinRadius,
      populationData.confidence
    )

    // 4. Competitor Discovery & Density
    const competitorData = await analyzeCompetitorDensity(
      businessType,
      lat,
      lon,
      demandData.addressableCustomers,
      radiusKm
    )

    // 5. Opportunity Engine: Alternative Businesses & Actionable Suggestions
    const alternativeBusinesses = await rankAlternativeOpportunities(
      businessType,
      lat,
      lon,
      populationData.populationWithinRadius,
      financialContext
    )

    const actionableImprovements = generateActionableImprovements({
      demandScore: demandData.demandScore,
      competitionScore: competitorData.competitionScore,
      financialScore: financialContext.financialScore ?? 80,
      riskScore: financialContext.riskScore ?? 65
    })

    // Overall data confidence
    const overallConfidence =
      populationData.confidence === CONFIDENCE_LEVELS.HIGH && competitorData.confidence === CONFIDENCE_LEVELS.HIGH
        ? CONFIDENCE_LEVELS.HIGH
        : populationData.confidence === CONFIDENCE_LEVELS.LOW || competitorData.confidence === CONFIDENCE_LEVELS.LOW
          ? CONFIDENCE_LEVELS.LOW
          : CONFIDENCE_LEVELS.MEDIUM

    return {
      businessType,
      location: {
        latitude: lat,
        longitude: lon,
        formattedAddress: resolvedLoc.formattedAddress || `${resolvedLoc.village || ''}, ${resolvedLoc.district || ''}, ${resolvedLoc.state || ''}`.trim(),
        village: resolvedLoc.village || null,
        block: resolvedLoc.block || null,
        district: resolvedLoc.district || null,
        state: resolvedLoc.state || null,
        locationSource: resolvedLoc.locationSource || LOCATION_SOURCES.MANUAL_ADDRESS,
        confidence: resolvedLoc.confidence || CONFIDENCE_LEVELS.MEDIUM
      },
      radiusKm,
      population: populationData,
      competition: competitorData,
      demand: demandData,
      opportunity: {
        alternatives: alternativeBusinesses,
        improvements: actionableImprovements
      },
      overallConfidence,
      dataFreshness: {
        censusYear: 2011,
        poiLastChecked: competitorData.lastUpdated,
        assumptionsVersion: '2026.1'
      }
    }
  }
}

export const marketEngine = new MarketEngine()
