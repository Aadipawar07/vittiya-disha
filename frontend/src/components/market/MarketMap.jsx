/**
 * Market Map Component
 *
 * Visualizes the proposed business location, 10 km analysis radius circle,
 * 5 km inner circle, and competitor markers with interactive popups.
 */

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { Store } from 'lucide-react'

// User Location Pin (Saffron)
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      background-color: #B8541A;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 14px rgba(184, 84, 26, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 10px; height: 10px; background-color: #FFFFFF; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28]
})

// Competitor POI Marker (Maroon / Navy)
const competitorIcon = L.divIcon({
  className: 'custom-competitor-marker',
  html: `
    <div style="
      background-color: #9C2B1E;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(156, 43, 30, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: bold;
    ">
      ●
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -10]
})

export default function MarketMap({
  centerLat = 21.0077,
  centerLon = 75.5626,
  businessType = 'grocery_shop',
  competitors = [],
  radiusKm = 10,
  locationName = 'Proposed Location'
}) {
  const center = [Number(centerLat) || 21.0077, Number(centerLon) || 75.5626]

  return (
    <div className="space-y-3">
      <div className="h-[380px] md:h-[440px] rounded-3xl overflow-hidden border-2 border-ink/15 shadow-inner relative z-0">
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 10 km Market Analysis Radius Circle */}
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#E8762C',
              fillColor: '#E8762C',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '6, 6'
            }}
          />

          {/* 5 km Inner Core Radius Circle */}
          <Circle
            center={center}
            radius={5000}
            pathOptions={{
              color: '#2F6B4F',
              fillColor: '#2F6B4F',
              fillOpacity: 0.04,
              weight: 1.5
            }}
          />

          {/* User's Proposed Business Marker */}
          <Marker position={center} icon={userIcon}>
            <Popup className="font-sans text-xs">
              <div className="p-1">
                <strong className="text-saffronDeep font-display text-sm block">Your Proposed Business</strong>
                <p className="font-semibold text-ink mt-0.5">{locationName}</p>
                <p className="text-inkSoft capitalize">{businessType.replace(/_/g, ' ')}</p>
                <p className="font-mono text-[10px] text-inkSoft mt-1">
                  Analysis Center (10 km radius)
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Competitor POI Markers */}
          {competitors.map((c, idx) => {
            if (!c.latitude || !c.longitude) return null
            return (
              <Marker
                key={c.placeId || `comp-${idx}`}
                position={[c.latitude, c.longitude]}
                icon={competitorIcon}
              >
                <Popup className="font-sans text-xs">
                  <div className="p-1">
                    <strong className="text-maroon font-display text-sm block">{c.name}</strong>
                    <p className="text-inkSoft font-semibold">{c.category || 'Competitor'}</p>
                    <p className="text-inkSoft">{c.address}</p>
                    <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-line">
                      <span className="font-mono text-saffronDeep font-bold">
                        {c.distanceKm !== undefined ? `${c.distanceKm} km away` : ''}
                      </span>
                      {c.rating && (
                        <span className="font-mono text-gold font-semibold">
                          ★ {c.rating} ({c.userRatingsTotal || 0})
                        </span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-2xl border border-line bg-beigeCard/70 text-xs text-inkSoft">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-2 font-semibold">
            <span className="w-3.5 h-3.5 rounded-full bg-saffronDeep border border-white inline-block"></span>
            Your Location
          </span>

          <span className="flex items-center gap-2 font-semibold">
            <span className="w-3 h-3 rounded-full bg-maroon border border-white inline-block"></span>
            Competitors ({competitors.length} within 10 km)
          </span>

          <span className="flex items-center gap-2 font-mono">
            <span className="w-4 h-0 border-t-2 border-dashed border-saffron inline-block"></span>
            10 km Market Boundary
          </span>

          <span className="flex items-center gap-2 font-mono">
            <span className="w-4 h-0 border-t-2 border-go inline-block"></span>
            5 km Core Radius
          </span>
        </div>

        <span className="font-mono text-[11px] text-inkSoft">
          OpenStreetMap & Google Places Data
        </span>
      </div>
    </div>
  )
}
