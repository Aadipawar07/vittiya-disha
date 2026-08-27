/**
 * Market Engine — Type Definitions & Enums
 */

/**
 * @typedef {'GPS' | 'MAP_SELECTED' | 'GOOGLE_GEOCODE' | 'PINCODE' | 'MANUAL_ADDRESS'} LocationSource
 */

/**
 * @typedef {'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA'} ConfidenceLevel
 */

/**
 * @typedef {'GOOGLE_PRIMARY' | 'OSM_FALLBACK' | 'GOOGLE_AND_OSM_CROSSCHECK'} MarketProviderMode
 */

/**
 * @typedef {Object} GeoPoint
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} NormalizedLocation
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} formattedAddress
 * @property {string} [village]
 * @property {string} [block]
 * @property {string} [district]
 * @property {string} [state]
 * @property {string} [pincode]
 * @property {LocationSource} locationSource
 * @property {ConfidenceLevel} confidence
 * @property {string} [placeId]
 */

/**
 * @typedef {Object} CompetitorRecord
 * @property {string} placeId
 * @property {string} name
 * @property {string} category
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} distanceKm
 * @property {string} address
 * @property {number|null} [rating]
 * @property {number|null} [userRatingsTotal]
 * @property {'GOOGLE_PLACES' | 'OPENSTREETMAP' | 'MOCK_DATA'} source
 */

/**
 * @typedef {Object} CensusPopulationRecord
 * @property {string} stateCode
 * @property {string} districtCode
 * @property {string} subDistrictCode
 * @property {string} villageCode
 * @property {string} villageName
 * @property {number} population
 * @property {number} households
 * @property {number} [malePopulation]
 * @property {number} [femalePopulation]
 * @property {number} [age0to6]
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} censusYear
 * @property {string} source
 */

export const CONFIDENCE_LEVELS = Object.freeze({
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
})

export const LOCATION_SOURCES = Object.freeze({
  GPS: 'GPS',
  MAP_SELECTED: 'MAP_SELECTED',
  GOOGLE_GEOCODE: 'GOOGLE_GEOCODE',
  PINCODE: 'PINCODE',
  MANUAL_ADDRESS: 'MANUAL_ADDRESS'
})
