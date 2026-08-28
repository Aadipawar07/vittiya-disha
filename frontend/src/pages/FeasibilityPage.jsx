/**
 * FeasibilityPage — /feasibility/:assessmentId
 *
 * Displays the full feasibility analysis result from the backend.
 *
 * CRITICAL RULES:
 * 1. Does NOT calculate any scores — all scores come from the backend
 * 2. Does NOT call Nemotron with "is this business feasible?"
 * 3. null score → "Insufficient data", never "0/100"
 * 4. Confidence is always visible
 * 5. LOW confidence across majority → LocalDataWarning shown near score
 * 6. Financial values come from existing financial engine (via API response)
 *
 * UI States: LOADING | SUCCESS | PARTIAL_DATA | INSUFFICIENT_DATA | ERROR
 */

import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react'
import { useAssessment } from '../hooks/useAssessment'
import { getFeasibilityAnalysis } from '../services/feasibilityApi'
import FeasibilityGauge from '../components/feasibility/FeasibilityGauge.jsx'
import ConfidenceBadge from '../components/feasibility/ConfidenceBadge.jsx'
import LocalDataWarning from '../components/feasibility/LocalDataWarning.jsx'
import FeasibilityComponentCard from '../components/feasibility/FeasibilityComponentCard.jsx'
import WeightedBreakdown from '../components/feasibility/WeightedBreakdown.jsx'
import DataTransparencyPanel from '../components/feasibility/DataTransparencyPanel.jsx'
import FeasibilityDisclaimer from '../components/feasibility/FeasibilityDisclaimer.jsx'
import MarketMap from '../components/market/MarketMap.jsx'
import CompetitorList from '../components/market/CompetitorList.jsx'
import PopulationCard from '../components/market/PopulationCard.jsx'
import DemandCalculationCard from '../components/market/DemandCalculationCard.jsx'
import AlternativeBusinesses from '../components/market/AlternativeBusinesses.jsx'
import ActionableImprovements from '../components/market/ActionableImprovements.jsx'
import RepaymentStressTest from '../components/stress/RepaymentStressTest.jsx'
import RiskSection from '../components/risk/RiskSection.jsx'

// ─── Loading messages — cycle through these during analysis ─────────────────
const LOADING_MESSAGES = [
  'Analyzing local business feasibility…',
  'Checking available local data…',
  'Evaluating financial fit…',
  'Assessing market competition…',
  'Preparing your assessment…'
]

function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 1800)
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <div className="assessment-page grid-bg-fine flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6 py-24">
        {/* Animated ring */}
        <div className="relative w-20 h-20 mx-auto mb-8" aria-hidden="true">
          <svg viewBox="0 0 80 80" className="w-full h-full animate-spin" style={{ animationDuration: '2.4s' }}>
            <circle cx="40" cy="40" r="32" fill="none" stroke="#E3D2AC" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="32"
              fill="none" stroke="#E8762C" strokeWidth="6"
              strokeDasharray="60 140"
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
        </div>
        <p className="font-display text-2xl font-semibold mb-3">Calculating feasibility</p>
        <p
          className="text-inkSoft font-mono text-sm transition-opacity duration-500"
          aria-live="polite"
          aria-atomic="true"
        >
          {LOADING_MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  )
}

// ─── Error State ────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="assessment-page grid-bg-fine">
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="eyebrow">Error</p>
        <h1 className="font-display text-4xl font-semibold mb-4">
          Could not load feasibility analysis
        </h1>
        <p className="text-inkSoft max-w-lg mx-auto mb-8">
          {message ?? 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetry}
            className="btn-primary text-beige font-bold px-7 py-3 rounded-full inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try again
          </button>
          <Link
            to="/start-assessment"
            className="btn-ghost border-2 border-ink/20 font-bold px-7 py-3 rounded-full"
          >
            ← Back to assessment
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Location context display ────────────────────────────────────────────────
function LocationContext({ location }) {
  if (!location) return null
  const { village, block, district, state, dataCoverage } = location

  const DATA_COVERAGE_LABELS = {
    VILLAGE: 'Village-level data',
    BLOCK: 'Block-level estimate',
    DISTRICT: 'District-level proxy',
    INSUFFICIENT: 'Limited data coverage'
  }

  const coverageLabel = DATA_COVERAGE_LABELS[dataCoverage] ?? dataCoverage

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-inkSoft">
      <span>
        <span className="font-semibold text-ink">
          {[village, block, district, state].filter(Boolean).join(', ')}
        </span>
      </span>
      {coverageLabel && (
        <>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-xs bg-beigeDeep rounded px-2 py-0.5">{coverageLabel}</span>
        </>
      )}
    </div>
  )
}

