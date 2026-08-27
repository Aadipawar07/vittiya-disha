/**
 * Business Opportunity Engine
 *
 * Deterministically ranks alternative business categories for the selected location
 * and generates rule-based actionable improvements.
 */

import { calculateDemand } from './demand-engine.js'
import { analyzeCompetitorDensity } from './competitor-engine.js'
import { CONFIDENCE_LEVELS } from './types.js'

const ALTERNATIVE_CANDIDATES = ['dairy', 'grocery_shop', 'tailoring', 'salon', 'restaurant', 'workshop', 'pharmacy']

/**
 * Evaluates alternative business categories at the exact same location using identical rules.
 * @param {string} currentBusinessType
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} populationWithinRadius
 * @param {Object} financialContext
 * @returns {Promise<Array<Object>>}
 */
export async function rankAlternativeOpportunities(
  currentBusinessType,
  latitude,
  longitude,
  populationWithinRadius,
  financialContext = {}
) {
  const normCurrent = String(currentBusinessType || '').toLowerCase().trim()
  const candidates = ALTERNATIVE_CANDIDATES.filter((c) => c !== normCurrent)

  const evaluated = []

  for (const candidate of candidates) {
    try {
      const demand = calculateDemand(candidate, populationWithinRadius, CONFIDENCE_LEVELS.MEDIUM)
      const comp = await analyzeCompetitorDensity(
        candidate,
        latitude,
        longitude,
        demand.addressableCustomers,
        10
      )

      const demandScore = demand.demandScore
      const compScore = comp.competitionScore || 65
      const finScore = 75 // baseline financial fit
      const riskScore = 70
      const execScore = 70

      // Combined feasibility score
      const feasibility = Math.round(
        demandScore * 0.25 + compScore * 0.25 + finScore * 0.2 + riskScore * 0.15 + execScore * 0.15
      )

      evaluated.push({
        businessType: candidate,
        displayName: candidate.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        feasibilityScore: feasibility,
        demandRating: demandScore >= 75 ? 'Strong' : demandScore >= 60 ? 'Moderate' : 'Developing',
        competitionRating: compScore >= 75 ? 'Low' : compScore >= 60 ? 'Moderate' : 'High',
        financialFitRating: 'Good',
        summary: `Strong demand and ${compScore >= 75 ? 'favorable' : 'manageable'} competitive presence in this 10 km area.`
      })
    } catch (err) {
      console.warn(`[OpportunityEngine] Error evaluating ${candidate}:`, err.message)
    }
  }

  return evaluated.sort((a, b) => b.feasibilityScore - a.feasibilityScore).slice(0, 3)
}

/**
 * Generates rule-based actionable improvements from score weaknesses.
 * @param {Object} scores
 * @param {number} scores.demandScore
 * @param {number} scores.competitionScore
 * @param {number} scores.financialScore
 * @param {number} scores.riskScore
 * @returns {Array<{ factor: string, recommendation: string }>}
 */
export function generateActionableImprovements(scores = {}) {
  const recommendations = []

  if (scores.competitionScore !== null && scores.competitionScore < 70) {
    recommendations.push({
      factor: 'High Local Competition',
      recommendation:
        'Consider differentiating through home delivery, extended evening hours, digital UPI payments, or carrying high-margin specialty items not stocked by nearby competitors.'
    })
  }

  if (scores.demandScore !== null && scores.demandScore < 65) {
    recommendations.push({
      factor: 'Moderate Addressable Demand',
      recommendation:
        'Consider starting with a leaner initial inventory setup or exploring weekly market (Haat) routes in adjacent villages to expand your customer base.'
    })
  }

  if (scores.financialScore !== null && scores.financialScore < 75) {
    recommendations.push({
      factor: 'Financing Alignment',
      recommendation:
        'Increase your own contribution or apply for capital subsidies available under government corporation schemes to lower your monthly repayment burden.'
    })
  }

  if (scores.riskScore !== null && scores.riskScore < 70) {
    recommendations.push({
      factor: 'Seasonal & Operational Risks',
      recommendation:
        'Establish direct credit lines with multiple distributors and maintain a 45-day working capital buffer for lean seasonal periods.'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      factor: 'Strong Operational Foundation',
      recommendation:
        'Maintain accurate daily bookkeeping and secure favorable channel-partner lending terms before launching.'
    })
  }

  return recommendations
}
