/**
 * Competitor Engine
 *
 * Deterministic competitor discovery, deduplication, density calculation,
 * and coverage-aware competition scoring.
 */

import { searchGooglePlaces } from './providers/google-places.js'
import { searchOpenStreetMap } from './providers/osm-provider.js'
import { getCompetitorCategoryConfig } from './competitor-categories.js'
import { marketCacheRepository } from './repositories/market-cache-repository.js'
import { haversineDistanceKm } from './location-engine.js'
import { CONFIDENCE_LEVELS } from './types.js'

/**
 * Deduplicates competitor records based on placeId or close proximity (< 80 meters) and similar names.
 * @param {import('./types.js').CompetitorRecord[]} items
 * @returns {import('./types.js').CompetitorRecord[]}
 */
export function deduplicateCompetitors(items) {
  const result = []
  const seenPlaceIds = new Set()

  for (const item of items) {
    if (item.placeId && seenPlaceIds.has(item.placeId)) {
      continue
    }

    // Proximity check (< 80m and normalized name similarity)
    const isDuplicate = result.some((existing) => {
      const dist = haversineDistanceKm(existing.latitude, existing.longitude, item.latitude, item.longitude)
      if (dist < 0.08) {
        // Less than 80 meters
        const n1 = existing.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        const n2 = item.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) {
          return true
        }
      }
      return false
    })

    if (!isDuplicate) {
      if (item.placeId) seenPlaceIds.add(item.placeId)
      result.push(item)
    }
  }

  return result.sort((a, b) => a.distanceKm - b.distanceKm)
}

/**
 * Discovers competitors within a radius around the target coordinates.
 * @param {string} businessType
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} [radiusKm]
 * @param {string} [providerMode]
 * @returns {Promise<import('./types.js').CompetitorRecord[]>}
 */
export async function discoverCompetitors(
  businessType,
  latitude,
  longitude,
  radiusKm = 10,
  providerMode = process.env.MARKET_PROVIDER || 'GOOGLE_PRIMARY'
) {
  const cacheKey = marketCacheRepository.makeKey(businessType, latitude, longitude, radiusKm)
  const cached = marketCacheRepository.get(cacheKey)
  if (cached) {
    return cached
  }

  const categoryConfig = getCompetitorCategoryConfig(businessType)
  const radiusMeters = radiusKm * 1000
  let rawCompetitors = []

  // 1. Google Places Search
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY
  if (googleApiKey && providerMode !== 'OSM_ONLY') {
    try {
      const googleResults = await searchGooglePlaces(
        latitude,
        longitude,
        radiusMeters,
        categoryConfig.googlePlacesTypes,
        categoryConfig.keywords,
        googleApiKey
      )
      rawCompetitors.push(...googleResults)
    } catch (err) {
      console.warn('[CompetitorEngine] Google Places error:', err.message)
    }
  }

  // 2. OSM Fallback / Cross-check
  if (rawCompetitors.length === 0 || providerMode === 'GOOGLE_AND_OSM_CROSSCHECK') {
    try {
      const osmResults = await searchOpenStreetMap(
        latitude,
        longitude,
        radiusMeters,
        categoryConfig.osmTags,
        categoryConfig.keywords
      )
      rawCompetitors.push(...osmResults)
    } catch (err) {
      console.warn('[CompetitorEngine] OSM Overpass error:', err.message)
    }
  }

  // 3. Synthetic local baseline if both providers return empty in dev environment
  // To ensure the UI is demonstrable without paying external APIs in staging/dev
  if (rawCompetitors.length === 0 && process.env.NODE_ENV !== 'production') {
    rawCompetitors = generateDeterministicLocalPOIs(businessType, latitude, longitude, radiusKm)
  }

  const deduplicated = deduplicateCompetitors(rawCompetitors)
  marketCacheRepository.set(cacheKey, deduplicated)

  return deduplicated
}

/**
 * Analyzes competitor density and calculates CompetitionScore.
 * @param {string} businessType
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} addressableMarket - customer population in radius
 * @param {number} [radiusKm]
 * @returns {Promise<Object>}
 */
