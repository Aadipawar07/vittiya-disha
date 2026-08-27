/**
 * Location Engine
 *
 * Handles deterministic coordinate math (Haversine distance),
 * geocoding, reverse geocoding, and confidence evaluation.
 */

import { CONFIDENCE_LEVELS, LOCATION_SOURCES } from './types.js'

const EARTH_RADIUS_KM = 6371.0

/**
 * Calculates deterministic spherical distance between two points using the Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers (rounded to 3 decimals)
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180.0

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const dist = EARTH_RADIUS_KM * c

  return Math.round(dist * 1000) / 1000
}

/**
 * Validates coordinate ranges.
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
export function validateCoordinates(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  )
}

/**
 * Normalizes an address object into a single structured query string.
 * @param {Object} addr
 * @returns {string}
 */
export function normalizeAddress(addr = {}) {
  const parts = [
    addr.detailedAddress,
    addr.village || addr.city,
    addr.block,
    addr.district,
    addr.state,
    addr.pincode,
    'India'
  ].filter(Boolean)

  return parts.join(', ')
}

/**
 * Geocodes an address into latitude/longitude using Google Geocoding or OSM Nominatim.
 * @param {Object} addressObj
 * @param {string} [apiKey]
 * @returns {Promise<import('./types.js').NormalizedLocation>}
 */
export async function geocodeAddress(addressObj = {}, apiKey = process.env.GOOGLE_MAPS_API_KEY) {
  const query = typeof addressObj === 'string' ? addressObj : normalizeAddress(addressObj)

  // 1. Google Geocoding if API key is present
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&region=in`
      const res = await fetch(url)
      const data = await res.json()

      if (data.status === 'OK' && data.results?.[0]) {
        const item = data.results[0]
        const lat = item.geometry.location.lat
        const lon = item.geometry.location.lng

        // Parse address components
        const comps = item.address_components || []
        const getComp = (type) => comps.find((c) => c.types.includes(type))?.long_name

        const locationType = item.geometry.location_type
        const confidence =
          locationType === 'ROOFTOP' || locationType === 'RANGE_INTERPOLATED'
            ? CONFIDENCE_LEVELS.HIGH
            : locationType === 'GEOMETRIC_CENTER'
              ? CONFIDENCE_LEVELS.MEDIUM
              : CONFIDENCE_LEVELS.LOW

        return {
          latitude: lat,
          longitude: lon,
          formattedAddress: item.formatted_address,
          village: getComp('locality') || getComp('sublocality_level_1') || addressObj.village || null,
          block: getComp('administrative_area_level_3') || addressObj.block || null,
          district: getComp('administrative_area_level_2') || addressObj.district || null,
          state: getComp('administrative_area_level_1') || addressObj.state || null,
          pincode: getComp('postal_code') || addressObj.pincode || null,
          placeId: item.place_id,
          locationSource: LOCATION_SOURCES.GOOGLE_GEOCODE,
          confidence
        }
      }
    } catch (err) {
      console.warn('[LocationEngine] Google geocoding error, falling back to OSM:', err.message)
    }
  }

  // 2. OpenStreetMap Nominatim Fallback
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1&countrycodes=in`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VittiyaDisha-MarketEngine/1.0 (financial-inclusion-platform)'
      }
    })
    const data = await res.json()

    if (Array.isArray(data) && data[0]) {
      const item = data[0]
      const addr = item.address || {}
      return {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        formattedAddress: item.display_name,
        village: addr.village || addr.town || addr.city || addressObj.village || null,
        block: addr.county || addressObj.block || null,
        district: addr.state_district || addr.district || addressObj.district || null,
        state: addr.state || addressObj.state || null,
        pincode: addr.postcode || addressObj.pincode || null,
        placeId: String(item.place_id),
        locationSource: LOCATION_SOURCES.MANUAL_ADDRESS,
        confidence: CONFIDENCE_LEVELS.MEDIUM
      }
    }
  } catch (err) {
    console.warn('[LocationEngine] OSM Nominatim geocoding error:', err.message)
  }

  // 3. Fallback coordinate mapping for common Indian states / districts if network is offline
  const fallbackLatLon = getOfflineDistrictCoordinates(addressObj.district, addressObj.state)
  if (fallbackLatLon) {
    return {
      latitude: fallbackLatLon.lat,
      longitude: fallbackLatLon.lon,
      formattedAddress: query,
      village: addressObj.village || null,
      block: addressObj.block || null,
      district: addressObj.district || null,
      state: addressObj.state || null,
      pincode: addressObj.pincode || null,
      locationSource: LOCATION_SOURCES.MANUAL_ADDRESS,
      confidence: CONFIDENCE_LEVELS.LOW
    }
  }

  return {
    latitude: null,
    longitude: null,
    formattedAddress: query,
    locationSource: LOCATION_SOURCES.MANUAL_ADDRESS,
    confidence: CONFIDENCE_LEVELS.INSUFFICIENT_DATA
  }
}

