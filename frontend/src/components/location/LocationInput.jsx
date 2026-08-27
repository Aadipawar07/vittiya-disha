/**
 * Location Input Component
 *
 * Tabbed selector allowing the applicant to choose between:
 * - Option A: Enter Address Manually
 * - Option B: Select Location on Interactive Map
 */

import { useState } from 'react'
import { Map, Edit3, MapPin } from 'lucide-react'
import ManualAddressForm from './ManualAddressForm.jsx'
import MapLocationPicker from './MapLocationPicker.jsx'
import ConfidenceBadge from '../feasibility/ConfidenceBadge.jsx'

export default function LocationInput({ value = {}, onChange, onConfirmed }) {
  const [tab, setTab] = useState(value.locationSource === 'MAP_SELECTED' ? 'map' : 'manual')

  return (
    <div className="space-y-6">
      {/* Option selector tabs */}
      <div className="flex rounded-xl p-1 bg-beigeDeep border border-line" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'manual'}
          onClick={() => setTab('manual')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            tab === 'manual'
              ? 'bg-beige text-ink shadow-sm border border-ink/10'
              : 'text-inkSoft hover:text-ink'
          }`}
        >
          <Edit3 size={16} />
          Option A: Enter Address
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'map'}
          onClick={() => setTab('map')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            tab === 'map'
              ? 'bg-beige text-ink shadow-sm border border-ink/10'
              : 'text-inkSoft hover:text-ink'
          }`}
        >
          <Map size={16} />
          Option B: Select on Map
        </button>
      </div>

      {/* Form content */}
      <div className="p-6 rounded-2xl border-2 border-ink/10 bg-beigeCard/60">
        {tab === 'manual' ? (
          <ManualAddressForm
            value={value}
            onChange={onChange}
            onConfirmed={onConfirmed}
          />
        ) : (
          <MapLocationPicker
            value={value}
            onChange={onChange}
            onConfirmed={onConfirmed}
          />
        )}
      </div>

      {/* Confirmed Location Summary */}
      {value.latitude && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border-2 border-saffron/30 bg-saffron/5">
          <div className="flex items-start gap-3">
            <MapPin className="text-saffronDeep shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-mono text-xs font-bold text-saffronDeep uppercase tracking-wider">
                Proposed Business Location
              </p>
              <p className="text-sm font-semibold text-ink mt-0.5">
                {value.formattedAddress || `${value.village || ''}, ${value.district || ''}, ${value.state || ''}`}
              </p>
              <p className="font-mono text-xs text-inkSoft mt-1">
                Source: {value.locationSource || 'MANUAL_ADDRESS'} · Coordinates: {Number(value.latitude).toFixed(4)}°N, {Number(value.longitude).toFixed(4)}°E
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-inkSoft">Location confidence:</span>
            <ConfidenceBadge level={value.confidence || 'HIGH'} size="sm" />
          </div>
        </div>
      )}
    </div>
  )
}