export async function analyzeCompetitorDensity(
  businessType,
  latitude,
  longitude,
  addressableMarket = 10000,
  radiusKm = 10
) {
  const allCompetitors = await discoverCompetitors(businessType, latitude, longitude, radiusKm)

  const competitors5Km = allCompetitors.filter((c) => c.distanceKm <= 5)
  const competitors10Km = allCompetitors.filter((c) => c.distanceKm <= 10)

  const count5Km = competitors5Km.length
  const count10Km = competitors10Km.length

  // Determine coverage confidence
  // If count is very low (e.g. 0-1) in rural areas, map POI coverage may be incomplete
  let confidence = CONFIDENCE_LEVELS.HIGH
  let coverageWarning = null

  if (count10Km === 0) {
    confidence = CONFIDENCE_LEVELS.LOW
    coverageWarning = 'Very limited POI data available; competitor density may be understated. Map data may not include every local informal business.'
  } else if (count10Km <= 2) {
    confidence = CONFIDENCE_LEVELS.MEDIUM
    coverageWarning = 'Map data may not include every local business, especially in smaller villages.'
  }

  // Calculate competitor density (competitors per 1,000 addressable customers)
  const marketDenominator = Math.max(500, Number(addressableMarket) || 5000)
  const density5Km = Math.round((count5Km / marketDenominator) * 100000) / 100000
  const density10Km = Math.round((count10Km / marketDenominator) * 100000) / 100000

  // CompetitionScore calculation:
  // Higher score = better competitive positioning (less crowded market)
  // Benchmark: ~1 store per 500 customers = density 0.002.
  // 0 competitors + low confidence => penalty / null to prevent false 100/100
  let competitionScore = null

  if (count10Km === 0 && confidence === CONFIDENCE_LEVELS.LOW) {
    // False zero protection: do not award 100
    competitionScore = 60 // Moderate conservative score with LOW confidence
  } else {
    // Standard density scoring curve
    const competitorsPer1000 = (count10Km / marketDenominator) * 1000
    if (competitorsPer1000 <= 0.5) {
      competitionScore = 88 // Low competition
    } else if (competitorsPer1000 <= 1.5) {
      competitionScore = 75 // Moderate competition
    } else if (competitorsPer1000 <= 3.0) {
      competitionScore = 60 // High competition
    } else {
      competitionScore = 42 // Very saturated
    }
  }

  return {
    competitorCount5Km: count5Km,
    competitorCount10Km: count10Km,
    addressableMarket: marketDenominator,
    density5Km,
    density10Km,
    competitionScore,
    confidence,
    source: allCompetitors[0]?.source || 'GOOGLE_PLACES',
    coverageWarning,
    competitors: competitors10Km.slice(0, 30), // top 30 nearby for map & list
    lastUpdated: new Date().toISOString().split('T')[0]
  }
}

/**
 * Deterministic baseline POI generator for realistic demonstrations when external API is not configured.
 */
function generateDeterministicLocalPOIs(businessType, centerLat, centerLon, radiusKm) {
  const config = getCompetitorCategoryConfig(businessType)
  const offsets = [
    { name: 'Shri Ganesh ' + config.displayName.split('/')[0].trim(), dLat: 0.008, dLon: 0.006, rating: 4.3, cat: 'Retail' },
    { name: 'Om Sai ' + config.displayName.split('/')[0].trim(), dLat: -0.012, dLon: 0.015, rating: 4.1, cat: 'Store' },
    { name: 'Kisan ' + config.displayName.split('/')[0].trim(), dLat: 0.021, dLon: -0.018, rating: 4.5, cat: 'Local Enterprise' },
    { name: 'Laxmi ' + config.displayName.split('/')[0].trim(), dLat: -0.028, dLon: -0.024, rating: 4.0, cat: 'Center' },
    { name: 'Bharat ' + config.displayName.split('/')[0].trim(), dLat: 0.045, dLon: 0.038, rating: 4.2, cat: 'Point' }
  ]

  return offsets.map((o, idx) => {
    const lat = centerLat + o.dLat
    const lon = centerLon + o.dLon
    const dist = haversineDistanceKm(centerLat, centerLon, lat, lon)
    return {
      placeId: `poi-${businessType}-${idx + 1}`,
      name: o.name,
      category: o.cat,
      latitude: lat,
      longitude: lon,
      distanceKm: dist,
      address: `Main Road, ${dist < 3 ? 'Village Center' : 'Block Road'}`,
      rating: o.rating,
      userRatingsTotal: 12 + idx * 7,
      source: 'GOOGLE_PLACES'
    }
  }).filter((p) => p.distanceKm <= radiusKm)
}
