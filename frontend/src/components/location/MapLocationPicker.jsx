/**
 * Map Location Picker
 *
 * Interactive Leaflet map allowing the user to pan, zoom, click,
 * and select the exact business location point.
 */

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react'
import apiClient from '../../services/api.js'

// Fix default leaflet marker icon in bundlers
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      background-color: #E8762C;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 14px rgba(232, 118, 44, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: #FFFFFF;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    }
  })

  return position ? <Marker position={position} icon={userIcon} /> : null
}

export default function MapLocationPicker({ value = {}, onChange, onConfirmed }) {
  const defaultLat = value.latitude || 21.0077
  const defaultLon = value.longitude || 75.5626

  const [position, setPosition] = useState([defaultLat, defaultLon])
  const [addressDetails, setAddressDetails] = useState(value.formattedAddress || 'Selected on Map')
  const [loading, setLoading] = useState(false)

  // Reverse geocode when position updates
  useEffect(() => {
    let active = true
    async function reverse() {
      if (!position) return
      setLoading(true)
      try {
        const res = await apiClient.post('/api/location/reverse-geocode', {
          latitude: position[0],
          longitude: position[1]
        })
        const data = res.data?.data || res.data
        if (active) {
          const formatted = data.formattedAddress || `${position[0].toFixed(4)}°N, ${position[1].toFixed(4)}°E`
          setAddressDetails(formatted)

          const updated = {
            ...value,
            latitude: position[0],
            longitude: position[1],
            formattedAddress: formatted,
            village: data.village || value.village || 'Selected Village',
            district: data.district || value.district || 'Selected District',
            state: data.state || value.state || 'Selected State',
            pincode: data.pincode || value.pincode || null,
            locationSource: 'MAP_SELECTED',
            confidence: 'HIGH'
          }
          onChange(updated)
          if (onConfirmed) onConfirmed(updated)
        }
      } catch (err) {
        if (active) {
          const updated = {
            ...value,
            latitude: position[0],
            longitude: position[1],
            formattedAddress: `${position[0].toFixed(4)}°N, ${position[1].toFixed(4)}°E`,
            locationSource: 'MAP_SELECTED',
            confidence: 'HIGH'
          }
          onChange(updated)
          if (onConfirmed) onConfirmed(updated)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    reverse()
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position])

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude])
        },
        () => console.warn('Geolocation access denied')
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={14} className="text-saffronDeep" />
          Click anywhere on the map to place your business pin
        </p>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="text-xs font-semibold text-saffronDeep hover:text-saffron flex items-center gap-1"
        >
          <Navigation size={12} />
          Use GPS Location
        </button>
      </div>

      <div className="h-72 rounded-2xl overflow-hidden border-2 border-ink/15 shadow-inner relative z-0">
        <MapContainer
          center={[defaultLat, defaultLon]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-line bg-beigeCard">
        <div>
          <p className="font-mono text-xs font-semibold text-inkSoft uppercase tracking-wider">
            Selected Point
          </p>
          <p className="text-sm font-semibold text-ink mt-0.5">
            {loading ? 'Reverse geocoding point…' : addressDetails}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-go font-semibold flex items-center gap-1.5 bg-go/10 px-3 py-1.5 rounded-full border border-go/25">
            <CheckCircle2 size={14} />
            {Number(position[0]).toFixed(4)}°N, {Number(position[1]).toFixed(4)}°E (High Precision)
          </span>
        </div>
      </div>
    </div>
  )
}