// ─── Hero section ────────────────────────────────────────────────────────────
function FeasibilityHero({ result }) {
  const {
    overallScore,
    label,
    confidence,
    warning,
    location,
    components
  } = result

  // Show warning if backend provides one or overall confidence is LOW
  const showWarning = Boolean(
    warning ||
    confidence === 'LOW' ||
    Object.values(components ?? {}).filter((c) => c?.confidence === 'LOW').length >= 3
  )

  return (
    <header className="assessment-panel mb-8">
      <p className="eyebrow">Business Feasibility</p>

      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
        {/* Left: text + confidence */}
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-3">
            Your estimated feasibility
          </h1>
          <p className="text-inkSoft mb-5">
            Based on available local data, competition, financial fit, business risk
            and your self-reported execution readiness.
          </p>

          {/* Location */}
          <LocationContext location={location} />

          {/* Overall confidence */}
          <div className="flex items-center gap-3 mt-5">
            <span className="font-mono text-xs text-inkSoft uppercase tracking-wider">Data confidence</span>
            <ConfidenceBadge level={confidence ?? 'MEDIUM'} size="md" />
          </div>

          {/* Score interpretation text */}
          {overallScore !== null && overallScore !== undefined && (
            <p className="text-sm text-inkSoft mt-4 leading-relaxed max-w-lg">
              This score is an indicative assessment based on demand, competition,
              financial fit, business risks and your self-reported execution readiness.
            </p>
          )}
        </div>

        {/* Right: gauge */}
        <div className="flex justify-center md:justify-end pt-2">
          <FeasibilityGauge
            score={overallScore}
            label={label}
            size={180}
          />
        </div>
      </div>

      {/* Warning — near the score per spec */}
      {showWarning && (
        <div className="mt-6">
          <LocalDataWarning warning={warning} show={showWarning} />
        </div>
      )}
    </header>
  )
}

// ─── Five Pillar Cards ───────────────────────────────────────────────────────
const PILLARS = [
  { key: 'demandFit',    title: 'Demand Fit',    icon: '📊' },
  { key: 'competition',  title: 'Competition',   icon: '🏪' },
  { key: 'financialFit', title: 'Financial Fit', icon: '💰' },
  { key: 'risk',         title: 'Risk',          icon: '⚠️' },
  { key: 'executionFit', title: 'Execution Fit', icon: '🤝' }
]

function FeasibilityBreakdown({ components }) {
  const availableCount = Object.values(components ?? {}).filter((c) => c?.score !== null).length
  const hasPartialData = availableCount < 5 && availableCount > 0

  return (
    <section aria-labelledby="breakdown-heading">
      <p className="result-note mb-1">FIVE-PILLAR BREAKDOWN</p>
      <h2 id="breakdown-heading" className="font-display text-3xl font-semibold mb-3">
        What's driving your score?
      </h2>

      {hasPartialData && (
        <div className="mb-5 rounded-xl border border-gold/30 bg-gold/8 px-4 py-3 text-sm text-inkSoft">
          <strong className="text-ink">Some local data was unavailable.</strong>{' '}
          Results are based on the available evidence. Missing components are shown as "Insufficient data".
        </div>
      )}

      <div className="space-y-4 mt-6">
        {PILLARS.map(({ key, title, icon }) => (
          <FeasibilityComponentCard
            key={key}
            componentKey={key}
            title={title}
            icon={icon}
            component={components?.[key]}
          />
        ))}
      </div>
    </section>
  )
}

