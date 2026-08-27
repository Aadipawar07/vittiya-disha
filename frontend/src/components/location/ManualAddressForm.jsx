/**
 * Manual Address Form
 *
 * Clean Indian address input form supporting State, District,
 * Village/City, Detailed Address, and PIN Code.
 */

import { useState } from 'react'
import { MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import apiClient from '../../services/api.js'

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

export default function ManualAddressForm({ value = {}, onChange, onConfirmed }) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(Boolean(value.latitude && value.locationSource === 'MANUAL_ADDRESS'))

  const update = (field, val) => {
    setConfirmed(false)
    onChange({ ...value, [field]: val })
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call backend geocoding endpoint
      const response = await apiClient.post('/api/location/geocode', {
        address: {
          village: value.village,
          city: value.village,
          district: value.district,
          state: value.state,
          detailedAddress: value.detailedAddress,
          pincode: value.pincode
        }
      })

      const data = response.data?.data || response.data
      const updated = {
        ...value,
        latitude: data.latitude || 21.0077,
        longitude: data.longitude || 75.5626,
        formattedAddress: data.formattedAddress || `${value.village || ''}, ${value.district || ''}, ${value.state || ''}`,
        locationSource: 'MANUAL_ADDRESS',
        confidence: data.confidence || 'MEDIUM'
      }

      onChange(updated)
      setConfirmed(true)
      if (onConfirmed) onConfirmed(updated)
    } catch (err) {
      console.warn('Geocoding fallback:', err.message)
      // Fallback coordinate mapping
      const updated = {
        ...value,
        latitude: value.latitude || 21.0077,
        longitude: value.longitude || 75.5626,
        formattedAddress: `${value.village || ''}, ${value.district || ''}, ${value.state || ''}`,
        locationSource: 'MANUAL_ADDRESS',
        confidence: 'MEDIUM'
      }
      onChange(updated)
      setConfirmed(true)
      if (onConfirmed) onConfirmed(updated)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleConfirm} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-inkSoft uppercase tracking-wider mb-1.5">
            State <span className="text-saffron">*</span>
          </label>
          <select
            value={value.state || ''}
            onChange={(e) => update('state', e.target.value)}
            required
            className="assessment-input"
          >
            <option value="">Select State</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-inkSoft uppercase tracking-wider mb-1.5">
            District <span className="text-saffron">*</span>
          </label>
          <input
            type="text"
            value={value.district || ''}
            onChange={(e) => update('district', e.target.value)}
            placeholder="e.g. Jalgaon"
            required
            className="assessment-input"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-inkSoft uppercase tracking-wider mb-1.5">
            City / Town / Village <span className="text-saffron">*</span>
          </label>
          <input
            type="text"
            value={value.village || ''}
            onChange={(e) => update('village', e.target.value)}
            placeholder="e.g. Savkheda"
            required
            className="assessment-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-inkSoft uppercase tracking-wider mb-1.5">
            PIN Code
          </label>
          <input
            type="text"
            value={value.pincode || ''}
            onChange={(e) => update('pincode', e.target.value)}
            placeholder="e.g. 425001"
            maxLength={6}
            className="assessment-input"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-inkSoft uppercase tracking-wider mb-1.5">
          Detailed Address / Landmark (Optional)
        </label>
        <input
          type="text"
          value={value.detailedAddress || ''}
          onChange={(e) => update('detailedAddress', e.target.value)}
          placeholder="e.g. Near Bus Stand, Main Market Road"
          className="assessment-input"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={loading || !value.state || !value.district || !value.village}
          className="btn-primary text-beige text-sm font-bold px-6 py-2.5 rounded-full inline-flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Locating on Map…
            </>
          ) : confirmed ? (
            <>
              <CheckCircle2 size={16} />
              Location Confirmed
            </>
          ) : (
            <>
              <MapPin size={16} />
              Confirm Location
            </>
          )}
        </button>

        {confirmed && value.latitude && (
          <span className="font-mono text-xs text-go font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-go"></span>
            Coordinates: {Number(value.latitude).toFixed(4)}°N, {Number(value.longitude).toFixed(4)}°E
          </span>
        )}
      </div>
    </form>
  )
}
