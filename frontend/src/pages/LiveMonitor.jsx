import { useState, useEffect, useCallback } from 'react'
import { useAQI } from '../context/AQIContext'
import { fetchLiveAQI, getErrorMessage } from '../api/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  AreaChart, Area, ReferenceLine
} from 'recharts'

// Top 15 States Data directly matching the user's screenshot
const TOP15_STATES = [
  { state: 'Karnataka',       aqi: 63,  cat: 'good' },
  { state: 'Andhra Pradesh',  aqi: 112, cat: 'mod' },
  { state: 'Telangana',       aqi: 146, cat: 'mod' },
  { state: 'Odisha',          aqi: 158, cat: 'poor' },
  { state: 'Maharashtra',     aqi: 172, cat: 'poor' },
  { state: 'Gujarat',         aqi: 184, cat: 'poor' },
  { state: 'Madhya Pradesh',  aqi: 196, cat: 'poor' },
  { state: 'West Bengal',     aqi: 208, cat: 'severe' },
  { state: 'Jharkhand',       aqi: 214, cat: 'severe' },
  { state: 'Rajasthan',       aqi: 228, cat: 'severe' },
  { state: 'Punjab',          aqi: 242, cat: 'severe' },
  { state: 'Bihar',           aqi: 258, cat: 'severe' },
  { state: 'Haryana',         aqi: 276, cat: 'severe' },
  { state: 'Uttar Pradesh',   aqi: 298, cat: 'severe' },
  { state: '🔴 Delhi (NCR)',  aqi: 312, cat: 'hazardous' },
]

// 24h Trajectory curve data
const TRAJECTORY_DATA = [
  { time: '00:00', aqi: 245 },
  { time: '03:00', aqi: 228 },
  { time: '06:00', aqi: 360, label: 'Rush Spike' },
  { time: '09:00', aqi: 382, label: 'Max Peak' },
  { time: '12:00', aqi: 295 },
  { time: '15:00', aqi: 260 },
  { time: '18:00', aqi: 340, label: 'Evening Peak' },
  { time: '21:00', aqi: 325 },
  { time: 'Now',   aqi: 312 },
]

function getBarColor(aqi, isDelhi) {
  if (isDelhi) return '#E11D48'
  if (aqi <= 90)  return '#F59E0B'
  if (aqi <= 150) return '#F59E0B'
  if (aqi <= 200) return '#F97316'
  if (aqi <= 280) return '#EF4444'
  return '#BE123C'
}

