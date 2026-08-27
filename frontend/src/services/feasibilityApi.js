/**
 * Feasibility API Service
 *
 * Single data-fetching layer for all feasibility-related API calls.
 * Do NOT call the feasibility backend directly from UI components — use this module.
 *
 * The backend is the sole source of truth for all scores, confidence levels,
 * and data derivations. This service only fetches and validates.
 */

import apiClient from './api.js'
import { validateFeasibilityResult } from '../types/feasibility.js'

// ---------------------------------------------------------------------------
// DEV MOCK ONLY — remove or ignore when the real backend is available
// Toggle with VITE_USE_MOCK_API=true in frontend/.env.local
// ---------------------------------------------------------------------------
export const MOCK_FEASIBILITY_RESPONSE = {
  overallScore: 78,
  label: 'Strong feasibility',
  confidence: 'MEDIUM',
  dataLevel: 'BLOCK',
  warning: 'Insufficient local data for this village — showing block-level estimate.',
  location: {
    village: 'Savkheda',
    block: 'Jalgaon',
    district: 'Jalgaon',
    state: 'Maharashtra',
    dataCoverage: 'BLOCK'
  },
  components: {
    demandFit: {
      score: 82,
      weight: 0.25,
      confidence: 'MEDIUM',
      dataLevel: 'BLOCK',
      type: 'ESTIMATED',
      explanation: 'Estimated addressable demand appears strong relative to available local population data.',
      details: {
        population: 28450,
        populationDataLevel: 'BLOCK',
        populationNote: 'Potentially stale — use with caution',
        purchasingPowerNote: 'Estimated using district-level per-capita proxy',
        demandBasis: 'Estimated using population-derived addressable demand and category norms.'
      }
    },
    competition: {
      score: 71,
      weight: 0.25,
      confidence: 'HIGH',
      dataLevel: 'VILLAGE',
      type: 'MEASURED',
      explanation: 'Competition is moderate based on available POI data. Competitor count is measurable but depends on data freshness.',
      details: {
        competitorCount: 12,
        searchRadiusKm: 3,
        dataSource: 'POI / local business data',
        limitation: 'POI coverage may not include every local informal business.'
      }
    },
    financialFit: {
      score: 88,
      weight: 0.20,
      confidence: 'HIGH',
      dataLevel: 'CALCULATED',
      type: 'CALCULATED',
      explanation: 'Financial fit is strong because the estimated financing requirement is within the applicable scheme\'s financing capacity.',
      details: {
        projectRequirement: 800000,
        eligibleLoan: 720000,
        ownContribution: 80000,
        schemeFinancingPercent: 90,
        repaymentBurdenRatio: 28,
        financialBasis: 'Financial fit reflects how comfortably the proposed financing aligns with the available scheme support and repayment burden.'
      }
    },
    risk: {
      score: 63,
      weight: 0.15,
      confidence: 'LOW',
      dataLevel: 'CATEGORY_RULE',
      type: 'ESTIMATED',
      explanation: 'Risk assessment is based on category rules. Insufficient local risk data was available.',
      details: {
        riskFactors: [
          'Seasonal demand may affect revenue consistency.',
          'Supply chain dependency on distributors.',
          'Category-specific operational risks apply.'
        ],
        dataNote: 'Risk flags are derived from backend category rules, not local measurement.'
      }
    },
    executionFit: {
      score: 75,
      weight: 0.15,
      confidence: 'MEDIUM',
      dataLevel: 'USER_REPORTED',
      type: 'USER_REPORTED',
      explanation: 'Execution fit is based on your self-reported experience and readiness.',
      details: {
        experience: '1_to_3_yr',
        training: 'relevant_training',
        inputs: [
          'Relevant experience: 1–3 years',
          'Training: Relevant training completed'
        ],
        note: 'This assessment is based on your responses and has not been independently verified.'
      }
    }
  },
  whyThisScore: [
    'Strong demand potential contributed positively.',
    'Competition is moderate based on available POI data.',
    'Financial fit is strong because the estimated financing requirement is within the applicable scheme\'s financing capacity.',
    'Risk score is lower due to category-specific factors and limited local data.',
    'Execution fit is based on your self-reported experience.'
  ],
  recommendation: 'Your business shows strong feasibility based on the currently available data. Demand and financial fit are positive factors, while competition and category-specific risks should be considered before proceeding.',
  disclaimer: 'This feasibility score is an indicative assessment, not a guarantee of business success, loan approval, income or profitability. Some values may be estimated when village-level data is unavailable.'
}

// MOCK variant with INSUFFICIENT_DATA components (for testing)
export const MOCK_INSUFFICIENT_RESPONSE = {
  ...MOCK_FEASIBILITY_RESPONSE,
  overallScore: null,
  label: 'Insufficient data',
  confidence: 'INSUFFICIENT_DATA',
  dataLevel: 'INSUFFICIENT',
  warning: 'Insufficient local data for this village — showing block-level estimate.',
  components: {
    ...MOCK_FEASIBILITY_RESPONSE.components,
    demandFit: {
      score: null,
      weight: 0.25,
      confidence: 'INSUFFICIENT_DATA',
      dataLevel: 'INSUFFICIENT',
      type: 'ESTIMATED',
      explanation: 'Not enough reliable local data to calculate this component.',
      details: {}
    }
  }
}
// ---------------------------------------------------------------------------
// END DEV MOCK
// ---------------------------------------------------------------------------

/**
 * Fetch the feasibility analysis for a given assessment.
 *
 * @param {string} assessmentId - client-side assessment session ID
 * @param {Object} payload - the assessment context to send to the backend
 * @param {string} payload.businessType
 * @param {Object} payload.location
 * @param {Object} payload.financial
 * @param {Object} payload.execution
 * @returns {Promise<import('../types/feasibility.js').FeasibilityResult>}
 */
export async function getFeasibilityAnalysis(assessmentId, payload) {
  // Development mock path
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(MOCK_FEASIBILITY_RESPONSE), 1800)
    })
  }

  const response = await apiClient.post('/api/feasibility/analyze', {
    assessmentId,
    ...payload
  })

  const data = response.data

  // Validate before returning — surface any contract violations clearly
  const errors = validateFeasibilityResult(data)
  if (errors.length > 0) {
    console.warn('[feasibilityApi] Response validation warnings:', errors)
    // Do not throw — partial data should still render; warnings are logged
  }

  return data
}
