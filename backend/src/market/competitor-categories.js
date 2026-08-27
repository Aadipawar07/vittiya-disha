/**
 * Competitor Category Taxonomy Accessor
 */

import categories from './competitor-categories.json' with { type: 'json' }

/**
 * Gets competitor query parameters for a given businessType.
 * @param {string} businessType
 * @returns {{
 *   displayName: string,
 *   googlePlacesTypes: string[],
 *   osmTags: Array<Record<string, string>>,
 *   keywords: string[]
 * }}
 */
export function getCompetitorCategoryConfig(businessType) {
  const norm = String(businessType || '').toLowerCase().trim()
  return (
    categories[norm] || {
      displayName: 'General Local Business',
      googlePlacesTypes: ['store', 'point_of_interest'],
      osmTags: [{ shop: 'yes' }],
      keywords: [businessType || 'business']
    }
  )
}

/**
 * Lists all known supported business categories.
 * @returns {Array<{ id: string, displayName: string }>}
 */
export function listSupportedCategories() {
  return Object.entries(categories).map(([id, config]) => ({
    id,
    displayName: config.displayName
  }))
}
