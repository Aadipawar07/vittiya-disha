/**
 * FeasibilityDisclaimer — legal / transparency disclaimer.
 * Always displayed at the bottom of the feasibility page.
 */

export default function FeasibilityDisclaimer({ customDisclaimer }) {
  return (
    <footer className="result-disclaimer mt-6" role="contentinfo">
      <p className="font-semibold text-sm">
        Indicative assessment — not a guarantee
      </p>
      <p className="text-sm mt-2 leading-relaxed">
        {customDisclaimer ??
          'This feasibility score is an indicative assessment, not a guarantee of business success, ' +
          'loan approval, income or profitability.'}
      </p>
      <p className="text-sm mt-2 leading-relaxed">
        Some values may be estimated when village-level data is unavailable. The score reflects
        available data at the time of assessment and may change as better local data becomes available.
        Final business and financial decisions should be made with professional guidance.
      </p>
    </footer>
  )
}
