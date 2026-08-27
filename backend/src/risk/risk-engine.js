/**
 * Risk Engine — Deterministic Business Risk Assessment
 *
 * Evaluates category rules, user-reported dependencies, and market density
 * to compute active risk flags and a deterministic RiskScore (0–100).
 */

import riskRules from './risk-rules.json' with { type: 'json' }
import riskScoreConfig from './risk-score-config.json' with { type: 'json' }
import { RISK_FLAGS, RISK_SEVERITIES, RISK_LEVELS, DATA_SOURCES } from './types.js'

export class RiskEngine {
  constructor() {
    this.rules = riskRules
    this.scoreConfig = riskScoreConfig
  }

  /**
   * Analyzes risk profile for a business and market context.
   * @param {Object} params
   * @param {string} params.businessType - Business category identifier
   * @param {Object} [params.marketContext] - Output from MarketEngine ({ competitionScore, competitorCount10Km, poiConfidence, poiCoverageConfidence })
   * @param {Object} [params.userInputs] - Self-reported flags ({ singleBuyerDependency, contractGuaranteed, seasonalityNotes })
   * @returns {Object} Deterministic risk evaluation
   */
  evaluateRisks({ businessType, marketContext = {}, userInputs = {} }) {
    const normType = String(businessType || 'default').toLowerCase().trim()
    const categoryRule = this.rules[normType] || this.rules.default

    const flags = []

    // 1. Seasonal Demand Risk (Category Rule)
    const seasonalRule = categoryRule.seasonalDemand || {}
    if (seasonalRule.enabled) {
      flags.push({
        flag: RISK_FLAGS.SEASONAL_DEMAND,
        name: 'Seasonal Demand Volatility',
        active: true,
        severity: seasonalRule.severity || RISK_SEVERITIES.MEDIUM,
        confidence: 'HIGH',
        source: DATA_SOURCES.CATEGORY_RULE,
        reason: seasonalRule.reason || 'Revenue varies significantly between peak and off-peak months.',
        mitigation: seasonalRule.mitigation || 'Build operating cash buffers and diversify product offerings during off-peak periods.'
      })
    }

    // 2. Single Buyer Dependency Risk
    const buyerRule = categoryRule.singleBuyerDependency || {}
    const userInputBuyer = userInputs.singleBuyerDependency

    if (userInputBuyer === true || userInputBuyer === 'yes' || userInputBuyer === 'YES') {
      flags.push({
        flag: RISK_FLAGS.SINGLE_BUYER_DEPENDENCY,
        name: 'Single Buyer Concentration',
        active: true,
        severity: buyerRule.defaultSeverity === RISK_SEVERITIES.HIGH ? RISK_SEVERITIES.HIGH : RISK_SEVERITIES.MEDIUM,
        confidence: 'HIGH',
        source: DATA_SOURCES.USER_REPORTED,
        reason: 'You reported that major sales volume depends on a single buyer, cooperative, or institutional contract.',
        mitigation: buyerRule.mitigation || 'Actively onboard additional buyers and negotiate transparent payment settlement terms.'
      })
    } else if (userInputBuyer === 'not_sure' || userInputBuyer === 'NOT_SURE') {
      flags.push({
        flag: RISK_FLAGS.SINGLE_BUYER_DEPENDENCY,
        name: 'Single Buyer Concentration (Unconfirmed)',
        active: true,
        severity: RISK_SEVERITIES.MEDIUM,
        confidence: 'MEDIUM',
        source: DATA_SOURCES.USER_REPORTED,
        reason: 'Single buyer exposure is unconfirmed; customer concentration may pose cash-flow volatility.',
        mitigation: 'Establish a diversified client base before scaling operations.'
      })
    } else if (userInputBuyer === false || userInputBuyer === 'no' || userInputBuyer === 'NO') {
      // User explicitly confirmed no single buyer dependency - do not flag
    } else if (buyerRule.inherentlyExposed) {
      // Category is inherently exposed, but user input is absent
      flags.push({
        flag: RISK_FLAGS.SINGLE_BUYER_DEPENDENCY,
        name: 'Potential Single Buyer Exposure',
        active: true,
        potentialRisk: true,
        severity: buyerRule.defaultSeverity || RISK_SEVERITIES.MEDIUM,
        confidence: 'LOW',
        source: DATA_SOURCES.CATEGORY_RULE,
        reason: buyerRule.reason || 'This business category frequently routes output through single institutional off-takers.',
        mitigation: buyerRule.mitigation || 'Confirm direct retail sales channels and avoid exclusive single-party supply arrangements.'
      })
    }

    // 3. Supply Chain Fragility Risk (Category Rule)
    const supplyRule = categoryRule.supplyChainFragility || {}
    if (supplyRule.enabled) {
      flags.push({
        flag: RISK_FLAGS.SUPPLY_CHAIN_FRAGILITY,
        name: 'Supply Chain & Perishability Fragility',
        active: true,
        severity: supplyRule.severity || RISK_SEVERITIES.HIGH,
        confidence: 'HIGH',
        source: DATA_SOURCES.CATEGORY_RULE,
        reason: supplyRule.reason || 'Business depends on time-sensitive perishable inputs or specialized distribution channels.',
        mitigation: supplyRule.mitigation || 'Establish backup supplier agreements and disciplined daily inventory management.'
      })
    }

    // 4. Competition Density Risk (Derived from Market Engine)
    const compScore = marketContext.competitionScore
    const poiConf = marketContext.poiCoverageConfidence || marketContext.poiConfidence || marketContext.confidence
    const isLowCoverage = poiConf === 'LOW' || poiConf === 'INSUFFICIENT'

    const compThresholds = this.scoreConfig.competitionRiskThresholds

    if (isLowCoverage) {
      // Low POI coverage protection: do NOT flag false high competition, flag data limitation instead
      flags.push({
        flag: RISK_FLAGS.HIGH_COMPETITION_DENSITY,
        name: 'Competition Density (Limited Coverage)',
        active: false,
        severity: RISK_SEVERITIES.LOW,
        confidence: 'LOW',
        source: DATA_SOURCES.MARKET_DATA,
        reason: 'Local business map listings may be incomplete in rural habitations. Low competitor count is not proof of zero competition.',
        mitigation: 'Conduct an in-person physical survey of neighboring village markets before launching.',
        dataWarning: 'Competition data coverage is limited in this location.'
      })
    } else if (compScore !== null && compScore !== undefined) {
      if (compScore < compThresholds.highCompetitionScoreBelow) {
        flags.push({
          flag: RISK_FLAGS.HIGH_COMPETITION_DENSITY,
          name: 'High Competitor Concentration',
          active: true,
          severity: compThresholds.highSeverity || RISK_SEVERITIES.HIGH,
          confidence: 'HIGH',
          source: DATA_SOURCES.MARKET_DATA,
          reason: compThresholds.highReason || `High density of competing businesses detected within 10 km (Competition Score: ${compScore}/100).`,
          mitigation: compThresholds.highMitigation || 'Offer differentiated services, extended hours, digital payment options, or localized value-add.'
        })
      } else if (compScore < compThresholds.moderateCompetitionScoreBelow) {
        flags.push({
          flag: RISK_FLAGS.HIGH_COMPETITION_DENSITY,
          name: 'Moderate Local Competition',
          active: true,
          severity: compThresholds.moderateSeverity || RISK_SEVERITIES.MEDIUM,
          confidence: 'HIGH',
          source: DATA_SOURCES.MARKET_DATA,
          reason: compThresholds.moderateReason || `Moderate competition present within radius (Competition Score: ${compScore}/100).`,
          mitigation: compThresholds.moderateMitigation || 'Maintain consistent product quality, clear pricing, and reliable operating schedules.'
        })
      }
    }

    // Filter active flags for scoring calculation
    const activeFlags = flags.filter((f) => f.active)

    // Calculate deterministic RiskScore (0-100, higher = better/safer)
    let calculatedScore = this.scoreConfig.baseScore // 95
    for (const flag of activeFlags) {
      const penalty = this.scoreConfig.severityPenalties[flag.severity] || 15
      calculatedScore -= penalty
    }

    const riskScore = Math.max(this.scoreConfig.minScore, Math.min(this.scoreConfig.maxScore, calculatedScore))

    // Determine overall risk level
    let overallRiskLevel = RISK_LEVELS.LOW
    const levels = this.scoreConfig.riskLevelThresholds

    if (riskScore >= levels.LOW.minScore) {
      overallRiskLevel = RISK_LEVELS.LOW
    } else if (riskScore >= levels.MEDIUM.minScore) {
      overallRiskLevel = RISK_LEVELS.MEDIUM
    } else if (riskScore >= levels.HIGH.minScore) {
      overallRiskLevel = RISK_LEVELS.HIGH
    } else {
      overallRiskLevel = RISK_LEVELS.CRITICAL
    }

    // Determine overall confidence
    const confidence = isLowCoverage ? 'LOW' : activeFlags.length > 0 ? 'HIGH' : 'MEDIUM'

    return {
      riskScore,
      overallRiskLevel,
      activeFlagsCount: activeFlags.length,
      totalFlagsEvaluated: flags.length,
      confidence,
      flags,
      activeFlags,
      categoryDisplayName: categoryRule.displayName || normType,
      dataNote: 'Business risk flags are derived from deterministic category rules, self-reported dependencies, and geospatial market density.',
      auditTrail: {
        rulesVersion: this.scoreConfig.rulesVersion,
        baseScore: this.scoreConfig.baseScore,
        penaltiesApplied: activeFlags.map((f) => ({ flag: f.flag, severity: f.severity, penalty: this.scoreConfig.severityPenalties[f.severity] || 15 })),
        calculatedAt: new Date().toISOString()
      }
    }
  }
}

export const riskEngine = new RiskEngine()
