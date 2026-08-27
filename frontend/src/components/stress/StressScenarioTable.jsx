/**
 * Stress Scenario Table
 *
 * Tabular comparison of all 4 stress scenarios showing income adjustments,
 * fixed EMI, EMI/Income ratio percentage, and deterministic verdict.
 */

import RepaymentBurdenBadge from './RepaymentBurdenBadge.jsx'

export default function StressScenarioTable({ scenarios = [] }) {
  if (!scenarios || scenarios.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-line bg-beigeCard/70">
      <table className="w-full text-left text-sm font-sans">
        <thead className="bg-beigeDeep/80 border-b-2 border-line text-xs font-mono font-bold text-inkSoft uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Scenario</th>
            <th className="py-3 px-4">Revenue / Income Shift</th>
            <th className="py-3 px-4">Monthly Income</th>
            <th className="py-3 px-4">Monthly EMI</th>
            <th className="py-3 px-4">EMI / Income</th>
            <th className="py-3 px-4 text-right">Verdict</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {scenarios.map((s) => {
            const isExpected = s.scenario === 'EXPECTED'
            return (
              <tr
                key={s.scenario}
                className={`transition-colors ${
                  isExpected ? 'bg-saffron/8 font-medium' : 'hover:bg-beige/60'
                }`}
              >
                <td className="py-3.5 px-4 font-mono font-bold text-ink">
                  {s.label}
                  {isExpected && (
                    <span className="ml-2 text-[10px] uppercase font-mono font-bold text-saffronDeep bg-saffron/15 px-2 py-0.5 rounded">
                      Baseline
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-mono text-inkSoft">
                  {s.adjustmentPercent}
                </td>
                <td className="py-3.5 px-4 font-mono text-ink">
                  ₹{Number(s.monthlyIncome).toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 font-mono text-inkSoft">
                  ₹{Number(s.monthlyEMI).toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-base text-ink">
                  {s.ratioPercent}%
                </td>
                <td className="py-3.5 px-4 text-right">
                  <RepaymentBurdenBadge verdict={s.verdict} size="sm" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
