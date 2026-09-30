import { useState, useEffect, useCallback } from 'react'
import { useAQI } from '../context/AQIContext'
import { fetchLiveAQI, getErrorMessage } from '../api/api'
import { AQILiveCard, MetricCard } from '../components/MetricCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts'

// Static top-15 polluted states (representative averages from historical data)
const TOP15_DATA = [
  { state: 'Delhi',           mean_aqi: 312 },
  { state: 'Uttar Pradesh',   mean_aqi: 289 },
  { state: 'Haryana',         mean_aqi: 276 },
  { state: 'Bihar',           mean_aqi: 265 },
  { state: 'Punjab',          mean_aqi: 251 },
  { state: 'Rajasthan',       mean_aqi: 238 },
  { state: 'Jharkhand',       mean_aqi: 222 },
  { state: 'West Bengal',     mean_aqi: 218 },
  { state: 'Madhya Pradesh',  mean_aqi: 203 },
  { state: 'Gujarat',         mean_aqi: 196 },
  { state: 'Maharashtra',     mean_aqi: 185 },
  { state: 'Odisha',          mean_aqi: 174 },
  { state: 'Telangana',       mean_aqi: 162 },
  { state: 'Andhra Pradesh',  mean_aqi: 150 },
  { state: 'Karnataka',       mean_aqi: 138 },
].sort((a, b) => a.mean_aqi - b.mean_aqi)

function getBarColor(aqi) {
  if (aqi <= 100) return '#2ecc71'
  if (aqi <= 200) return '#f39c12'
  if (aqi <= 300) return '#e67e22'
  return '#e74c3c'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1c2128', border: '1px solid #30363d',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{label}</div>
      <div style={{ color: getBarColor(payload[0].value) }}>
        Mean AQI: <strong>{payload[0].value}</strong>
      </div>
    </div>
  )
}

export default function LiveMonitor() {
  const { selectedCity } = useAQI()
  const [liveData,  setLiveData]  = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [lastCity,  setLastCity]  = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLiveAQI(selectedCity)
      setLiveData(data)
      setLastCity(selectedCity)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [selectedCity])

  // Auto-fetch when city changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="fade-in">
      <div className="grid-2" style={{ gap: 20 }}>

        {/* Left: Live AQI panel */}
        <div className="card">
          <div className="card-title">
            <span className="icon">📍</span>
            Live AQI — {selectedCity}
            <span className="badge badge-live" style={{ marginLeft: 'auto', fontSize: 10 }}>LIVE</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
            Use the <strong style={{ color: 'var(--accent)' }}>City</strong> selector in the top bar to switch cities.
          </p>

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <span>Fetching live AQI for {selectedCity}…</span>
            </div>
          )}

          {error && !loading && (
            <div className="error-state">
              ⚠️ {error} — WAQI API may be rate-limited or city offline.
            </div>
          )}

          {liveData && !loading && (
            <>
              <AQILiveCard data={liveData} />

              <div className="divider" style={{ marginTop: 20 }} />

              <div className="grid-3" style={{ gap: 10, marginTop: 14 }}>
                <MetricCard id="live-pm25"  label="PM2.5"      value={liveData.pm25  ?? 'N/A'} unit="µg/m³" color="var(--danger)" />
                <MetricCard id="live-pm10"  label="PM10"       value={liveData.pm10  ?? 'N/A'} unit="µg/m³" color="var(--moderate)" />
                <MetricCard id="live-no2"   label="NO₂"        value={liveData.no2   ?? 'N/A'} unit="ppb"   color="var(--poor)" />
              </div>
            </>
          )}

          <button
            id="btn-refresh-live"
            className="btn btn-primary"
            style={{ marginTop: 18, width: '100%' }}
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? '⏳ Fetching…' : '🔄 Refresh Live AQI'}
          </button>
        </div>

        {/* Right: Top 15 States bar chart */}
        <div className="card">
          <div className="card-title">
            <span className="icon">📊</span>
            Top 15 Most Polluted States — Historical Mean AQI
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={TOP15_DATA}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 350]}
                tick={{ fill: '#8b949e', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="state"
                width={120}
                tick={{ fill: '#e6edf3', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="mean_aqi" radius={[0, 4, 4, 0]}>
                {TOP15_DATA.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.mean_aqi)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}
