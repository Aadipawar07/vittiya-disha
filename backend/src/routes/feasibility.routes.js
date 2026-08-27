/**
 * Feasibility Routes — /api/feasibility
 *
 * TODO: Wire POST /analyze to the actual feasibility engine.
 *
 * This stub returns a contract-conformant example response so that:
 * 1. The frontend UI can be fully tested before the engine is built
 * 2. Backend developers have a clear, typed response contract to implement against
 *
 * RESPONSE CONTRACT:
 * The response shape below is the agreed API contract between frontend and backend.
 * Do not change field names without updating src/types/feasibility.js in the frontend.
 */

import { Router } from 'express'

const router = Router()

// POST /api/feasibility/analyze
router.post('/analyze', (req, res) => {
  const { businessType, location, financial, execution, assessmentId } = req.body

  // TODO: Replace this stub with actual feasibility engine computation.
  // The engine should implement:
  //   FeasibilityScore = 0.25×DemandFit + 0.25×Competition + 0.20×FinancialFit + 0.15×Risk + 0.15×ExecutionFit
  //
  // Each component must return:
  //   score (0–100 or null), weight (0–1), confidence (HIGH|MEDIUM|LOW|INSUFFICIENT_DATA),
  //   dataLevel (VILLAGE|BLOCK|DISTRICT|STATE|USER_REPORTED|CALCULATED|CATEGORY_RULE|INSUFFICIENT),
  //   type (MEASURED|ESTIMATED|CALCULATED|USER_REPORTED), explanation (string), details (object)

  const stubResponse = {
    overallScore: 78,
    label: 'Strong feasibility',
    confidence: 'MEDIUM',
    dataLevel: 'BLOCK',
    warning: location?.village
      ? `Insufficient local data for this village — showing block-level estimate.`
      : null,
    location: {
      village: location?.village ?? null,
      block: location?.block ?? null,
      district: location?.district ?? null,
      state: location?.state ?? null,
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
          populationNote: 'Potentially stale — sourced from census data',
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
        explanation: 'Competition is moderate based on available POI data.',
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
          projectRequirement: financial?.projectRequirement ?? 800000,
          eligibleLoan: financial?.eligibleLoan ?? 720000,
          ownContribution: financial?.ownContribution ?? 80000,
          schemeFinancingPercent: 90,
          repaymentBurdenRatio: 28,
          financialBasis: 'Financial fit reflects how comfortably the proposed financing aligns with available scheme support.'
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
        score: execution?.experience ? 75 : 60,
        weight: 0.15,
        confidence: 'MEDIUM',
        dataLevel: 'USER_REPORTED',
        type: 'USER_REPORTED',
        explanation: 'Execution fit is based on your self-reported experience and readiness.',
        details: {
          experience: execution?.experience ?? null,
          training: execution?.training ?? null,
          inputs: [
            execution?.experience ? `Relevant experience: ${execution.experience.replace(/_/g, ' ')}` : 'No experience reported',
            execution?.training ? `Training: ${execution.training.replace(/_/g, ' ')}` : 'No training reported'
          ],
          note: 'This assessment is based on your responses and has not been independently verified.'
        }
      }
    },
    whyThisScore: [
      'Strong demand potential contributed positively.',
      'Competition is moderate based on available POI data.',
      `Financial fit is strong because the estimated financing requirement is within the applicable scheme's financing capacity.`,
      'Risk score is lower due to category-specific factors and limited local data.',
      'Execution fit is based on your self-reported experience.'
    ],
    recommendation: 'Your business shows strong feasibility based on the currently available data. Demand and financial fit are positive factors, while competition and category-specific risks should be considered before proceeding.',
    disclaimer: 'This feasibility score is an indicative assessment, not a guarantee of business success, loan approval, income or profitability. Some values may be estimated when village-level data is unavailable.'
  }

  // STUB: artificial delay simulating engine processing
  setTimeout(() => res.json(stubResponse), 800)
})

export default router
