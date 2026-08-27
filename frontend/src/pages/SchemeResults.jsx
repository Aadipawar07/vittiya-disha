import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, ShieldCheck, TrendingUp } from 'lucide-react'
import { useAssessment } from '../hooks/useAssessment'

const money = (value) => value === undefined || value === null ? 'Not available' : `INR ${Number(value).toLocaleString('en-IN')}`
const title = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

function StatusPanel({ status }) {
  const eligible = status === 'ELIGIBLE'
  const needsVerification = status === 'NEEDS_VERIFICATION'
  return <div className={`result-status ${eligible ? 'result-status-go' : needsVerification ? 'result-status-check' : 'result-status-stop'}`}>
    {eligible ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
    <div><p className="font-mono text-xs tracking-widest">DETERMINISTIC RESULT</p><p className="font-display text-2xl font-semibold mt-1">{title(status)}</p><p className="text-sm mt-1">{eligible ? 'The supplied conditions passed. Official approval is still required.' : needsVerification ? 'Some facts or documents still need official verification.' : 'One or more supplied facts did not meet this route\'s conditions.'}</p></div>
  </div>
}

function Metric({ label, value, accent = '' }) {
  return <div className="result-metric"><p className="font-mono text-xs uppercase tracking-wider text-inkSoft">{label}</p><p className={`font-mono text-xl md:text-2xl font-semibold mt-2 ${accent}`}>{value}</p></div>
}

function FundingBar({ label, amount, total, tone }) {
  const width = total > 0 ? Math.min(100, Math.max(0, amount / total * 100)) : 0
  return <div><div className="flex justify-between gap-4 text-sm mb-2"><span>{label}</span><span className="font-mono">{money(amount)}</span></div><div className="h-3 rounded-full bg-beigeDeep overflow-hidden"><div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} /></div></div>
}

function ListSection({ icon, title: sectionTitle, items, empty = 'None recorded' }) {
  return <section className="result-section"><div className="flex items-center gap-3 mb-5">{icon}<h2 className="font-display text-2xl font-semibold">{sectionTitle}</h2></div>{items?.length ? <ul className="space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm text-inkSoft"><span className="text-saffronDeep font-bold">{sectionTitle === 'Passed checks' ? '✓' : '→'}</span><span>{typeof item === 'string' ? item : `${item.rule || item.rule_id}: ${item.result}`}</span></li>)}</ul> : <p className="text-sm text-inkSoft">{empty}</p>}</section>
}

