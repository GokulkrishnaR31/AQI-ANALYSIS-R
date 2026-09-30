import { useState, useEffect, useCallback } from 'react'
import { useAQI } from '../context/AQIContext'
import { fetchBenchmarks, getErrorMessage } from '../api/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { MetricCard } from '../components/MetricCard'

const BM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1c2128', border: '1px solid #30363d',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{label}</div>
      <div style={{ color: payload[0].fill }}>
        Compliance: <strong>{payload[0].value}%</strong>
      </div>
    </div>
  )
}

export default function Benchmarks() {
  const { selectedState } = useAQI()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await fetchBenchmarks(selectedState)
      setStats(data)
    } catch (e) { setError(getErrorMessage(e)) }
    finally     { setLoading(false) }
  }, [selectedState])

  useEffect(() => { load() }, [load])

  const chartData = stats ? [
    { name: 'CPCB Safe (AQI ≤ 100)', pct: stats.cpcb_compliance_pct, fill: '#2ecc71' },
    { name: 'WHO Safe (AQI ≤ 50)',    pct: stats.who_compliance_pct,  fill: '#e74c3c' },
  ] : []

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-title">
          <span className="icon">⚖️</span>
          WHO vs CPCB Compliance Benchmarks — {selectedState}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 18 }}>
          Percentage of historical observations meeting each standard.
          CPCB defines "safe" as AQI ≤ 100; WHO recommends AQI ≤ 50 (PM2.5 ≤ 15 µg/m³ annual mean).
        </p>

        {loading && <div className="loading-state"><div className="spinner" /><span>Computing compliance statistics…</span></div>}
        {error && !loading && <div className="error-state">⚠️ {error}</div>}

        {stats && !loading && (
          <>
            {/* KPI cards */}
            <div className="grid-4" style={{ gap: 14, marginBottom: 24 }}>
              <MetricCard
                id="bm-cpcb"
                label="CPCB Compliant Days"
                value={`${stats.cpcb_compliance_pct}%`}
                color="var(--good)"
                sub="AQI ≤ 100"
              />
              <MetricCard
                id="bm-who"
                label="WHO Compliant Days"
                value={`${stats.who_compliance_pct}%`}
                color="var(--danger)"
                sub="AQI ≤ 50"
              />
              <MetricCard
                id="bm-avg"
                label="Historical Mean AQI"
                value={stats.avg_aqi}
                color="var(--moderate)"
              />
              <MetricCard
                id="bm-max"
                label="Peak AQI Recorded"
                value={stats.max_aqi}
                color="var(--severe)"
              />
            </div>

            {/* Bar chart */}
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 60, left: 0, bottom: 20 }}
                barSize={80}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#e6edf3', fontSize: 13, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<BM_TOOLTIP />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                  <LabelList
                    dataKey="pct"
                    position="top"
                    formatter={v => `${v}%`}
                    style={{ fill: '#e6edf3', fontWeight: 700, fontSize: 14 }}
                  />
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Context note */}
            <div style={{
              marginTop: 16, padding: 14,
              background: 'var(--bg-elevated)',
              borderRadius: 8, borderLeft: '4px solid var(--moderate)',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>Context:</strong> India's CPCB standard (AQI ≤ 100)
              is 2× more lenient than WHO guidelines. Only {stats.who_compliance_pct}% of days in <em>{selectedState}</em> met
              the stricter WHO threshold — meaning <strong style={{ color: 'var(--danger)' }}>{100 - stats.who_compliance_pct}%
              of days exceed safe PM2.5 levels</strong> recommended for long-term health protection.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
