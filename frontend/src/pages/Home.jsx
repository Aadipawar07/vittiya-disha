// Landing page with hero, problem section, features, CTA
import ScoreOrb from '../components/ScoreOrb'
import ConfidenceTag from '../components/ConfidenceTag'

export default function Home() {
  return (
    <div className="grid-bg-fine">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="blob w-[420px] h-[420px] bg-saffron -top-32 -left-32"></div>
        <div className="blob w-[360px] h-[360px] bg-gold top-40 -right-24"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10 relative">
          {/* Stamp */}
          <div className="flex justify-center mb-10 reveal">
            <div className="stamp px-4 py-2 rounded-full text-saffronDeep font-mono text-xs font-semibold">
              PS 26091 · MOSJE · SIH 2026
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Heading and description */}
            <div className="reveal">
              <h1 className="font-display text-5xl lg:text-6xl font-semibold leading-tight mb-6">
                Know if it'll <span className="text-saffron">work</span> — before you <span className="text-maroon">borrow</span>.
              </h1>
              <p className="text-lg text-inkSoft mb-10 leading-relaxed max-w-lg">
                A pre-loan decision-intelligence assistant for rural entrepreneurs — correct scheme routing across NSFDC / NBCFDC / NSKFDC, real financial structuring, and a feasibility score you can see the maths behind.
              </p>
              <div className="flex gap-4 flex-wrap">
                <button className="btn-primary text-beige font-bold px-8 py-4 rounded-full">
                  Start My Assessment →
                </button>
                <button className="btn-ghost border-2 border-ink/20 font-bold px-8 py-4 rounded-full">
                  I'm a Field Officer
                </button>
              </div>
            </div>

            {/* Right: ScoreOrb with callouts */}
            <div className="hero-orb-stage flex justify-center items-center relative reveal">
              <div className="hero-orb-wrap relative">
                <ScoreOrb score={78} state="go" size="large" />
                
                {/* Verdict callout */}
                <div className="hero-verdict absolute bg-beige border-2 border-ink rounded-2xl px-5 py-4 shadow-lg">
                  <p className="text-sm text-inkSoft font-mono mb-1">Verdict</p>
                  <p className="text-xl font-bold text-go"><span className="mr-2">✅</span>GO</p>
                </div>

                {/* Scheme callout */}
                <div className="hero-scheme absolute bg-beige border-2 border-ink rounded-2xl px-5 py-4 shadow-lg">
                  <p className="text-sm text-inkSoft font-mono mb-1">Scheme matched</p>
                  <p className="text-lg font-bold text-ink whitespace-nowrap">NSFDC · Term Loan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y-2 border-ink bg-ink text-beige py-4 overflow-hidden">
        <div className="marquee-track font-mono text-sm font-semibold tracking-wide">
          <span className="px-8">₹1,389 CR DISBURSED VIA PM-SURAJ FY24-25</span>
          <span className="px-8 text-saffronLight">·</span>
          <span className="px-8">3 APEX CORPORATIONS, 3 RATE CARDS — ONLY WE ROUTE CORRECTLY</span>
          <span className="px-8 text-saffronLight">·</span>
          <span className="px-8">0 NUMBERS EVER INVENTED BY AI</span>
          <span className="px-8 text-saffronLight">·</span>
          <span className="px-8">₹1,389 CR DISBURSED VIA PM-SURAJ FY24-25</span>
          <span className="px-8 text-saffronLight">·</span>
          <span className="px-8">3 APEX CORPORATIONS, 3 RATE CARDS — ONLY WE ROUTE CORRECTLY</span>
          <span className="px-8 text-saffronLight">·</span>
          <span className="px-8">0 NUMBERS EVER INVENTED BY AI</span>
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <p className="uppercase tracking-[0.3em] text-xs font-bold text-saffronDeep mb-4 text-center reveal">The Problem</p>
        <h2 className="font-display text-4xl font-semibold text-center max-w-2xl mx-auto mb-16 reveal">
          Government gives the loan. Nobody checks if the business survives it.
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Without us card */}
          <div className="bg-beigeCard border-2 border-maroon/30 rounded-3xl p-10 bracket card-hover reveal">
            <p className="text-sm font-bold text-maroon mb-6 flex items-center gap-2">
              <span className="text-xl">✕</span> TODAY, WITHOUT US
            </p>
            <ul className="space-y-4 text-sm text-inkSoft">
              <li className="flex gap-3">
                <span className="text-maroon font-bold mt-1">—</span>
                <span>Beneficiary picks a business based on a neighbour's anecdote, not local demand</span>
              </li>
              <li className="flex gap-3">
                <span className="text-maroon font-bold mt-1">—</span>
                <span>Doesn't know if NSFDC, NBCFDC or NSKFDC even applies to them</span>
              </li>
              <li className="flex gap-3">
                <span className="text-maroon font-bold mt-1">—</span>
                <span>No idea what the EMI actually costs until after the loan is sanctioned</span>
              </li>
              <li className="flex gap-3">
                <span className="text-maroon font-bold mt-1">—</span>
                <span>Business stagnates. Loan becomes a burden, not a lift.</span>
              </li>
            </ul>
          </div>

          {/* With us card */}
          <div className="bg-ink text-beige rounded-3xl p-10 bracket card-hover reveal grid-bg">
            <p className="text-sm font-bold text-saffronLight mb-6 flex items-center gap-2">
              <span className="text-xl">✓</span> WITH VITTIYA DISHA
            </p>
            <ul className="space-y-4 text-sm text-beige/80">
              <li className="flex gap-3">
                <span className="text-saffronLight font-bold mt-1">→</span>
                <span>Feasibility scored against real local competitor data, before deciding</span>
              </li>
              <li className="flex gap-3">
                <span className="text-saffronLight font-bold mt-1">→</span>
                <span>Correct corporation routed automatically by category — first tool that does this</span>
              </li>
              <li className="flex gap-3">
                <span className="text-saffronLight font-bold mt-1">→</span>
                <span>Exact EMI, tenure and moratorium shown before the application is even filed</span>
              </li>
              <li className="flex gap-3">
                <span className="text-saffronLight font-bold mt-1">→</span>
                <span>A stress-tested, bank-ready decision — walk in prepared, not hopeful</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-beigeCard rounded-3xl p-8 border-2 border-ink/10 bracket card-hover reveal">
            <p className="font-display text-3xl font-bold text-saffronDeep mb-2">3</p>
            <p className="text-sm text-inkSoft">Apex corporations correctly disambiguated — NSFDC, NBCFDC, NSKFDC</p>
          </div>
          <div className="bg-beigeCard rounded-3xl p-8 border-2 border-ink/10 bracket card-hover reveal">
            <p className="font-display text-3xl font-bold text-gold mb-2">₹1,389cr</p>
            <p className="text-sm text-inkSoft">Disbursed via PM-SURAJ FY24-25 — we sit upstream of it, not against it</p>
          </div>
          <div className="bg-beigeCard rounded-3xl p-8 border-2 border-ink/10 bracket card-hover reveal">
            <p className="font-display text-3xl font-bold text-maroon mb-2">0</p>
            <p className="text-sm text-inkSoft">Numbers invented by AI — every rupee comes from a verified formula</p>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-ink text-beige py-28 grid-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <p className="uppercase tracking-[0.3em] text-xs font-bold text-saffronLight mb-4 reveal">The Journey</p>
          <h2 className="font-display text-4xl font-semibold mb-16 max-w-lg reveal">
            Four steps between an idea and a bank-ready decision.
          </h2>
          <div className="grid md:grid-cols-4 gap-10 relative">
            <div className="reveal">
              <p className="text-saffronLight font-mono text-sm font-bold mb-4">01</p>
              <h3 className="font-display text-2xl font-semibold mb-3">Tell us who you are</h3>
              <p className="text-beige/70 text-sm">Category, village, available margin capital, business idea.</p>
            </div>
            <div className="reveal">
              <p className="text-saffronLight font-mono text-sm font-bold mb-4">02</p>
              <h3 className="font-display text-2xl font-semibold mb-3">We route & score</h3>
              <p className="text-beige/70 text-sm">Correct corporation identified. Feasibility scored, explained, never guessed.</p>
            </div>
            <div className="reveal">
              <p className="text-saffronLight font-mono text-sm font-bold mb-4">03</p>
              <h3 className="font-display text-2xl font-semibold mb-3">See the real cost</h3>
              <p className="text-beige/70 text-sm">Project cost, loan, EMI, moratorium — and a stress test before you sign.</p>
            </div>
            <div className="reveal">
              <p className="text-saffronLight font-mono text-sm font-bold mb-4">04</p>
              <h3 className="font-display text-2xl font-semibold mb-3">Walk in prepared</h3>
              <p className="text-beige/70 text-sm">Export a report your SCA officer can act on the same day.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28">
        <p className="uppercase tracking-[0.3em] text-xs font-bold text-saffronDeep mb-4 reveal">What's inside</p>
        <h2 className="font-display text-4xl font-semibold mb-16 max-w-xl reveal">Built to be correct, not just impressive.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-beige border-2 border-ink/10 rounded-3xl p-8 bracket card-hover reveal">
            <div className="w-11 h-11 rounded-full bg-saffron/15 flex items-center justify-center mb-6 text-saffronDeep font-mono font-bold">→</div>
            <h3 className="font-display text-lg font-semibold mb-2">Multi-Corporation Router</h3>
            <p className="text-sm text-inkSoft">NSFDC, NBCFDC and NSKFDC each have different rate cards. We correctly identify which applies to you.</p>
          </div>
          <div className="bg-beige border-2 border-ink/10 rounded-3xl p-8 bracket card-hover reveal">
            <div className="w-11 h-11 rounded-full bg-saffron/15 flex items-center justify-center mb-6 text-saffronDeep font-mono font-bold">₹</div>
            <h3 className="font-display text-lg font-semibold mb-2">Deterministic Financial Engine</h3>
            <p className="text-sm text-inkSoft">Margin, project cost, loan amount, EMI — pure calculation. The AI only ever explains it.</p>
          </div>
          <div className="bg-beige border-2 border-ink/10 rounded-3xl p-8 bracket card-hover reveal">
            <div className="w-11 h-11 rounded-full bg-saffron/15 flex items-center justify-center mb-6 text-saffronDeep font-mono font-bold">◎</div>
            <h3 className="font-display text-lg font-semibold mb-2">Explainable Feasibility Score</h3>
            <p className="text-sm text-inkSoft">Every point of the score is decomposed — demand, competition, capital fit, risk — never a black box.</p>
          </div>
          <div className="bg-beige border-2 border-ink/10 rounded-3xl p-8 bracket card-hover reveal">
            <div className="w-11 h-11 rounded-full bg-saffron/15 flex items-center justify-center mb-6 text-saffronDeep font-mono font-bold">⌖</div>
            <h3 className="font-display text-lg font-semibold mb-2">Real Competitor Mapping</h3>
            <p className="text-sm text-inkSoft">Live nearby-business density, not a generic guess — with confidence labelled when data is sparse.</p>
          </div>
          <div className="bg-beige border-2 border-ink/10 rounded-3xl p-8 bracket card-hover reveal">
            <div className="w-11 h-11 rounded-full bg-saffron/15 flex items-center justify-center mb-6 text-saffronDeep font-mono font-bold">%</div>
            <h3 className="font-display text-lg font-semibold mb-2">Repayment Stress Test</h3>
            <p className="text-sm text-inkSoft">Drag revenue down 20% or 40% and watch your EMI-to-income ratio respond in real time.</p>
          </div>
          <div className="bg-beige border-2 border-ink/10 rounded-3xl p-8 bracket card-hover reveal">
            <div className="w-11 h-11 rounded-full bg-saffron/15 flex items-center justify-center mb-6 text-saffronDeep font-mono font-bold">⇩</div>
            <h3 className="font-display text-lg font-semibold mb-2">Bank-Ready PDF Export</h3>
            <p className="text-sm text-inkSoft">One document your SCA officer can attach straight to the sanction file.</p>
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-28">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-saffronDeep to-maroon text-beige px-10 py-16 md:px-20 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8 reveal grid-bg relative overflow-hidden">
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3 max-w-md">
              Two minutes to a clearer answer than any bank will give you upfront.
            </h2>
            <p className="text-beige/80 max-w-md">No login. No paperwork. Just your village, your capital, and your idea.</p>
          </div>
          <button className="relative shrink-0 bg-beige text-saffronDeep font-bold px-8 py-4 rounded-full hover:-translate-y-1 hover:scale-105 transition-transform shadow-2xl">
            Start My Assessment →
          </button>
        </div>
      </div>
    </div>
  )
}
