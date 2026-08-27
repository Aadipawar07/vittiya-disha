/**
 * Google Places API POI Provider
 *
 * Performs server-side nearby search for competitor POIs.
 * Never exposes the Google API key to the client.
 */

import { haversineDistanceKm } from '../location-engine.js'

/**
 * Searches for nearby competitor POIs using Google Places API.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radiusMeters
 * @param {string[]} types
 * @param {string[]} keywords
 * @param {string} apiKey
 * @returns {Promise<import('../types.js').CompetitorRecord[]>}
 */
export async function searchGooglePlaces(
  latitude,
  longitude,
  radiusMeters,
  types = [],
  keywords = [],
  apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY
) {
  if (!apiKey) {
    return []
  }

  const results = []
  const seenPlaceIds = new Set()

  // 1. Search by primary types
  for (const type of types.slice(0, 2)) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&type=${encodeURIComponent(type)}&key=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.status === 'OK' && Array.isArray(data.results)) {
        for (const place of data.results) {
          if (!seenPlaceIds.has(place.place_id)) {
            seenPlaceIds.add(place.place_id)
            const pLat = place.geometry?.location?.lat
            const pLon = place.geometry?.location?.lng
            const dist = pLat && pLon ? haversineDistanceKm(latitude, longitude, pLat, pLon) : 0

            results.push({
              placeId: place.place_id,
              name: place.name,
              category: type.replace(/_/g, ' '),
              latitude: pLat,
              longitude: pLon,
              distanceKm: dist,
              address: place.vicinity || place.formatted_address || 'Address on file',
              rating: place.rating ?? null,
              userRatingsTotal: place.user_ratings_total ?? null,
              source: 'GOOGLE_PLACES'
            })
          }
        }
      }
    } catch (err) {
      console.warn(`[GooglePlacesProvider] Error querying type ${type}:`, err.message)
    }
  }

  // 2. Search by primary keyword if type search returned few results
  if (results.length < 5 && keywords[0]) {
    try {
      const keyword = keywords[0]
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.status === 'OK' && Array.isArray(data.results)) {
        for (const place of data.results) {
          if (!seenPlaceIds.has(place.place_id)) {
            seenPlaceIds.add(place.place_id)
            const pLat = place.geometry?.location?.lat
            const pLon = place.geometry?.location?.lng
            const dist = pLat && pLon ? haversineDistanceKm(latitude, longitude, pLat, pLon) : 0

            results.push({
              placeId: place.place_id,
              name: place.name,
              category: keyword,
              latitude: pLat,
              longitude: pLon,
              distanceKm: dist,
              address: place.vicinity || place.formatted_address || 'Address on file',
              rating: place.rating ?? null,
              userRatingsTotal: place.user_ratings_total ?? null,
              source: 'GOOGLE_PLACES'
            })
          }
        }
      }
    } catch (err) {
      console.warn('[GooglePlacesProvider] Keyword search error:', err.message)
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm)
}
