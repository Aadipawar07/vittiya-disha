/**
 * Competitor List Component
 *
 * Displays competitor businesses found within radius with distance, category, and source.
 */

import { Store, AlertTriangle } from 'lucide-react'

export default function CompetitorList({
  competitors = [],
  totalCount = 0,
  searchRadiusKm = 10,
  coverageWarning = null,
  source = 'GOOGLE_PLACES'
}) {
  return (
    <section className="result-section">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <p className="result-note mb-1">COMPETITOR DISCOVERY</p>
          <h2 className="font-display text-2xl font-semibold">
            Competitors Identified ({totalCount})
          </h2>
          <p className="text-sm text-inkSoft mt-1">
            Businesses identified within a {searchRadiusKm} km analysis radius.
          </p>
        </div>

        <span className="font-mono text-xs text-inkSoft border border-line rounded px-2.5 py-1 bg-beigeCard">
          Source: {source}
        </span>
      </div>

      {coverageWarning && (
        <div className="mb-5 flex gap-3 p-4 rounded-xl border border-gold/30 bg-gold/10 text-xs text-inkSoft">
          <AlertTriangle size={18} className="text-gold shrink-0 mt-0.5" />
          <p className="leading-relaxed">{coverageWarning}</p>
        </div>
      )}

      {competitors.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((c, i) => (
            <div
              key={c.placeId || i}
              className="p-4 rounded-2xl border border-line bg-beigeCard/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display text-base font-semibold text-ink leading-snug">
                    {c.name}
                  </h3>
                  <span className="font-mono text-xs text-saffronDeep font-bold shrink-0">
                    {c.distanceKm !== undefined ? `${c.distanceKm} km` : ''}
                  </span>
                </div>

                <p className="text-xs text-inkSoft font-medium capitalize mb-2">
                  {c.category}
                </p>

                <p className="text-xs text-inkSoft leading-relaxed line-clamp-2">
                  {c.address}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-line text-[11px] text-inkSoft">
                {c.rating ? (
                  <span className="font-mono font-semibold text-gold">
                    ★ {c.rating} ({c.userRatingsTotal || 0} reviews)
                  </span>
                ) : (
                  <span className="font-mono">Unrated / Local listing</span>
                )}
                <span className="font-mono text-[10px] uppercase opacity-75">{c.source}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-line bg-beigeCard text-center">
          <p className="text-sm font-semibold text-ink">No local competitor POIs mapped in radius</p>
          <p className="text-xs text-inkSoft mt-1">
            Map coverage may be incomplete in smaller rural habitations.
          </p>
        </div>
      )}

      <p className="text-xs text-inkSoft mt-5">
        Ratings and review counts reflect public map listings only and do not measure business financial health or product quality.
      </p>
    </section>
  )
}
