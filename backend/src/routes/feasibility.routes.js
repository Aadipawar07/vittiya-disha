/**
 * Feasibility Routes — /api/feasibility
 *
 * Orchestrates:
 * 1. Location Engine
 * 2. Market Engine (Competitors + Census Population + Demand)
 * 3. Financial Engine
 * 4. Business Opportunity Engine
 * 5. Deterministic Feasibility Scoring (0.25 Demand + 0.25 Comp + 0.20 Fin + 0.15 Risk + 0.15 Exec)
 */

import { Router } from 'express'
import { marketEngine } from '../market/market-engine.js'
import { riskEngine } from '../risk/risk-engine.js'
import { repaymentStressEngine } from '../risk/repayment-stress-engine.js'
import { CONFIDENCE_LEVELS } from '../market/types.js'

const router = Router()

// POST /api/feasibility/analyze
router.post('/analyze', async (req, res, next) => {
  try {
    const { businessType, location, financial, execution, userInputs, assessmentId } = req.body

    const bType = businessType || 'grocery_shop'
    const locInput = location || {}
    const finInput = financial || {}
    const execInput = execution || {}
    const userInputObj = userInputs || {
      singleBuyerDependency: finInput.singleBuyerDependency ?? locInput.singleBuyerDependency
    }

    // 1. Run Market Engine
    const market = await marketEngine.analyzeMarket({
      businessType: bType,
      location: locInput,
      radiusKm: 10,
      financialContext: finInput
    })

    // 2. Financial Fit & Repayment Stress Testing
    const projectReq = Number(finInput.projectRequirement) || 800000
    const eligibleLoan = Number(finInput.eligibleLoan) || Math.round(projectReq * 0.9)
    const ownContribution = Number(finInput.ownContribution) || Math.round(projectReq * 0.1)
    const schemeFinancingPercent = projectReq > 0 ? Math.round((eligibleLoan / projectReq) * 100) : 90

    const monthlyIncome = Number(finInput.expectedMonthlyIncome) || Number(finInput.monthlyIncome) || Number(req.body.expectedMonthlyIncome) || Number(req.body.monthlyIncome) || 0
    const interestRate = Number(finInput.annualInterestRate || 8.0)
    const tenureMonths = Number(finInput.tenureMonths || 60)

    const stressResult = repaymentStressEngine.runStressTest({
      loanAmount: eligibleLoan,
      annualInterestRate: interestRate,
      tenureMonths: tenureMonths,
      monthlyIncome: monthlyIncome,
      monthlyEMI: finInput.monthlyEMI,
      monthlyExpenses: finInput.monthlyExpenses
    })

    const repaymentBurdenRatio = stressResult.baseRatioPercent || 28

    // Financial Fit Score: combination of financing coverage and debt repayment feasibility
    let baseFinScore = Math.round(schemeFinancingPercent * 0.95)
    if (stressResult.status === 'AVAILABLE' || stressResult.status === 'CALCULATED') {
      if (stressResult.overallVerdict === 'COMFORTABLE') baseFinScore = Math.min(95, baseFinScore + 5)
      else if (stressResult.overallVerdict === 'TIGHT') baseFinScore = Math.max(50, baseFinScore - 10)
      else if (stressResult.overallVerdict === 'HIGH_RISK') baseFinScore = Math.max(40, baseFinScore - 20)
    }
    const financialScore = Math.min(95, Math.max(40, baseFinScore))

    // 3. Risk Component (Evaluated by deterministic RiskEngine)
    const riskResult = riskEngine.evaluateRisks({
      businessType: bType,
      marketContext: {
        competitionScore: market.competition.competitionScore,
        competitorCount10Km: market.competition.competitorCount10Km,
        poiCoverageConfidence: market.competition.confidence
      },
      userInputs: userInputObj
    })

    const riskScore = riskResult.riskScore

    // 4. Execution Fit Component (User-reported)
    let executionScore = 65
    const execInputs = []
    if (execInput.experience) {
      if (execInput.experience === '3_plus_yr') executionScore += 15
      else if (execInput.experience === '1_to_3_yr') executionScore += 10
      else if (execInput.experience === 'less_than_1_yr') executionScore += 5
      execInputs.push(`Relevant experience: ${execInput.experience.replace(/_/g, ' ')}`)
    } else {
      execInputs.push('No formal prior experience reported')
    }

    if (execInput.training) {
      if (execInput.training === 'certification' || execInput.training === 'relevant_training') {
        executionScore += 10
      }
      execInputs.push(`Training: ${execInput.training.replace(/_/g, ' ')}`)
    } else {
      execInputs.push('Self-taught / informal skills')
    }
    executionScore = Math.min(95, executionScore)

    // 5. Deterministic Feasibility Score formula
    // Score = 0.25 * DemandFit + 0.25 * CompetitionScore + 0.20 * FinancialFit + 0.15 * RiskScore + 0.15 * ExecutionFit
    const demandScore = market.demand.demandScore
    const compScore = market.competition.competitionScore || 65

    const overallScore = Math.round(
      0.25 * demandScore +
      0.25 * compScore +
      0.20 * financialScore +
      0.15 * riskScore +
      0.15 * executionScore
    )

    const label =
      overallScore >= 90
        ? 'Very strong feasibility'
        : overallScore >= 75
          ? 'Strong feasibility'
          : overallScore >= 60
            ? 'Good feasibility'
            : overallScore >= 40
              ? 'Moderate feasibility'
              : 'Low feasibility'

    const overallConfidence = market.overallConfidence

    const warning =
      market.population.coverageWarning || market.competition.coverageWarning
        ? 'Insufficient local data for this village — showing block-level estimate.'
        : null

    const responseData = {
      overallScore,
      label,
      confidence: overallConfidence,
      dataLevel: market.population.dataLevel,
      warning,
      location: market.location,
      marketRadiusKm: 10,
      // Echo back user-provided financial inputs so the frontend can recover them from the cached response
      userFinancialInputs: {
        expectedMonthlyIncome: monthlyIncome,
        projectRequirement: projectReq,
        eligibleLoan,
        ownContribution
      },
      components: {
        demandFit: {
          score: demandScore,
          weight: 0.25,
          confidence: market.demand.confidence,
          dataLevel: market.population.dataLevel,
          type: 'ESTIMATED',
          explanation: `Estimated addressable demand appears strong relative to available local population data (${market.population.populationWithinRadius.toLocaleString('en-IN')} in 10 km radius).`,
          details: {
            population: market.population.populationWithinRadius,
            populationDataLevel: market.population.dataLevel,
            populationNote: market.population.freshnessNote,
            purchasingPowerNote: 'Estimated using district-level per-capita proxy',
            demandBasis: 'Estimated using population-derived addressable demand and category norms.',
            auditTrail: market.demand.auditTrail
          }
        },
        competition: {
          score: compScore,
          weight: 0.25,
          confidence: market.competition.confidence,
          dataLevel: market.competition.competitorCount10Km > 0 ? 'VILLAGE' : 'BLOCK',
          type: 'MEASURED',
          explanation: `Found ${market.competition.competitorCount10Km} similar businesses within 10 km radius (${market.competition.competitorCount5Km} within 5 km).`,
          details: {
            competitorCount: market.competition.competitorCount10Km,
            competitorCount5Km: market.competition.competitorCount5Km,
            searchRadiusKm: 10,
            dataSource: `${market.competition.source} POI data`,
            limitation: 'POI coverage may not include every local informal business in rural settlements.',
            competitors: market.competition.competitors
          }
        },
        financialFit: {
          score: financialScore,
          weight: 0.20,
          confidence: CONFIDENCE_LEVELS.HIGH,
          dataLevel: 'CALCULATED',
          type: 'CALCULATED',
          explanation: 'Financial fit is strong because the estimated financing requirement is within the applicable scheme\'s financing capacity.',
          details: {
            projectRequirement: projectReq,
            eligibleLoan,
            ownContribution,
            schemeFinancingPercent,
            repaymentBurdenRatio,
            financialBasis: 'Financial fit reflects how comfortably the proposed financing aligns with available scheme support.'
          }
        },
        risk: {
          score: riskScore,
          weight: 0.15,
          confidence: riskResult.confidence,
          dataLevel: 'CATEGORY_RULE',
          type: 'CALCULATED',
          explanation: `Risk evaluation identified ${riskResult.activeFlagsCount} active category and market risk factors (Overall: ${riskResult.overallRiskLevel} risk).`,
          details: {
            overallRiskLevel: riskResult.overallRiskLevel,
            activeFlagsCount: riskResult.activeFlagsCount,
            flags: riskResult.flags,
            activeFlags: riskResult.activeFlags,
            dataNote: riskResult.dataNote,
            auditTrail: riskResult.auditTrail
          }
        },
        executionFit: {
          score: executionScore,
          weight: 0.15,
          confidence: CONFIDENCE_LEVELS.MEDIUM,
          dataLevel: 'USER_REPORTED',
          type: 'USER_REPORTED',
          explanation: 'Execution fit is based on your self-reported experience and readiness.',
          details: {
            experience: execInput.experience || null,
            training: execInput.training || null,
            inputs: execInputs,
            note: 'This assessment is based on your responses and has not been independently verified.'
          }
        }
      },
      risk: {
        riskScore: riskResult.riskScore,
        overallRiskLevel: riskResult.overallRiskLevel,
        activeFlagsCount: riskResult.activeFlagsCount,
        confidence: riskResult.confidence,
        flags: riskResult.flags,
        activeFlags: riskResult.activeFlags,
        auditTrail: riskResult.auditTrail
      },
      repaymentStress: stressResult,
      market: {
        businessType: bType,
        location: market.location,
        population: market.population,
        competition: market.competition,
        demand: market.demand,
        alternatives: market.opportunity?.alternatives ?? [],
        improvements: market.opportunity?.improvements ?? []
      },
      whyThisScore: [
        `Demand potential (${market.demand.auditTrail?.annualDemandValue?.formatted || 'Strong'}) supports local micro-enterprise viability.`,
        `Identified ${market.competition.competitorCount10Km} competitors within 10 km based on ${market.competition.source} data.`,
        `Repayment burden under expected scenario is ${stressResult.status === 'CALCULATED' ? `${stressResult.baseRatioPercent}% (${stressResult.overallVerdictLabel})` : 'estimated at sustainable levels'}.`,
        `Identified ${riskResult.activeFlagsCount} operational risk flags (${riskResult.overallRiskLevel} overall risk profile).`,
        'Execution fit is based on your self-reported background.'
      ],
      recommendation: `Your proposed ${bType.replace(/_/g, ' ')} shows ${label.toLowerCase()} based on current market, demographic, risk, and repayment stress factors within a 10 km radius.`,
      disclaimer: 'This feasibility score is an indicative assessment, not a guarantee of business success, loan approval, income or profitability. Stress scenarios and risk flags are mathematical simulations and rule-driven indicators.'
    }

    res.json(responseData)
  } catch (err) {
    next(err)
  }
})

export default router
