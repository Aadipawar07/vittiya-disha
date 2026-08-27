import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
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

function ListSection({ icon, title: sectionTitle, items, empty = 'None recorded' }) {
  return <section className="result-section"><div className="flex items-center gap-3 mb-5">{icon}<h2 className="font-display text-2xl font-semibold">{sectionTitle}</h2></div>{items?.length ? <ul className="space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm text-inkSoft"><span className="text-saffronDeep font-bold">{sectionTitle === 'Passed checks' ? '✓' : '→'}</span><span>{typeof item === 'string' ? item : `${item.rule || item.rule_id}: ${item.result}`}</span></li>)}</ul> : <p className="text-sm text-inkSoft">{empty}</p>}</section>
}

export default function SchemeResults() {
  const { schemeCode } = useParams()
  const { assessmentResult } = useAssessment()
  const result = assessmentResult
  const recommendation = result?.recommendation
  const financial = result?.financial
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
  const alternatives = result.alternatives || []
  const rate = interest?.rate !== undefined ? `${interest.rate}%` : interest?.rate_min !== undefined ? `${interest.rate_min}%–${interest.rate_max}%` : 'Not available'

  return <div className="assessment-page grid-bg-fine"><div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 md:py-16">
    <div className="flex items-center justify-between mb-12"><Link to="/start-assessment" className="text-sm font-semibold text-inkSoft hover:text-saffron flex items-center gap-2"><ArrowLeft size={16} /> Back to assessment</Link><span className="font-mono text-xs text-inkSoft">ENGINE {result.engine_version || '1.0.0'}</span></div>
    <header className="max-w-4xl mb-10"><p className="eyebrow">Scheme Results</p><div className="flex flex-col md:flex-row md:items-end justify-between gap-6"><div><p className="font-mono text-sm text-saffronDeep mb-3">{result.corporation} / {recommendation.scheme_code}</p><h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight">{recommendation.scheme_name}</h1><p className="text-lg text-inkSoft mt-4 max-w-2xl">{explanation.summary || 'Your structured assessment has been evaluated by the deterministic scheme engine.'}</p></div><div className="result-score"><span className="font-mono text-4xl font-bold">{recommendation.match_score}</span><span className="font-mono text-xs text-inkSoft">MATCH SCORE</span></div></div></header>
    <StatusPanel status={recommendation.status} />
    <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6 mt-6"><section className="result-section"><div className="flex items-center justify-between gap-4 mb-5"><div className="flex items-center gap-3"><ShieldCheck className="text-saffronDeep" size={24} /><h2 className="font-display text-2xl font-semibold">Financial picture</h2></div><span className="result-note">ESTIMATE</span></div><div className="grid sm:grid-cols-2 gap-px bg-line border border-line"><Metric label="Requested loan" value={money(financial?.requested_loan)} /><Metric label="Eligible loan" value={money(financial?.eligible_loan)} accent="text-saffronDeep" /><Metric label="Required own contribution" value={money(financial?.required_own_contribution)} /><Metric label="Estimated EMI" value={money(emi?.emi)} /></div><div className="grid sm:grid-cols-3 gap-6 mt-8"><div><p className="text-xs text-inkSoft uppercase tracking-wider">Interest</p><p className="font-mono font-semibold mt-2">{rate} <span className="text-xs font-normal">annual</span></p></div><div><p className="text-xs text-inkSoft uppercase tracking-wider">Tenure</p><p className="font-mono font-semibold mt-2">{repayment?.tenure_years || 'Not available'} years</p></div><div><p className="text-xs text-inkSoft uppercase tracking-wider">Moratorium</p><p className="font-mono font-semibold mt-2">{repayment?.moratorium_months || 0} months</p></div></div><p className="text-xs text-inkSoft mt-8 border-t border-line pt-4">EMI is an estimated calculation, not an official repayment schedule. Estimated total repayment: {money(emi?.total_repayment)}.</p></section><aside className="result-section result-explanation"><p className="result-note mb-4">WHY THIS MATCHED</p><ul className="space-y-4">{(explanation.why_this_scheme || []).map((item, index) => <li key={index} className="text-sm leading-relaxed">{item}</li>)}</ul></aside></div>
    <div className="grid lg:grid-cols-2 gap-6 mt-6"><ListSection icon={<CheckCircle2 className="text-go" size={23} />} title="Passed checks" items={passed} /><ListSection icon={<AlertCircle className="text-saffronDeep" size={23} />} title="Verification required" items={[...(explanation.verification_required || []), ...unknown.map((item) => item.rule)]} empty="No additional verification was flagged by the engine." /></div>
    <section className="result-section mt-6"><div className="flex items-center gap-3 mb-5"><FileText className="text-saffronDeep" size={23} /><h2 className="font-display text-2xl font-semibold">Prepare these documents</h2></div><div className="grid sm:grid-cols-2 gap-3">{(recommendation.required_documents || result.required_documents || ['Identity proof', 'Income/category documents']).map((item) => <div key={item} className="border border-line px-4 py-3 text-sm text-inkSoft">{item}</div>)}</div></section>
    {alternatives.length > 0 && <section className="mt-12"><p className="eyebrow">Other routes evaluated</p><div className="grid md:grid-cols-2 gap-4">{alternatives.slice(0, 4).map((alternative) => <div className="result-alternative" key={alternative.scheme_code}><div><p className="font-display text-xl font-semibold">{alternative.scheme_name}</p><p className="font-mono text-xs text-inkSoft mt-1">{alternative.scheme_code}</p></div><span className="font-mono text-sm">{alternative.status}</span></div>)}</div></section>}
    <footer className="result-disclaimer mt-12"><p className="font-semibold">A decision-support result, not an approval.</p><p className="text-sm mt-1">{result.disclaimer || 'Final eligibility is subject to official verification and channel-partner terms.'}</p></footer>
  </div></div>
}
