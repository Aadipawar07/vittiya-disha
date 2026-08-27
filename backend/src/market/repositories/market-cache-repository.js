/**
 * Market Cache Repository
 *
 * In-memory TTL cache for geospatial market and POI search results.
 * Buckets coordinates to ~1 km precision (2 decimal places) to maximize hit rate.
 */

export class MarketCacheRepository {
  constructor(defaultTtlMs = 1000 * 60 * 60 * 24) {
    // 24-hour cache default
    this.cache = new Map()
    this.defaultTtlMs = defaultTtlMs
  }

  /**
   * Generates a spatial cache key bucketed to ~1.1 km.
   * @param {string} category
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} radiusKm
   * @returns {string}
   */
  makeKey(category, latitude, longitude, radiusKm) {
    const latBucket = (Math.round(latitude * 100) / 100).toFixed(2)
    const lonBucket = (Math.round(longitude * 100) / 100).toFixed(2)
    return `${category.toLowerCase()}:${latBucket}:${lonBucket}:${radiusKm}`
  }

  /**
   * Gets cached entry if not expired.
   * @param {string} key
   * @returns {any | null}
   */
  get(key) {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  /**
   * Sets cached entry with expiration timestamp.
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlMs]
   */
  set(key, value, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      value,
      cachedAt: new Date().toISOString(),
      expiresAt: Date.now() + ttlMs
    })
  }

  /**
   * Clears the cache.
   */
  clear() {
    this.cache.clear()
  }
}

export const marketCacheRepository = new MarketCacheRepository()
