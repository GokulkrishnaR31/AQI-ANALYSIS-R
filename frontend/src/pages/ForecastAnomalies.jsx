import { useState, useEffect, useCallback } from 'react'
import { useAQI } from '../context/AQIContext'
import { fetchForecast, fetchAnomalies, getErrorMessage } from '../api/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts'

const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1c2128', border: '1px solid #30363d',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: '#e6edf3', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function ForecastAnomalies() {
  const { selectedState } = useAQI()

  const [forecast,  setForecast]  = useState(null)
  const [anomalies, setAnomalies] = useState(null)
  const [fcLoading, setFcLoading] = useState(false)
  const [anLoading, setAnLoading] = useState(false)
  const [fcError,   setFcError]   = useState(null)
  const [anError,   setAnError]   = useState(null)

  const loadForecast = useCallback(async () => {
    setFcLoading(true); setFcError(null)
    try {
      const data = await fetchForecast(selectedState)
      // data is an object of arrays (column-oriented), convert to row-oriented
      const dates = Array.isArray(data.date) ? data.date : data
      if (Array.isArray(data.date)) {
        const rows = data.date.map((d, i) => ({
          date:          d.slice(5),           // MM-DD for display
          predicted_aqi: data.predicted_aqi[i],
          lower_bound:   data.lower_bound[i],
          upper_bound:   data.upper_bound[i],
        }))
        setForecast(rows)
      } else {
        setForecast(data)
      }
    } catch (e) { setFcError(getErrorMessage(e)) }
    finally     { setFcLoading(false) }
  }, [selectedState])

  const loadAnomalies = useCallback(async () => {
    setAnLoading(true); setAnError(null)
    try {
      const data = await fetchAnomalies(selectedState)
      setAnomalies(data)
    } catch (e) { setAnError(getErrorMessage(e)) }
    finally     { setAnLoading(false) }
  }, [selectedState])

  // Re-fetch whenever selectedState changes
  useEffect(() => {
    loadForecast()
    loadAnomalies()
  }, [loadForecast, loadAnomalies])

  return (
    <div className="fade-in">
      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>

        {/* Forecast chart */}
        <div className="card">
          <div className="card-title">
            <span className="icon">📈</span>
            7-Day AQI Forecast — {selectedState}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
            Holt-Winters exponential smoothing · shaded band = 90% confidence interval
          </p>

          {fcLoading && <div className="loading-state"><div className="spinner" /><span>Computing forecast…</span></div>}
          {fcError && !fcLoading && <div className="error-state">⚠️ {fcError}</div>}

          {forecast && !fcLoading && (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={forecast} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ForecastTooltip />} />
                <ReferenceLine y={100} stroke="#2ecc71" strokeDasharray="4 4" label={{ value: 'CPCB Safe', fill: '#2ecc71', fontSize: 10 }} />
                <ReferenceLine y={50}  stroke="#a8e063" strokeDasharray="4 4" label={{ value: 'WHO Safe',  fill: '#a8e063', fontSize: 10 }} />
                {/* Confidence band */}
                <Area dataKey="upper_bound" stroke="none" fill="url(#fcGrad)" name="Upper 90%" />
                <Area dataKey="lower_bound" stroke="none" fill="var(--bg-surface)" name="Lower 90%" />
                {/* Forecast line */}
                <Line
                  type="monotone"
                  dataKey="predicted_aqi"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#f43f5e', strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#fff' }}
                  name="Predicted AQI"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Anomaly table */}
        <div className="card">
          <div className="card-title">
            <span className="icon">🚨</span>
            Historical Anomaly Spike Events — {selectedState}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
            Z-score ≥ 2.0 above mean · classified by pollution type
          </p>

          {anLoading && <div className="loading-state"><div className="spinner" /><span>Detecting anomalies…</span></div>}
          {anError && !anLoading && <div className="error-state">⚠️ {anError}</div>}

          {anomalies && !anLoading && (
            <>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 10, marginBottom: 16,
              }}>
                <div className="metric-card">
                  <div className="metric-lbl">Total Spikes</div>
                  <div className="metric-val" style={{ color: 'var(--danger)', fontSize: 28 }}>
                    {anomalies.total}
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-lbl">Coverage</div>
                  <div className="metric-val" style={{ color: 'var(--info)', fontSize: 28 }}>
                    {selectedState}
                  </div>
                </div>
              </div>

              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Mean AQI</th>
                      <th>Event Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.anomalies?.slice(0, 50).map((row, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{row.date}</td>
                        <td style={{ color: '#e74c3c', fontWeight: 700 }}>{Math.round(row.mean_aqi)}</td>
                        <td style={{ color: '#f39c12', fontSize: 12 }}>{row.event_type}</td>
                      </tr>
                    ))}
                    {(!anomalies.anomalies || anomalies.anomalies.length === 0) && (
                      <tr><td colSpan={3} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                        No anomalies detected for this region.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