/**
 * Reverse geocodes coordinates to administrative boundaries.
 * @param {number} lat
 * @param {number} lon
 * @param {string} [apiKey]
 * @returns {Promise<Partial<import('./types.js').NormalizedLocation>>}
 */
export async function reverseGeocode(lat, lon, apiKey = process.env.GOOGLE_MAPS_API_KEY) {
  if (!validateCoordinates(lat, lon)) {
    return { confidence: CONFIDENCE_LEVELS.INSUFFICIENT_DATA }
  }

  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === 'OK' && data.results?.[0]) {
        const item = data.results[0]
        const comps = item.address_components || []
        const getComp = (type) => comps.find((c) => c.types.includes(type))?.long_name

        return {
          latitude: lat,
          longitude: lon,
          formattedAddress: item.formatted_address,
          village: getComp('locality') || getComp('sublocality_level_1') || null,
          block: getComp('administrative_area_level_3') || null,
          district: getComp('administrative_area_level_2') || null,
          state: getComp('administrative_area_level_1') || null,
          pincode: getComp('postal_code') || null,
          locationSource: LOCATION_SOURCES.MAP_SELECTED,
          confidence: CONFIDENCE_LEVELS.HIGH
        }
      }
    } catch (err) {
      console.warn('[LocationEngine] Google reverse geocoding error:', err.message)
    }
  }

  // OSM Nominatim reverse geocode
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VittiyaDisha-MarketEngine/1.0'
      }
    })
    const data = await res.json()
    if (data && data.address) {
      const addr = data.address
      return {
        latitude: lat,
        longitude: lon,
        formattedAddress: data.display_name,
        village: addr.village || addr.town || addr.city || addr.suburb || null,
        block: addr.county || null,
        district: addr.state_district || addr.district || null,
        state: addr.state || null,
        pincode: addr.postcode || null,
        locationSource: LOCATION_SOURCES.MAP_SELECTED,
        confidence: CONFIDENCE_LEVELS.HIGH
      }
    }
  } catch (err) {
    console.warn('[LocationEngine] OSM reverse geocoding error:', err.message)
  }

  return {
    latitude: lat,
    longitude: lon,
    formattedAddress: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    locationSource: LOCATION_SOURCES.MAP_SELECTED,
    confidence: CONFIDENCE_LEVELS.HIGH
  }
}

/**
 * Offline district lookup fallback
 */
function getOfflineDistrictCoordinates(district = '', state = '') {
  const norm = String(district).toLowerCase().trim()
  const districtMap = {
    jalgaon: { lat: 21.0077, lon: 75.5626 },
    pune: { lat: 18.5204, lon: 73.8567 },
    mumbai: { lat: 19.0760, lon: 72.8777 },
    nagpur: { lat: 21.1458, lon: 79.0882 },
    nashik: { lat: 19.9975, lon: 73.7898 },
    aurangabad: { lat: 19.8762, lon: 75.3433 },
    chhatrapati_sambhajinagar: { lat: 19.8762, lon: 75.3433 },
    ahmednagar: { lat: 19.0952, lon: 74.7496 },
    patna: { lat: 25.5941, lon: 85.1376 },
    lucknow: { lat: 26.8467, lon: 80.9462 },
    varanasi: { lat: 25.3176, lon: 82.9739 },
    jaipur: { lat: 26.9124, lon: 75.7873 },
    bhopal: { lat: 23.2599, lon: 77.4126 },
    indore: { lat: 22.7196, lon: 75.8577 },
    bengaluru: { lat: 12.9716, lon: 77.5946 },
    chennai: { lat: 13.0827, lon: 80.2707 },
    kolkata: { lat: 22.5726, lon: 88.3639 },
    hyderabad: { lat: 17.3850, lon: 78.4867 },
    ahmedabad: { lat: 23.0225, lon: 72.5714 }
  }

  return districtMap[norm] || null
}
