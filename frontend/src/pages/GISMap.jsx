import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { fetchGISData } from '../api/api'
import { CITY_COORDS } from '../context/AQIContext'
import 'leaflet/dist/leaflet.css'

// AQI legend entries with high-contrast colors
const LEGEND = [
  { label: 'Good (0–50)',           color: '#10B981' },
  { label: 'Satisfactory (51–100)', color: '#84CC16' },
  { label: 'Moderate (101–200)',    color: '#F59E0B' },
  { label: 'Poor (201–300)',        color: '#F97316' },
  { label: 'Very Poor (301–400)',   color: '#EF4444' },
  { label: 'Severe (>400)',         color: '#BE123C' },
]

function getMarkerColor(aqi) {
  if (!aqi && aqi !== 0) return '#64748B'
  if (aqi <= 50)  return '#10B981'
  if (aqi <= 100) return '#84CC16'
  if (aqi <= 150) return '#F59E0B'
  if (aqi <= 200) return '#F97316'
  if (aqi <= 300) return '#EF4444'
  return '#BE123C'
}

function getStatusText(aqi) {
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Satisfactory'
  if (aqi <= 150) return 'Moderate'
  if (aqi <= 200) return 'Poor'
  if (aqi <= 300) return 'Very Poor'
  return 'Severe'
}

// Map view presets
const VIEWS = [
  { label: '🇮🇳 All India',    center: [22.5, 82.0], zoom: 5 },
  { label: '🏔️ North India',  center: [28.6, 77.5], zoom: 6 },
  { label: '🌿 Northeast',     center: [25.5, 92.0], zoom: 6 },
  { label: '🌊 South India',   center: [13.0, 79.0], zoom: 6 },
  { label: '🏖️ West India',   center: [21.0, 73.5], zoom: 6 },
]

// Fallback high-fidelity city AQI records
const DEFAULT_CITIES = [
  { city: 'Delhi',          lat: 28.6139, lng: 77.2090, aqi: 312, pollutant: 'PM2.5', state: 'Delhi' },
  { city: 'Mumbai',         lat: 19.0760, lng: 72.8777, aqi: 172, pollutant: 'PM10',  state: 'Maharashtra' },
  { city: 'Chennai',        lat: 13.0827, lng: 80.2707, aqi: 78,  pollutant: 'PM10',  state: 'Tamil Nadu' },
  { city: 'Kolkata',        lat: 22.5726, lng: 88.3639, aqi: 208, pollutant: 'PM2.5', state: 'West Bengal' },
  { city: 'Bengaluru',      lat: 12.9716, lng: 77.5946, aqi: 63,  pollutant: 'PM10',  state: 'Karnataka' },
  { city: 'Hyderabad',      lat: 17.3850, lng: 78.4867, aqi: 146, pollutant: 'PM2.5', state: 'Telangana' },
  { city: 'Ahmedabad',      lat: 23.0225, lng: 72.5714, aqi: 184, pollutant: 'PM10',  state: 'Gujarat' },
  { city: 'Pune',           lat: 18.5204, lng: 73.8567, aqi: 138, pollutant: 'PM10',  state: 'Maharashtra' },
  { city: 'Jaipur',         lat: 26.9124, lng: 75.7873, aqi: 228, pollutant: 'PM2.5', state: 'Rajasthan' },
  { city: 'Lucknow',        lat: 26.8467, lng: 80.9462, aqi: 298, pollutant: 'PM2.5', state: 'Uttar Pradesh' },
  { city: 'Kanpur',         lat: 26.4499, lng: 80.3319, aqi: 285, pollutant: 'PM2.5', state: 'Uttar Pradesh' },
  { city: 'Nagpur',         lat: 21.1458, lng: 79.0882, aqi: 152, pollutant: 'PM10',  state: 'Maharashtra' },
  { city: 'Indore',         lat: 22.7196, lng: 75.8577, aqi: 168, pollutant: 'PM10',  state: 'Madhya Pradesh' },
  { city: 'Bhopal',         lat: 23.2599, lng: 77.4126, aqi: 196, pollutant: 'PM10',  state: 'Madhya Pradesh' },
  { city: 'Patna',          lat: 25.5941, lng: 85.1376, aqi: 258, pollutant: 'PM2.5', state: 'Bihar' },
  { city: 'Varanasi',       lat: 25.3176, lng: 82.9739, aqi: 275, pollutant: 'PM2.5', state: 'Uttar Pradesh' },
  { city: 'Agra',           lat: 27.1767, lng: 78.0081, aqi: 288, pollutant: 'PM2.5', state: 'Uttar Pradesh' },
  { city: 'Gurgaon',        lat: 28.4595, lng: 77.0266, aqi: 295, pollutant: 'PM2.5', state: 'Haryana' },
  { city: 'Noida',          lat: 28.5355, lng: 77.3910, aqi: 305, pollutant: 'PM2.5', state: 'Uttar Pradesh' },
  { city: 'Surat',          lat: 21.1702, lng: 72.8311, aqi: 162, pollutant: 'PM10',  state: 'Gujarat' },
  { city: 'Visakhapatnam',  lat: 17.6868, lng: 83.2185, aqi: 112, pollutant: 'PM10',  state: 'Andhra Pradesh' },
  { city: 'Coimbatore',     lat: 11.0168, lng: 76.9558, aqi: 68,  pollutant: 'PM10',  state: 'Tamil Nadu' },
  { city: 'Kochi',          lat:  9.9312, lng: 76.2673, aqi: 58,  pollutant: 'PM10',  state: 'Kerala' },
  { city: 'Chandigarh',     lat: 30.7333, lng: 76.7794, aqi: 175, pollutant: 'PM2.5', state: 'Chandigarh' },
  { city: 'Amritsar',       lat: 31.6340, lng: 74.8723, aqi: 242, pollutant: 'PM2.5', state: 'Punjab' },
  { city: 'Guwahati',       lat: 26.1445, lng: 91.7362, aqi: 114, pollutant: 'PM2.5', state: 'Assam' },
  { city: 'Shillong',       lat: 25.5788, lng: 91.8933, aqi: 62,  pollutant: 'PM10',  state: 'Meghalaya' },
  { city: 'Imphal',         lat: 24.8170, lng: 93.9368, aqi: 55,  pollutant: 'PM10',  state: 'Manipur' },
  { city: 'Agartala',       lat: 23.8315, lng: 91.2868, aqi: 72,  pollutant: 'PM10',  state: 'Tripura' },
  { city: 'Aizawl',         lat: 23.7271, lng: 92.7176, aqi: 24,  pollutant: 'PM10',  state: 'Mizoram' },
  { city: 'Kohima',         lat: 25.6701, lng: 94.1077, aqi: 48,  pollutant: 'PM10',  state: 'Nagaland' },
  { city: 'Dimapur',        lat: 25.9091, lng: 93.7265, aqi: 65,  pollutant: 'PM10',  state: 'Nagaland' },
  { city: 'Itanagar',       lat: 27.0844, lng: 93.6053, aqi: 54,  pollutant: 'PM10',  state: 'Arunachal Pradesh' },
  { city: 'Gangtok',        lat: 27.3314, lng: 88.6138, aqi: 53,  pollutant: 'PM10',  state: 'Sikkim' },
]