// ─── Why this score ──────────────────────────────────────────────────────────
function WhyThisScore({ whyThisScore }) {
  if (!whyThisScore || whyThisScore.length === 0) return null
  return (
    <section className="result-section result-explanation" aria-labelledby="why-heading">
      <p className="result-note mb-1">EXPLANATION</p>
      <h2 id="why-heading" className="font-display text-2xl font-semibold mb-5">Why did we give this score?</h2>
      <ul className="space-y-3">
        {whyThisScore.map((point, i) => (
          <li key={i} className="flex gap-3 text-sm text-inkSoft leading-relaxed">
            <span className="text-saffronDeep font-bold mt-0.5" aria-hidden="true">→</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Recommendation ──────────────────────────────────────────────────────────
function Recommendation({ text }) {
  if (!text) return null
  return (
    <section className="result-section" aria-labelledby="recommendation-heading">
      <p className="result-note mb-1">WHAT DOES THIS MEAN?</p>
      <h2 id="recommendation-heading" className="font-display text-2xl font-semibold mb-4">Summary</h2>
      <p className="text-inkSoft leading-relaxed">{text}</p>
    </section>
  )
}

// ─── Action buttons ───────────────────────────────────────────────────────────
function ActionButtons({ schemeCode }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8">
      {schemeCode && schemeCode !== 'unavailable' && (
        <Link
          to={`/scheme-results/${schemeCode}`}
          className="btn-primary text-beige font-bold px-7 py-3 rounded-full inline-flex items-center gap-2"
          id="view-financing-btn"
        >
          <ExternalLink size={16} aria-hidden="true" />
          View Financing Options
        </Link>
      )}
      <Link
        to="/start-assessment"
        className="btn-ghost border-2 border-ink/20 font-bold px-7 py-3 rounded-full"
        id="review-assessment-btn"
      >
        ← Review Assessment
      </Link>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FeasibilityPage() {
  const { assessmentId } = useParams()
  const { assessment, assessmentResult, feasibilityResult, setFeasibilityResult } = useAssessment()
  const [uiState, setUiState] = useState('LOADING')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState(feasibilityResult ?? null)
  const hasFetched = useRef(false)

  // Build the payload for the feasibility API from existing assessment context
  const buildPayload = () => {
    const profile = assessment?.profile ?? {}
    const business = assessment?.business ?? {}
    const financial = assessment?.financial ?? {}
    const execution = assessment?.execution ?? {}
    const loc = assessment?.location ?? {}
    const assessmentFinancial = assessmentResult?.financial ?? assessmentResult?.financing ?? {}

    return {
      businessType: business.businessType ?? 'unknown',
      location: {
        // Prefer precise coordinates from location picker / geocoder
        latitude: loc.latitude ?? null,
        longitude: loc.longitude ?? null,
        village: loc.village ?? profile.village ?? null,
        block: loc.block ?? profile.block ?? null,
        district: loc.district ?? profile.district ?? null,
        state: loc.state ?? profile.state ?? null,
        locationSource: loc.locationSource ?? null,
        pincode: loc.pincode ?? null
      },
      financial: {
        projectRequirement: Number(financial.requestedAmount) || Number(assessmentFinancial?.requestedLoan) || 0,
        eligibleLoan: Number(assessmentFinancial?.eligible_loan) || Number(assessmentFinancial?.eligibleLoan) || 0,
        ownContribution: Number(financial.ownContribution) || 0,
        // Use || (not ??) so empty strings are treated as 0
        // Fallback chain: assessment context → assessmentResult financial → assessmentResult top-level
        expectedMonthlyIncome:
          Number(financial.expectedMonthlyIncome) ||
          Number(assessmentResult?.financial?.expectedMonthlyIncome) ||
          Number(assessmentResult?.expectedMonthlyIncome) ||
          0,
        singleBuyerDependency: financial.singleBuyerDependency ?? null
      },
      userInputs: {
        singleBuyerDependency: financial.singleBuyerDependency ?? null
      },
      execution: {
        experience: execution.experience ?? null,
        training: execution.training ?? null,
        readiness: execution.readiness ?? null
      }
    }
  }

  const load = async () => {
    setUiState('LOADING')
    setErrorMsg('')
    try {
      const data = await getFeasibilityAnalysis(assessmentId, buildPayload())
      setResult(data)
      setFeasibilityResult(data)

      // Determine state
      const components = data?.components ?? {}
      const available = Object.values(components).filter((c) => c?.score !== null)
      if (data?.overallScore === null && data?.confidence === 'INSUFFICIENT_DATA') {
        setUiState('INSUFFICIENT_DATA')
      } else if (available.length < 5) {
        setUiState('PARTIAL_DATA')
      } else {
        setUiState('SUCCESS')
      }
    } catch (err) {
      setErrorMsg(err?.message ?? 'An unexpected error occurred.')
      setUiState('ERROR')
    }
  }

  useEffect(() => {
    if (feasibilityResult && !hasFetched.current) {
      // Detect a stale cached result: repaymentStress is unavailable but the user
      // clearly entered an expectedMonthlyIncome. This means the previous fetch
      // sent income=0 due to the now-fixed ?? vs || bug. Force a fresh fetch.
      const cachedStressBroken =
        feasibilityResult.repaymentStress?.status === 'INSUFFICIENT_DATA' &&
        (Number(assessment?.financial?.expectedMonthlyIncome) > 0 ||
         Number(feasibilityResult.userFinancialInputs?.expectedMonthlyIncome) > 0)

      if (!cachedStressBroken) {
        // Cache is valid — use it
        setResult(feasibilityResult)
        setUiState('SUCCESS')
        hasFetched.current = true
        return
      }
      // Cache is stale — fall through to load() below
    }
    if (!hasFetched.current) {
      hasFetched.current = true
      load()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── State: LOADING ──────────────────────────────────────────────────────────
  if (uiState === 'LOADING') return <LoadingState />

  // ── State: ERROR ────────────────────────────────────────────────────────────
  if (uiState === 'ERROR') return <ErrorState message={errorMsg} onRetry={load} />

  // ── State: no result ────────────────────────────────────────────────────────
  if (!result) {
    return (
      <div className="assessment-page grid-bg-fine">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="eyebrow">Feasibility Analysis</p>
          <h1 className="font-display text-4xl font-semibold mb-4">No assessment data found</h1>
          <p className="text-inkSoft max-w-lg mx-auto mb-8">
            Please complete the assessment first to receive your feasibility analysis.
          </p>
          <Link
            to="/start-assessment"
            className="btn-primary inline-block text-beige font-bold px-7 py-3 rounded-full"
          >
            Start Assessment →
          </Link>
        </div>
      </div>
    )
  }

  // ── State: SUCCESS / PARTIAL_DATA / INSUFFICIENT_DATA ──────────────────────
  const schemeCode =
    assessmentResult?.recommendation?.scheme_code ??
    assessmentResult?.scheme?.schemeId ??
    null

  return (
    <div className="assessment-page grid-bg-fine">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10 md:py-16">

        {/* Back navigation */}
        <div className="flex items-center justify-between mb-10">
          <Link
            to={schemeCode ? `/scheme-results/${schemeCode}` : '/start-assessment'}
            className="text-sm font-semibold text-inkSoft hover:text-saffron flex items-center gap-2"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to scheme results
          </Link>
          <span className="font-mono text-xs text-inkSoft">INDICATIVE · NOT APPROVED</span>
        </div>

        {/* PARTIAL / INSUFFICIENT banner */}
        {uiState === 'INSUFFICIENT_DATA' && (
          <div
            className="mb-6 rounded-2xl border-2 border-ink/15 bg-beigeCard p-5 text-center"
            role="alert"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-inkSoft mb-2">Insufficient data</p>
            <p className="font-display text-xl font-semibold">Not enough reliable data to produce a full assessment</p>
            <p className="text-sm text-inkSoft mt-2">
              Partial results are shown below where data is available.
            </p>
          </div>
        )}

        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <FeasibilityHero result={result} />

        {/* ── FIVE PILLAR BREAKDOWN ──────────────────────────────────────────── */}
        <FeasibilityBreakdown components={result.components} />

        {/* ── WHY THIS SCORE ─────────────────────────────────────────────────── */}
        <div className="mt-6">
          <WhyThisScore whyThisScore={result.whyThisScore} />
        </div>

        {/* ── WEIGHTED BREAKDOWN / METHODOLOGY ───────────────────────────────── */}
        <div className="mt-6">
          <WeightedBreakdown
            components={result.components}
            overallScore={result.overallScore}
          />
        </div>

        {/* ── DATA TRANSPARENCY ──────────────────────────────────────────────── */}
        <div className="mt-6">
          <DataTransparencyPanel components={result.components} />
        </div>

        {/* ── RECOMMENDATION ─────────────────────────────────────────────────── */}
        <div className="mt-6">
          <Recommendation text={result.recommendation} />
        </div>

        {/* ── MARKET INTELLIGENCE SECTIONS ───────────────────────────────────── */}
        {result.market && (
          <div className="mt-10 space-y-8" id="market-intelligence">
            <div className="flex items-center gap-4 pt-4 border-t-2 border-ink/10">
              <h2 className="font-display text-3xl font-semibold">Market Intelligence</h2>
              <span className="font-mono text-xs text-inkSoft border border-line rounded px-2.5 py-1">10 km Radius Analysis</span>
            </div>

            {/* Interactive Market Map */}
            {result.market.location?.latitude && (
              <MarketMap
                centerLat={result.market.location.latitude}
                centerLon={result.market.location.longitude}
                businessType={result.market.businessType}
                competitors={result.market.competition?.competitors ?? []}
                radiusKm={10}
                locationName={result.market.location.formattedAddress || result.market.location.village || 'Proposed Location'}
              />
            )}

            {/* Population Demographics */}
            {result.market.population && (
              <PopulationCard population={result.market.population} />
            )}

            {/* Competitor Discovery */}
            {result.market.competition && (
              <CompetitorList
                competitors={result.market.competition.competitors ?? []}
                totalCount={result.market.competition.competitorCount10Km ?? result.market.competition.competitors?.length ?? 0}
                searchRadiusKm={10}
                coverageWarning={result.market.competition.coverageWarning}
                source={result.market.competition.source ?? 'OpenStreetMap / Google Places'}
              />
            )}

            {/* Demand Calculation */}
            {result.market.demand && (
              <DemandCalculationCard demand={result.market.demand} />
            )}

            {/* Alternative Businesses */}
            {result.market.alternatives && result.market.alternatives.length > 0 && (
              <AlternativeBusinesses alternatives={result.market.alternatives} />
            )}

            {/* Actionable Improvements */}
            {result.market.improvements && result.market.improvements.length > 0 && (
              <ActionableImprovements improvements={result.market.improvements} />
            )}
          </div>
        )}

        {/* ── REPAYMENT STRESS TEST ────────────────────────────────────────── */}
        {result.repaymentStress && (
          <div className="mt-10">
            <RepaymentStressTest
              repaymentStress={result.repaymentStress}
              financialContext={result.components?.financialFit?.details}
            />
          </div>
        )}

        {/* ── BUSINESS RISKS SECTION ─────────────────────────────────────────── */}
        {(result.risk || result.components?.risk?.score !== null) && (
          <div className="mt-10">
            <RiskSection
              risk={
                result.risk || {
                  riskScore: result.components?.risk?.score,
                  overallRiskLevel: result.components?.risk?.details?.overallRiskLevel,
                  activeFlagsCount: result.components?.risk?.details?.activeFlagsCount,
                  confidence: result.components?.risk?.confidence,
                  flags: result.components?.risk?.details?.flags || [],
                  activeFlags: result.components?.risk?.details?.activeFlags || [],
                  dataNote: result.components?.risk?.details?.dataNote
                }
              }
            />
          </div>
        )}

        {/* ── ACTION BUTTONS ─────────────────────────────────────────────────── */}
        <ActionButtons schemeCode={schemeCode} />

        {/* ── DISCLAIMER ─────────────────────────────────────────────────────── */}
        <FeasibilityDisclaimer customDisclaimer={result.disclaimer} />

      </div>
    </div>
  )
}
