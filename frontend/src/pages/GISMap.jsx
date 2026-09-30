import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { fetchGISData, getErrorMessage } from '../api/api'
import { getAQIColor, getAQIBadgeClass, CITY_COORDS } from '../context/AQIContext'

// AQI legend entries
const LEGEND = [
  { label: 'Good (0–50)',           color: '#2ecc71' },
  { label: 'Satisfactory (51–100)', color: '#a8e063' },
  { label: 'Moderate (101–200)',    color: '#f39c12' },
  { label: 'Poor (201–300)',        color: '#e67e22' },
  { label: 'Very Poor (301–400)',   color: '#e74c3c' },
  { label: 'Severe (>400)',         color: '#ff6b6b' },
]

// Map view presets
const VIEWS = [
  { label: '🇮🇳 All India',    center: [22.5, 82.0], zoom: 5 },
  { label: '🏔️ North India',  center: [28.6, 77.5], zoom: 6 },
  { label: '🌿 Northeast',     center: [25.5, 92.0], zoom: 6 },
  { label: '🌊 South India',   center: [13.0, 79.0], zoom: 6 },
  { label: '🏖️ West India',   center: [21.0, 73.5], zoom: 6 },
]

// Map Tile Themes (all 100% free, no API keys needed, high clarity)
const MAP_THEMES = [
  {
    id: 'streets',
    label: '🗺️ Clear Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  {
    id: 'satellite',
    label: '🛰️ Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  {
    id: 'topo',
    label: '🏔️ Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    maxZoom: 18,
  },
  {
    id: 'dark',
    label: '🌌 Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
  {
    id: 'light',
    label: '🧭 Light Minimal',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
]

export default function GISMap() {
  const [cities,      setCities]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [mapRef,      setMapRef]      = useState(null)
  const [activeView,  setActiveView]  = useState(0)
  const [activeTheme, setActiveTheme] = useState('streets') // Default to clear street map

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGISData()

      // Coerce lat/lng to numbers
      const safe = data.map(c => ({
        ...c,
        lat: parseFloat(c.lat),
        lng: parseFloat(c.lng),
        aqi: c.aqi != null ? parseFloat(c.aqi) : null,
      }))

      // Merge with static CITY_COORDS
      const apiCityNames = new Set(safe.map(c => c.city))
      const fallbacks = CITY_COORDS
        .filter(cc => !apiCityNames.has(cc.city))
        .map(cc => ({
          city: cc.city, lat: cc.lat, lng: cc.lng,
          aqi: null, status: 'Unknown', pollutant: 'N/A',
        }))

      setCities([...safe, ...fallbacks])
      setLastRefresh(new Date().toLocaleTimeString())
    } catch (e) {
      const fallback = CITY_COORDS.map(cc => ({
        city: cc.city, lat: cc.lat, lng: cc.lng,
        aqi: null, status: 'Unknown', pollutant: 'N/A',
      }))
      setCities(fallback)
      setError(`Live AQI unavailable (${getErrorMessage(e)}) — showing city markers only`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Auto-resize and invalidate map when it renders or when tab becomes visible
  useEffect(() => {
    if (mapRef) {
      const timer = setTimeout(() => {
        mapRef.invalidateSize()
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [mapRef, activeTheme, activeView])

  function flyTo(viewIdx) {
    setActiveView(viewIdx)
    if (mapRef) {
      const v = VIEWS[viewIdx]
      mapRef.flyTo(v.center, v.zoom, { duration: 1.2 })
      setTimeout(() => mapRef.invalidateSize(), 300)
    }
  }

  const currentTheme = MAP_THEMES.find(t => t.id === activeTheme) || MAP_THEMES[0]

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>

        {/* Top Control Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
            <div>
              <div className="card-title" style={{ marginBottom: 4, fontSize: 16 }}>
                <span className="icon">🗺️</span>
                Spatial AQI Monitoring Map — 34 Cities
                {lastRefresh && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                    · Updated {lastRefresh}
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Includes Northeast India: Guwahati · Shillong · Imphal · Agartala · Aizawl · Kohima · Itanagar · Gangtok
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-12 flex-wrap">
              <button
                id="btn-refresh-gis"
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '6px 14px' }}
                onClick={load}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Secondary Filter Bar: Region Filters + Map Theme Switcher */}
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            
            {/* Region quick-fly buttons */}
            <div className="flex items-center gap-8 flex-wrap">
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Region:</span>
              <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                {VIEWS.map((v, i) => (
                  <button
                    key={i}
                    className={`btn ${activeView === i ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: 11, padding: '5px 12px' }}
                    onClick={() => flyTo(i)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Theme / Color Switcher */}
            <div className="flex items-center gap-8 flex-wrap">
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>🎨 Map Style:</span>
              <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                {MAP_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    className={`btn ${activeTheme === theme.id ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      fontSize: 11,
                      padding: '5px 12px',
                      background: activeTheme === theme.id ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: activeTheme === theme.id ? '#0d1117' : 'var(--text-primary)',
                      fontWeight: activeTheme === theme.id ? 700 : 500,
                    }}
                    onClick={() => {
                      setActiveTheme(theme.id)
                      if (mapRef) setTimeout(() => mapRef.invalidateSize(), 100)
                    }}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Warning banner */}
        {error && (
          <div style={{
            padding: '10px 20px', background: 'rgba(243,156,18,0.15)',
            borderBottom: '1px solid rgba(243,156,18,0.3)',
            fontSize: 12, color: '#f39c12',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading overlay */}
        {loading && cities.length === 0 && (
          <div className="loading-state" style={{ height: 580 }}>
            <div className="spinner" />
            <span>Fetching live AQI for 34 cities across India…</span>
          </div>
        )}

        {/* Map Container */}
        {cities.length > 0 && (
          <MapContainer
            center={VIEWS[0].center}
            zoom={VIEWS[0].zoom}
            style={{ height: 580, width: '100%', background: '#1a202c' }}
            id="aqi-gis-map"
            ref={setMapRef}
          >
            <TileLayer
              key={currentTheme.id}
              url={currentTheme.url}
              attribution={currentTheme.attribution}
              maxZoom={currentTheme.maxZoom}
            />

            {cities.map((city, i) => {
              if (isNaN(city.lat) || isNaN(city.lng)) return null

              const hasAQI = city.aqi != null && !isNaN(city.aqi)
              const color  = getAQIColor(city.status)
              const radius = hasAQI ? Math.max(9, Math.min(24, city.aqi / 16)) : 8

              return (
                <CircleMarker
                  key={`${city.city}-${i}`}
                  center={[city.lat, city.lng]}
                  radius={radius}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: color,
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  {/* Tooltip on hover */}
                  <Tooltip direction="top" offset={[0, -radius]} opacity={0.95}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>
                      {city.city}: {hasAQI ? `${Math.round(city.aqi)} AQI (${city.status})` : 'No Live Data'}
                    </div>
                  </Tooltip>

                  {/* Detailed Popup on Click */}
                  <Popup>
                    <div style={{ minWidth: 180, color: '#1e293b' }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                        {city.city}
                        {city.state && (
                          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400, marginLeft: 6 }}>
                            {city.state}
                          </span>
                        )}
                      </div>
                      {hasAQI ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '8px 0' }}>
                            <span style={{ color: '#64748b', fontSize: 12 }}>AQI:</span>
                            <span style={{ color, fontSize: 22, fontWeight: 900 }}>{Math.round(city.aqi)}</span>
                            <span className={`badge ${getAQIBadgeClass(city.status)}`} style={{ fontSize: 10 }}>
                              {city.status}
                            </span>
                          </div>
                          <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
                            <strong>Dominant Pollutant:</strong> {city.pollutant}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Live AQI unavailable</div>
                      )}
                      <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 8, borderTop: '1px solid #e2e8f0', paddingTop: 4 }}>
                        📍 {city.lat.toFixed(4)}°N, {city.lng.toFixed(4)}°E
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        )}

        {/* Legend */}
        {cities.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center',
            padding: '12px 20px', borderTop: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AQI Scale:</span>
            {LEGEND.map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, border: '1px solid rgba(255,255,255,0.4)', display: 'inline-block' }} />
                {l.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