export default function LiveMonitor() {
  const { selectedCity } = useAQI()
  const [liveData, setLiveData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filterMode, setFilterMode] = useState('Historical Mean')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchLiveAQI(selectedCity)
      setLiveData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedCity])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="live-monitor-v2">
      {/* 4 Top KPI Cards Grid */}
      <div className="grid-top-kpis">
        
        {/* Card 1: Focus City AQI */}
        <div className="ui-card card-kpi-highlight">
          <div className="kpi-header-row">
            <div className="kpi-title-tag">
              <span className="pulse-dot red"></span>
              <span className="tag-text">DELHI NCR FOCUS</span>
            </div>
            <span className="badge-pill danger">SEVERE / HAZARDOUS</span>
          </div>
          <div className="kpi-sub">Continuous Monitoring Index</div>
          <div className="kpi-main-stat">
            <span className="stat-num-huge">312</span>
            <div className="stat-units-box">
              <span className="stat-unit">AQI (US-EPA Standard)</span>
              <span className="stat-delta danger">▲ +18.4% vs yesterday peak</span>
            </div>
          </div>
          <div className="kpi-footer-alert">
            <span className="alert-icon">⚠️</span>
            <span>Emergency Advisory: Wear N95 outdoors (PM2.5 dominant)</span>
          </div>
        </div>

        {/* Card 2: Pan-India Snapshot */}
        <div className="ui-card">
          <div className="kpi-header-row">
            <div className="kpi-title-simple">PAN-INDIA SNAPSHOT</div>
            <span className="badge-pill gray">32 States Active</span>
          </div>
          <div className="kpi-sub">National Mean AQI</div>
          <div className="kpi-main-stat">
            <span className="stat-num-large" style={{ color: '#D97706' }}>178</span>
            <span className="stat-qualifier" style={{ color: '#D97706' }}>Moderate to Poor</span>
          </div>
          <div className="kpi-progress-wrap">
            <div className="progress-labels">
              <span>Critical Stations (&gt;200)</span>
              <strong>41.2%</strong>
            </div>
            <div className="multi-seg-bar">
              <div className="seg good" style={{ width: '22%' }}></div>
              <div className="seg mod" style={{ width: '36%' }}></div>
              <div className="seg severe" style={{ width: '42%' }}></div>
            </div>
            <div className="seg-legend">
              <span>• Good 22%</span>
              <span>• Mod 36%</span>
              <span>• Severe 42%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Station Outliers */}
        <div className="ui-card">
          <div className="kpi-header-row">
            <div className="kpi-title-simple">STATION OUTLIERS</div>
            <span className="badge-pill teal">Realtime CPCB</span>
          </div>
          <div className="outlier-list">
            <div className="outlier-row">
              <div className="outlier-meta">
                <div className="outlier-name">🍃 Aizawl, Mizoram</div>
                <div className="outlier-sub">Lowest Recorded Station</div>
              </div>
              <div className="outlier-val-box good">
                <span className="outlier-val">24</span>
                <span className="outlier-badge-text">AQI • GOOD</span>
              </div>
            </div>
            <div className="outlier-divider"></div>
            <div className="outlier-row">
              <div className="outlier-meta">
                <div className="outlier-name">⚠️ Bhiwadi, Rajasthan</div>
                <div className="outlier-sub">Peak Industrial Spike</div>
              </div>
              <div className="outlier-val-box danger">
                <span className="outlier-val">346</span>
                <span className="outlier-badge-text">AQI • HAZARDOUS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Dispersion Vector */}
        <div className="ui-card">
          <div className="kpi-header-row">
            <div className="kpi-title-simple">DISPERSION VECTOR</div>
            <span className="badge-pill warning">Inversion Trap: High</span>
          </div>
          <div className="dispersion-grid">
            <div className="disp-metric">
              <span className="disp-label">Surface Temp</span>
              <span className="disp-val">27.8°C</span>
              <span className="disp-sub">Dew Point: 19°C</span>
            </div>
            <div className="disp-metric">
              <span className="disp-label">Wind Velocity</span>
              <span className="disp-val">4.2 <small>km/h</small></span>
              <span className="disp-sub">↖ NW (stagnant)</span>
            </div>
          </div>
          <div className="disp-footer-row">
            <span>Rel. Humidity: <strong>64%</strong></span>
            <span>Mixing Height: <strong style={{ color: '#E11D48' }}>420m (Low)</strong></span>
          </div>
        </div>

      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid-main-columns">
        
        {/* LEFT COLUMN: Live Station Intelligence */}
        <div className="left-col-stack">
          
          <div className="ui-card station-intel-card">
            {/* Header */}
            <div className="station-header-bar">
              <div>
                <div className="station-title-row">
                  <span className="pulse-dot red"></span>
                  <h2 className="station-title">Live Station Intelligence</h2>
                </div>
                <div className="station-subtitle">Anand Vihar CAAQMS - Delhi NCR (DPCC)</div>
              </div>
              <span className="badge-pill danger" style={{ fontSize: 13, padding: '4px 10px' }}>AQI: 312</span>
            </div>

            {/* 6 Pollutants Grid */}
            <div className="pollutants-6-grid">
              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">PM 2.5</span>
                  <span className="pol-badge danger">6.8x WHO</span>
                </div>
                <div className="pol-val danger">262.4</div>
                <div className="pol-meta">µg/m³ (CPCB: 60)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">PM 10</span>
                  <span className="pol-badge warning">3.8x CPCB</span>
                </div>
                <div className="pol-val warning">384.0</div>
                <div className="pol-meta">µg/m³ (CPCB: 100)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">NOx</span>
                  <span className="pol-badge yellow">Elevated</span>
                </div>
                <div className="pol-val text-dark">74.2</div>
                <div className="pol-meta">µg/m³ (CPCB: 80)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">SO₂</span>
                  <span className="pol-badge good">Good</span>
                </div>
                <div className="pol-val text-good">16.8</div>
                <div className="pol-meta">µg/m³ (CPCB: 80)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">CO</span>
                  <span className="pol-badge warning">Moderate</span>
                </div>
                <div className="pol-val text-dark">2.14</div>
                <div className="pol-meta">mg/m³ (CPCB: 2.0)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">O₃</span>
                  <span className="pol-badge good">Normal</span>
                </div>
                <div className="pol-val text-good">42.5</div>
                <div className="pol-meta">µg/m³ (CPCB: 100)</div>
              </div>
            </div>

            {/* 24-Hour Concentration Trajectory */}
            <div className="trajectory-box">
              <div className="traj-header">
                <div className="traj-title">24-Hour Concentration Trajectory (AQI)</div>
                <div className="traj-peaks">
                  <span className="peak-label">🔴 Max Peak: <strong>382</strong></span>
                  <span className="low-label">• Low: <strong>218</strong></span>
                </div>
              </div>

              <div style={{ width: '100%', height: 110 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TRAJECTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E11D48" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[150, 420]} hide={true} />
                    <ReferenceLine y={300} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Severe Level 300', fill: '#EF4444', fontSize: 9, position: 'right' }} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11 }} />
                    <Area type="monotone" dataKey="aqi" stroke="#E11D48" strokeWidth={2.5} fillOpacity={1} fill="url(#aqiGradient)" dot={{ r: 2, fill: '#E11D48' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sensor Network Failover Card */}
            <div className="failover-box">
              <div className="failover-header">
                <div className="failover-title">
                  <span className="shield-icon">🛡️</span>
                  <span>Sensor Network Failover Active</span>
                </div>
                <span className="badge-pill teal">Dual-Feed</span>
              </div>
              <p className="failover-desc">
                Primary WAQI node load-balanced with backup CPCB CAAQMS ingestion channel. Sub-second streaming guaranteed.
              </p>
              <div className="failover-footer">
                <span className="failover-latency">Latency: 18ms • Protocol: HTTP/2 websocket</span>
                <button className="btn-refresh-telemetry" onClick={fetchData} disabled={loading}>
                  {loading ? 'Fetching...' : '🔄 Force Refresh Telemetry'}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Top 15 Most Polluted States */}
        <div className="right-col-stack">
          
          <div className="ui-card top-states-card">
            {/* Header & Controls */}
            <div className="states-header-bar">
              <div>
                <div className="states-title-row">
                  <span className="icon">📊</span>
                  <h2 className="states-title">Top 15 Most Polluted States</h2>
                </div>
                <p className="states-subtitle">Multi-Year Mean AQI Aggregation (2022–2025)</p>
              </div>

              {/* Filter Pills */}
              <div className="filter-pills">
                {['Historical Mean', 'Last 24h Peak', 'Winter Smog Index'].map(pill => (
                  <button
                    key={pill}
                    className={'pill-btn ' + (filterMode === pill ? 'active' : '')}
                    onClick={() => setFilterMode(pill)}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend Bar */}
            <div className="chart-legend-bar">
              <div className="legend-item">
                <span className="legend-box mod"></span>
                <span>Moderate (90–150)</span>
              </div>
              <div className="legend-item">
                <span className="legend-box unhealthy"></span>
                <span>Unhealthy (151–250)</span>
              </div>
              <div className="legend-item">
                <span className="legend-box severe"></span>
                <span>Severe Hazard (&gt;200)</span>
              </div>
              <div className="legend-baseline">
                CPCB Baseline: 100 | WHO: 25
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div style={{ width: '100%', height: 490 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={TOP15_STATES}
                  layout="vertical"
                  margin={{ top: 10, right: 35, left: 10, bottom: 0 }}
                  barCategoryGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 350]}
                    ticks={[0, 90, 180, 270, 350]}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="state"
                    width={130}
                    tick={(props) => {
                      const isDelhi = props.payload.value.includes('Delhi')
                      return (
                        <text
                          x={props.x - 6}
                          y={props.y + 4}
                          textAnchor="end"
                          fill={isDelhi ? '#E11D48' : '#334155'}
                          fontWeight={isDelhi ? 800 : 500}
                          fontSize={11}
                        >
                          {props.payload.value}
                        </text>
                      )
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div style={{ background: '#0F172A', color: '#FFF', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>
                          <strong style={{ display: 'block', marginBottom: 2 }}>{label}</strong>
                          <span>Mean AQI: <strong>{payload[0].value}</strong></span>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="aqi" radius={[0, 6, 6, 0]}>
                    {TOP15_STATES.map((entry, idx) => {
                      const isDelhi = entry.state.includes('Delhi')
                      return (
                        <Cell
                          key={idx}
                          fill={getBarColor(entry.aqi, isDelhi)}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scale Label & Footer Note */}
            <div className="scale-label-row">
              <div className="scale-text">Scale (AQI): 0 ------- 90 ------- 180 ------- 270 ------- 350</div>
            </div>

            <div className="states-footer-row">
              <div className="methodology-text">
                ℹ️ Methodology: Continuous Ambient Air Quality Monitoring Stations (CAAQMS) weighted median.
              </div>
              <button className="btn-export-csv" onClick={() => alert('Exporting Top 15 AQI State Aggregation as CSV...')}>
                Export CSV 📥
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

/* CSS */
