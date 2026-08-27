/**
 * Feasibility Analysis — Type Definitions
 *
 * These are JSDoc-style type definitions shared across the feasibility UI.
 * The backend is the source of truth for all computed values.
 * The frontend NEVER calculates scores — it only displays what the backend returns.
 */

/**
 * @typedef {'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA'} ConfidenceLevel
 * Confidence in the data used to compute a component's score.
 */

/**
 * @typedef {'MEASURED' | 'ESTIMATED' | 'CALCULATED' | 'USER_REPORTED'} DataType
 * How the underlying data was obtained.
 * - MEASURED: directly observed or sourced data
 * - ESTIMATED: calculated using available proxies or category rules
 * - CALCULATED: deterministic calculation from known inputs
 * - USER_REPORTED: provided by the applicant
 */

/**
 * @typedef {'VILLAGE' | 'BLOCK' | 'DISTRICT' | 'STATE' | 'USER_REPORTED' | 'CALCULATED' | 'CATEGORY_RULE' | 'INSUFFICIENT'} DataLevel
 * Geographic or source granularity of the data used.
 */

/**
 * @typedef {Object} FeasibilityComponent
 * @property {number | null} score          - 0–100 or null when INSUFFICIENT_DATA
 * @property {number} weight                - 0–1 (e.g. 0.25 for 25%)
 * @property {ConfidenceLevel} confidence  - confidence in the data
 * @property {DataLevel} dataLevel         - granularity of data used
 * @property {DataType} type               - how the data was obtained
 * @property {string} [explanation]        - backend-supplied human explanation
 * @property {Object} [details]            - component-specific extra data
 */

/**
 * @typedef {Object} FeasibilityComponents
 * @property {FeasibilityComponent} demandFit
 * @property {FeasibilityComponent} competition
 * @property {FeasibilityComponent} financialFit
 * @property {FeasibilityComponent} risk
 * @property {FeasibilityComponent} executionFit
 */

/**
 * @typedef {Object} FeasibilityLocation
 * @property {string} [village]
 * @property {string} [block]
 * @property {string} [district]
 * @property {string} [state]
 * @property {DataLevel} dataCoverage
 */

/**
 * @typedef {Object} FeasibilityResult
 * @property {number | null} overallScore       - 0–100 or null
 * @property {string} label                     - e.g. "Strong feasibility"
 * @property {ConfidenceLevel} confidence       - overall confidence
 * @property {DataLevel} dataLevel              - overall data granularity
 * @property {string | null} warning            - warning message or null
 * @property {FeasibilityComponents} components - five-pillar breakdown
 * @property {FeasibilityLocation} [location]   - location context
 * @property {string} [recommendation]          - backend "what does this mean?" text
 * @property {string[]} [whyThisScore]          - deterministic explanation bullets
 * @property {string} [disclaimer]              - backend disclaimer text
 */

/**
 * Allowed confidence level values (used for runtime validation)
 * @type {ConfidenceLevel[]}
 */
export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT_DATA']

/**
 * Allowed data type values (used for runtime validation)
 * @type {DataType[]}
 */
export const DATA_TYPES = ['MEASURED', 'ESTIMATED', 'CALCULATED', 'USER_REPORTED']

/**
 * Allowed data level values (used for runtime validation)
 * @type {DataLevel[]}
 */
export const DATA_LEVELS = ['VILLAGE', 'BLOCK', 'DISTRICT', 'STATE', 'USER_REPORTED', 'CALCULATED', 'CATEGORY_RULE', 'INSUFFICIENT']

/**
 * Score interpretation bands (config-driven; backend label wins if provided)
 * @type {Array<{min: number, max: number, label: string}>}
 */
export const SCORE_BANDS = [
  { min: 0,  max: 39,  label: 'Low feasibility' },
  { min: 40, max: 59,  label: 'Moderate feasibility' },
  { min: 60, max: 74,  label: 'Good feasibility' },
  { min: 75, max: 89,  label: 'Strong feasibility' },
  { min: 90, max: 100, label: 'Very strong feasibility' }
]

/**
 * Get a fallback score label from SCORE_BANDS if backend doesn't provide one.
 * @param {number | null} score
 * @returns {string}
 */
export function getFallbackLabel(score) {
  if (score === null || score === undefined) return 'Insufficient data'
  const band = SCORE_BANDS.find((b) => score >= b.min && score <= b.max)
  return band?.label ?? 'Unknown'
}

/**
 * Validate a FeasibilityResult shape returned from the API.
 * Returns an array of validation error strings (empty = valid).
 * @param {unknown} data
 * @returns {string[]}
 */
export function validateFeasibilityResult(data) {
  const errors = []
  if (!data || typeof data !== 'object') {
    errors.push('Response is not an object')
    return errors
  }

  if (data.overallScore !== null && data.overallScore !== undefined) {
    if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
      errors.push(`overallScore must be 0–100 or null, got: ${data.overallScore}`)
    }
  }

  if (data.confidence && !CONFIDENCE_LEVELS.includes(data.confidence)) {
    errors.push(`confidence must be one of ${CONFIDENCE_LEVELS.join(', ')}, got: ${data.confidence}`)
  }

  if (data.components && typeof data.components === 'object') {
    const componentKeys = ['demandFit', 'competition', 'financialFit', 'risk', 'executionFit']
    for (const key of componentKeys) {
      const component = data.components[key]
      if (!component) continue
      if (component.score !== null && component.score !== undefined) {
        if (typeof component.score !== 'number' || component.score < 0 || component.score > 100) {
          errors.push(`components.${key}.score must be 0–100 or null`)
        }
      }
      if (component.weight !== undefined && (typeof component.weight !== 'number' || component.weight < 0 || component.weight > 1)) {
        errors.push(`components.${key}.weight must be 0–1`)
      }
      if (component.confidence && !CONFIDENCE_LEVELS.includes(component.confidence)) {
        errors.push(`components.${key}.confidence must be a valid ConfidenceLevel`)
      }
      if (component.type && !DATA_TYPES.includes(component.type)) {
        errors.push(`components.${key}.type must be a valid DataType`)
      }
    }
  }

  return errors
}
