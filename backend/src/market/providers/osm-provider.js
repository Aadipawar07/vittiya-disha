/**
 * OpenStreetMap Overpass API POI Provider
 *
 * Free fallback and cross-check provider for competitor discoveries.
 */

import { haversineDistanceKm } from '../location-engine.js'

/**
 * Searches for nearby competitor POIs using Overpass QL on OpenStreetMap.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radiusMeters
 * @param {Array<Record<string, string>>} osmTags
 * @param {string[]} keywords
 * @returns {Promise<import('../types.js').CompetitorRecord[]>}
 */
export async function searchOpenStreetMap(
  latitude,
  longitude,
  radiusMeters = 10000,
  osmTags = [],
  keywords = []
) {
  // Build Overpass QL query
  const tagClauses = osmTags
    .map((tag) => {
      const [k, v] = Object.entries(tag)[0] || []
      return k && v ? `node["${k}"="${v}"](around:${radiusMeters},${latitude},${longitude});` : ''
    })
    .filter(Boolean)
    .join('\n  ')

  const query = `
[out:json][timeout:15];
(
  ${tagClauses || `node["shop"](around:${radiusMeters},${latitude},${longitude});`}
);
out body 40;
>;
out skel qt;
`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) return []

    const data = await res.json()
    if (!Array.isArray(data.elements)) return []

    const competitors = []
    const seen = new Set()

    for (const el of data.elements) {
      if (el.type === 'node' && el.lat && el.lon && !seen.has(el.id)) {
        seen.add(el.id)
        const name = el.tags?.name || el.tags?.['name:en'] || el.tags?.operator || 'Local Store'
        const category = el.tags?.shop || el.tags?.amenity || el.tags?.craft || 'Retail'
        const dist = haversineDistanceKm(latitude, longitude, el.lat, el.lon)

        competitors.push({
          placeId: `osm-node-${el.id}`,
          name,
          category,
          latitude: el.lat,
          longitude: el.lon,
          distanceKm: dist,
          address: [el.tags?.['addr:street'], el.tags?.['addr:city'], el.tags?.['addr:postcode']]
            .filter(Boolean)
            .join(', ') || 'Local area',
          rating: null,
          userRatingsTotal: null,
          source: 'OPENSTREETMAP'
        })
      }
    }

    return competitors.sort((a, b) => a.distanceKm - b.distanceKm)
  } catch (err) {
    console.warn('[OSMProvider] Overpass API query failed/timed out:', err.message)
    return []
  }
}