export default function SchemeResults() {
  const { schemeCode } = useParams()
  const { assessmentResult, assessmentId } = useAssessment()
  const result = assessmentResult
  const recommendation = result?.recommendation || (result?.scheme ? { scheme_code: result.scheme.schemeId, scheme_name: result.scheme.schemeId, status: result.eligibility?.status, match_score: null } : null)
  const financial = result?.financial || result?.financing
  const interest = result?.interest
  const repayment = result?.repayment
  const emi = result?.emi

  if (!result || recommendation?.scheme_code !== schemeCode) {
    return <div className="assessment-page grid-bg-fine"><div className="max-w-3xl mx-auto px-6 py-24 text-center"><p className="eyebrow">Scheme Results</p><h1 className="font-display text-4xl font-semibold mb-4">Your assessment is not loaded</h1><p className="text-inkSoft max-w-lg mx-auto mb-8">Start a new assessment to receive a deterministic recommendation from the scheme engine.</p><Link to="/start-assessment" className="btn-primary inline-block text-beige font-bold px-7 py-3 rounded-full">Start Assessment →</Link></div></div>
  }

  const passed = result.eligibility?.passed || []
  const failed = result.eligibility?.failed || []
  const unknown = result.eligibility?.unknown || []
  const explanation = result.explanation || {}
  const alternatives = result.alternatives || recommendation?.alternatives || []
  const rate = interest?.rate !== undefined && interest.rate !== null ? `${interest.rate}%` : interest?.rate_min !== undefined ? `${interest.rate_min}%–${interest.rate_max}%` : 'Not available'
  const eligibleLoan = financial?.eligible_loan ?? financial?.eligibleLoan
  const requestedLoan = financial?.requested_loan ?? financial?.requestedLoan
  const contribution = financial?.required_own_contribution ?? financial?.beneficiaryContribution
  const setupCost = result.project?.estimatedCost ?? result.business?.estimatedProjectCost
  const lenders = result.lenders || []

  return <div className="assessment-page grid-bg-fine"><div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 md:py-16">
    <div className="flex items-center justify-between mb-12"><Link to="/start-assessment" className="text-sm font-semibold text-inkSoft hover:text-saffron flex items-center gap-2"><ArrowLeft size={16} /> Back to assessment</Link><span className="font-mono text-xs text-inkSoft">ENGINE {result.engine_version || '1.0.0'}</span></div>
    <header className="max-w-4xl mb-10"><p className="eyebrow">Scheme Results</p><div className="flex flex-col md:flex-row md:items-end justify-between gap-6"><div><p className="font-mono text-sm text-saffronDeep mb-3">{result.corporation} / {recommendation.scheme_code}</p><h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight">{recommendation.scheme_name}</h1><p className="text-lg text-inkSoft mt-4 max-w-2xl">{explanation.summary || 'Your structured assessment has been evaluated by the deterministic scheme engine.'}</p></div><div className="result-score"><span className="font-mono text-4xl font-bold">{recommendation.match_score}</span><span className="font-mono text-xs text-inkSoft">MATCH SCORE</span></div></div></header>
    <StatusPanel status={recommendation.status} />
    <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6 mt-6"><section className="result-section"><div className="flex items-center justify-between gap-4 mb-5"><div className="flex items-center gap-3"><ShieldCheck className="text-saffronDeep" size={24} /><h2 className="font-display text-2xl font-semibold">Funding plan</h2></div><span className="result-note">DETERMINISTIC</span></div><div className="grid sm:grid-cols-2 gap-px bg-line border border-line"><Metric label="Estimated setup cost" value={money(setupCost)} /><Metric label="Requested loan" value={money(requestedLoan)} /><Metric label="Estimated eligible loan" value={money(eligibleLoan)} accent="text-saffronDeep" /><Metric label="Estimated own contribution" value={money(contribution)} /><Metric label="Funding gap" value={money(financial?.fundingGap ?? result.fundingGap)} accent={(financial?.fundingGap ?? result.fundingGap) > 0 ? 'text-maroon' : 'text-go'} /><Metric label="Scheme financing capacity" value={money(financial?.schemeFinancingCapacity)} /></div><div className="grid sm:grid-cols-3 gap-6 mt-8"><div><p className="text-xs text-inkSoft uppercase tracking-wider">Interest</p><p className="font-mono font-semibold mt-2">{rate} <span className="text-xs font-normal">annual</span></p></div><div><p className="text-xs text-inkSoft uppercase tracking-wider">Tenure</p><p className="font-mono font-semibold mt-2">{repayment?.tenure_years || repayment?.tenureYears || 'Not available'} years</p></div><div><p className="text-xs text-inkSoft uppercase tracking-wider">Moratorium</p><p className="font-mono font-semibold mt-2">{repayment?.moratorium_months ?? repayment?.moratoriumMonths ?? 0} months</p></div></div>{emi?.emi !== undefined || emi?.amount !== undefined ? <p className="text-xs text-inkSoft mt-8 border-t border-line pt-4">Illustrative EMI: {money(emi.amount ?? emi.emi)}. This is not an official repayment schedule. Estimated total repayment: {money(emi?.total_repayment)}.</p> : <p className="text-xs text-inkSoft mt-8 border-t border-line pt-4">This scheme publishes an interest-rate range. Select a scenario rate with the lender before calculating an illustrative EMI.</p>}</section><aside className="result-section result-explanation"><p className="result-note mb-4">WHY THIS RECOMMENDATION?</p><ul className="space-y-4">{(explanation.why_this_scheme || []).map((item, index) => <li key={index} className="text-sm leading-relaxed">{item}</li>)}</ul><p className="text-sm leading-relaxed mt-5">{explanation.financial_explanation}</p></aside></div>
    <section className="result-section mt-6"><div className="flex items-center gap-3 mb-5"><ShieldCheck className="text-saffronDeep" size={23} /><h2 className="font-display text-2xl font-semibold">How the funding is split</h2></div><div className="space-y-5"><FundingBar label="Scheme financing" amount={eligibleLoan} total={setupCost} tone="bg-saffron" /><FundingBar label="Your contribution" amount={contribution} total={setupCost} tone="bg-go" /></div>{(financial?.fundingGap ?? result.fundingGap) > 0 && <div className="mt-6 border-2 border-maroon/25 bg-maroon/5 rounded-xl px-4 py-3 text-sm text-maroon"><strong>Additional funding required:</strong> {money(financial?.fundingGap ?? result.fundingGap)}. The displayed amount is not an eligibility decision.</div>}<p className="text-xs text-inkSoft mt-5">Funding amounts are estimates from the deterministic engine and may require confirmation with the channel partner.</p></section>
    <div className="grid lg:grid-cols-2 gap-6 mt-6"><ListSection icon={<CheckCircle2 className="text-go" size={23} />} title="Passed checks" items={passed} /><ListSection icon={<AlertCircle className="text-saffronDeep" size={23} />} title="Verification required" items={[...(explanation.verification_required || []), ...unknown.map((item) => item.rule)]} empty="No additional verification was flagged by the engine." /></div>
    <section className="result-section mt-6"><div className="flex items-center gap-3 mb-5"><FileText className="text-saffronDeep" size={23} /><h2 className="font-display text-2xl font-semibold">Prepare these documents</h2></div><div className="grid sm:grid-cols-2 gap-3">{(recommendation.required_documents || result.required_documents || ['Identity proof', 'Income/category documents']).map((item) => <div key={item} className="border border-line px-4 py-3 text-sm text-inkSoft">{item}</div>)}</div></section>
    {result.business?.breakdown && <section className="result-section mt-6"><p className="result-note">ESTIMATED BUSINESS SETUP</p><h2 className="font-display text-2xl font-semibold mt-2 mb-5">Cost breakdown</h2><div className="space-y-3">{Object.entries(result.business.breakdown).map(([key, item]) => <div className="flex justify-between gap-4 text-sm border-b border-line pb-2" key={key}><span className="capitalize text-inkSoft">{key.replaceAll('_', ' ')}</span><span className="font-mono">{money(item.amount)}</span></div>)}<div className="flex justify-between gap-4 font-semibold pt-2"><span>Total planning estimate</span><span className="font-mono">{money(result.business.estimatedProjectCost)}</span></div></div><p className="text-xs text-inkSoft mt-5">Planning estimate only. Component sources and confidence are retained by the backend.</p></section>}
    {lenders.length > 0 && <section className="mt-12"><p className="eyebrow">Where to apply</p><h2 className="font-display text-3xl font-semibold mb-5">District channel partners</h2><div className="grid md:grid-cols-2 gap-4">{lenders.map((lender) => <div className="result-alternative items-start" key={`${lender.partnerName}-${lender.branchAddress}`}><div><p className="font-display text-xl font-semibold">{lender.partnerName}</p><p className="text-sm text-inkSoft mt-1">{lender.partnerType?.replaceAll('_', ' ')}</p><p className="text-sm mt-4">Beneficiary rate: <span className="font-mono">{lender.beneficiaryRate === null ? 'Scheme rate' : `${lender.beneficiaryRate}%`}</span></p><p className="text-sm text-inkSoft mt-2">{lender.branchAddress} · {lender.contactPoint}</p><p className="text-xs text-inkSoft mt-3">Last verified {lender.lastVerifiedDate} · {lender.confidence}</p><p className="text-xs text-inkSoft mt-2">Charges: Contact branch to confirm</p></div></div>)}</div></section>}
    {alternatives.length > 0 && <section className="mt-12"><p className="eyebrow">Other routes evaluated</p><div className="grid md:grid-cols-2 gap-4">{alternatives.slice(0, 4).map((alternative) => <div className="result-alternative" key={alternative.scheme_code}><div><p className="font-display text-xl font-semibold">{alternative.scheme_name}</p><p className="font-mono text-xs text-inkSoft mt-1">{alternative.scheme_code}</p></div><span className="font-mono text-sm">{alternative.status}</span></div>)}</div></section>}
    {/* Feasibility Analysis CTA */}
    <section className="mt-12 rounded-2xl border-2 border-saffron/30 bg-saffron/5 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <TrendingUp className="text-saffronDeep shrink-0 mt-1" size={26} aria-hidden="true" />
          <div>
            <p className="result-note mb-1">NEXT STEP</p>
            <h2 className="font-display text-2xl font-semibold mb-2">Business Feasibility Analysis</h2>
            <p className="text-sm text-inkSoft leading-relaxed max-w-lg">
              Get an indicative feasibility score for your business based on local demand,
              competition, financial fit and your self-reported readiness.
              This is an estimate — not a guarantee of success.
            </p>
          </div>
        </div>
        <Link
          to={`/feasibility/${assessmentId}`}
          className="btn-primary text-beige font-bold px-7 py-3 rounded-full shrink-0 inline-flex items-center gap-2 whitespace-nowrap"
          id="view-feasibility-btn"
        >
          <TrendingUp size={16} aria-hidden="true" />
          View Feasibility Analysis
        </Link>
      </div>
    </section>
    <footer className="result-disclaimer mt-12"><p className="font-semibold">A decision-support result, not an approval.</p><p className="text-sm mt-1">{result.disclaimer || 'Final eligibility is subject to official verification and channel-partner terms.'}</p></footer>
  </div></div>
}

