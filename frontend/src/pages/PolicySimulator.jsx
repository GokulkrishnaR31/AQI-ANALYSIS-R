import { useState } from 'react'
import { postPolicySimulate, getErrorMessage } from '../api/api'
import { MetricCard } from '../components/MetricCard'
import { getAQIBadgeClass } from '../context/AQIContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, ReferenceLine,
} from 'recharts'

function SliderRow({ id, label, value, min, max, step = 1, unit = '%', onChange }) {
  return (
    <div className="form-group">
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <label className="form-label" htmlFor={id}>{label}</label>
        <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between" style={{ marginTop: 2 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{min}{unit}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function PolicySimulator() {
  const [traffic,  setTraffic]  = useState(20)
  const [stubble,  setStubble]  = useState(50)
  const [industry, setIndustry] = useState(15)
  const [baseAQI,  setBaseAQI]  = useState(280)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function simulate() {
    setLoading(true); setError(null)
    try {
      const data = await postPolicySimulate({
        traffic_red: traffic, stubble_red: stubble,
        industry_red: industry, base_aqi: baseAQI,
      })
      setResult(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const chartData = result ? [
    { name: 'Baseline',  aqi: result.baseline_aqi,  fill: '#e74c3c' },
    { name: 'Simulated', aqi: result.simulated_aqi, fill: '#2ecc71' },
  ] : []

  return (
    <div className="fade-in">
      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>

        {/* Controls */}
        <div className="card">
          <div className="card-title"><span className="icon">⚙️</span>Policy Interventions</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 18 }}>
            Adjust levers below to simulate what would happen to AQI if these emission sources were reduced.
          </p>

          <SliderRow
            id="sim-traffic"
            label="🚗 Vehicular Traffic Reduction"
            value={traffic} min={0} max={50}
            onChange={setTraffic}
          />
          <SliderRow
            id="sim-stubble"
            label="🌾 Stubble Burning Mitigation"
            value={stubble} min={0} max={100}
            onChange={setStubble}
          />
          <SliderRow
            id="sim-industry"
            label="🏭 Industrial Emission Control"
            value={industry} min={0} max={40}
            onChange={setIndustry}
          />

          <div className="form-group">
            <label className="form-label" htmlFor="sim-base-aqi">Baseline City AQI</label>
            <input
              type="number"
              id="sim-base-aqi"
              className="form-control"
              value={baseAQI}
              min={50}
              max={500}
              onChange={e => setBaseAQI(Number(e.target.value))}
            />
          </div>

          {error && <div className="error-state" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

          <button
            id="btn-simulate"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={simulate}
            disabled={loading}
          >
            {loading ? '⏳ Simulating…' : '🎯 Run Simulation'}
          </button>
        </div>

        {/* Results */}
        <div className="card">
          <div className="card-title"><span className="icon">🎯</span>Simulation Impact Results</div>

          {!result && !loading && (
            <div className="loading-state" style={{ color: 'var(--text-muted)' }}>
              <span style={{ fontSize: 40 }}>🧪</span>
              <span>Configure interventions and click <strong>Run Simulation</strong></span>
            </div>
          )}

          {loading && <div className="loading-state"><div className="spinner" /><span>Running simulation…</span></div>}

          {result && !loading && (
            <>
              <div className="grid-2" style={{ gap: 10, marginBottom: 20 }}>
                <MetricCard id="result-baseline"  label="Baseline AQI"  value={result.baseline_aqi}  color="var(--danger)" />
                <MetricCard id="result-simulated" label="Simulated AQI" value={result.simulated_aqi} color="var(--good)"   />
                <MetricCard id="result-drop"      label="AQI Reduction"
                  value={`${result.aqi_drop} pts`} color="var(--accent)"
                  sub={`${result.pct_reduction}% total reduction`}
                />
                <MetricCard id="result-er"        label="ER Visits Avoided / 100k"
                  value={result.er_visits_avoided} color="var(--info)"
                />
              </div>

              <div style={{
                background: 'var(--bg-elevated)', borderRadius: 10,
                padding: '14px 16px', marginBottom: 16,
                borderLeft: '4px solid var(--accent)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>New Air Quality Status</div>
                <span className={`badge ${getAQIBadgeClass(result.new_status)}`} style={{ marginTop: 6, fontSize: 13 }}>
                  {result.new_status}
                </span>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#e6edf3', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                  <ReferenceLine y={100} stroke="#2ecc71" strokeDasharray="4 4" />
                  <Bar dataKey="aqi" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