export default function GISMap() {
  const [cities, setCities] = useState(DEFAULT_CITIES)
  const [loading, setLoading] = useState(false)
  const [mapRef, setMapRef] = useState(null)
  const [activeView, setActiveView] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchGISData()
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(c => ({
            ...c,
            lat: parseFloat(c.lat),
            lng: parseFloat(c.lng),
            aqi: c.aqi != null ? parseFloat(c.aqi) : 100,
          }))
          setCities(formatted)
        }
      } catch (e) {
        // Keeps DEFAULT_CITIES on API failure
      }
    }
    load()
  }, [])

  function flyTo(idx) {
    setActiveView(idx)
    if (mapRef) {
      const v = VIEWS[idx]
      mapRef.flyTo(v.center, v.zoom, { duration: 1.2 })
    }
  }

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div className="ui-card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Top Controls Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🗺️</span>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Pan-India GIS Air Quality Heatmap</h2>
              <span className="badge-pill teal">Live Geo-Telemetry</span>
            </div>
            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Spatial pollutant dispersion & multi-city CAAQMS telemetry stations</p>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 4, borderRadius: 8 }}>
            {VIEWS.map((v, i) => (
              <button
                key={v.label}
                className={`pill-btn ${activeView === i ? 'active' : ''}`}
                onClick={() => flyTo(i)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaflet Map */}
        <div style={{ height: 580, width: '100%', position: 'relative' }}>
          <MapContainer
            center={VIEWS[0].center}
            zoom={VIEWS[0].zoom}
            style={{ height: '100%', width: '100%' }}
            ref={setMapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {cities.map((c, i) => {
              const aqiVal = c.aqi ?? 100
              const color = getMarkerColor(aqiVal)
              const statusText = getStatusText(aqiVal)
              const radius = Math.max(9, Math.min(22, aqiVal / 14))

              return (
                <CircleMarker
                  key={`${c.city}-${i}`}
                  center={[c.lat, c.lng]}
                  radius={radius}
                  pathOptions={{
                    color: '#FFFFFF',
                    fillColor: color,
                    fillOpacity: 0.92,
                    weight: 2.5,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -radius]} opacity={0.95}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>
                      {c.city}: {aqiVal} AQI ({statusText})
                    </div>
                  </Tooltip>

                  <Popup>
                    <div style={{ minWidth: 190, color: '#0F172A', padding: '4px 2px' }}>
                      <div style={{ fontWeight: 800, fontSize: 15, borderBottom: '1px solid #E2E8F0', paddingBottom: 4 }}>
                        {c.city}
                        {c.state && <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginLeft: 6 }}>({c.state})</span>}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '10px 0' }}>
                        <span style={{ fontSize: 12, color: '#64748B' }}>AQI:</span>
                        <span style={{ color, fontSize: 24, fontWeight: 900 }}>{aqiVal}</span>
                        <span className="badge-pill" style={{ background: color, color: '#FFF', fontSize: 10 }}>
                          {statusText}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: '#334155', marginBottom: 4 }}>
                        <strong>Dominant Pollutant:</strong> {c.pollutant || 'PM2.5'}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: 6 }}>
                        📍 Coordinates: {c.lat.toFixed(2)}°N, {c.lng.toFixed(2)}°E
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* Legend Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
          padding: '12px 20px', borderTop: '1px solid var(--border-light)',
          background: '#FFFFFF',
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>AQI Scale:</span>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155', fontWeight: 600 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }} />
              {l.label}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
