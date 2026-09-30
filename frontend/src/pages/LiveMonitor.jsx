import { useState, useMemo } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  AreaChart, Area, ReferenceLine
} from 'recharts'

const TOP15_BASE = [
  { state: 'Karnataka',       hist: 63,  peak: 115, winter: 88 },
  { state: 'Andhra Pradesh',  hist: 112, peak: 185, winter: 145 },
  { state: 'Telangana',       hist: 146, peak: 220, winter: 182 },
  { state: 'Odisha',          hist: 158, peak: 240, winter: 195 },
  { state: 'Maharashtra',     hist: 172, peak: 265, winter: 215 },
  { state: 'Gujarat',         hist: 184, peak: 278, winter: 230 },
  { state: 'Madhya Pradesh',  hist: 196, peak: 295, winter: 248 },
  { state: 'West Bengal',     hist: 208, peak: 320, winter: 265 },
  { state: 'Jharkhand',       hist: 214, peak: 335, winter: 272 },
  { state: 'Rajasthan',       hist: 228, peak: 360, winter: 295 },
  { state: 'Punjab',          hist: 242, peak: 385, winter: 320 },
  { state: 'Bihar',           hist: 258, peak: 410, winter: 345 },
  { state: 'Haryana',         hist: 276, peak: 435, winter: 370 },
  { state: 'Uttar Pradesh',   hist: 298, peak: 460, winter: 395 },
  { state: 'Delhi',           hist: 312, peak: 495, winter: 425 },
]

function getSeverityColor(aqi) {
  if (aqi <= 50)  return '#10B981'
  if (aqi <= 100) return '#84CC16'
  if (aqi <= 150) return '#F59E0B'
  if (aqi <= 200) return '#F97316'
  if (aqi <= 300) return '#EF4444'
  return '#BE123C'
}

function getAdvisory(aqi, city) {
  if (aqi > 300) return `Emergency Advisory: Hazardous levels in ${city}. Wear N95 masks outdoors.`
  if (aqi > 200) return `Health Warning: High pollution in ${city}. Vulnerable groups avoid outdoor exertion.`
  if (aqi > 100) return `Moderate Advisory: Air quality acceptable in ${city}; sensitive individuals limit exertion.`
  return `Clean Air: Conditions in ${city} are safe and optimal for outdoor exercise.`
}

export default function LiveMonitor() {
  const { selectedState, selectedCity } = useAQI()
  const [filterMode, setFilterMode] = useState('Historical Mean')
  const [refreshKey, setRefreshKey] = useState(0)

  const currentCityData = useMemo(() => {
    return getCityDetails(selectedCity)
  }, [selectedCity, refreshKey])

  const trajectoryData = useMemo(() => {
    const base = currentCityData.aqi
    return [
      { time: '00:00', aqi: Math.round(base * 0.78) },
      { time: '03:00', aqi: Math.round(base * 0.72) },
      { time: '06:00', aqi: Math.round(base * 1.15), label: 'Rush Spike' },
      { time: '09:00', aqi: Math.round(base * 1.22), label: 'Max Peak' },
      { time: '12:00', aqi: Math.round(base * 0.94) },
      { time: '15:00', aqi: Math.round(base * 0.83) },
      { time: '18:00', aqi: Math.round(base * 1.09), label: 'Evening Peak' },
      { time: '21:00', aqi: Math.round(base * 1.04) },
      { time: 'Now',   aqi: base },
    ]
  }, [currentCityData])

  const chartData = useMemo(() => {
    return TOP15_BASE.map(item => {
      let val = item.hist
      if (filterMode === 'Last 24h Peak') val = item.peak
      if (filterMode === 'Winter Smog Index') val = item.winter
      const isSel = item.state.toLowerCase() === selectedState.toLowerCase() || (selectedState === 'Delhi' && item.state === 'Delhi') || (currentCityData.state.toLowerCase() === item.state.toLowerCase())
      return {
        state: item.state,
        aqi: val,
        isSelected: isSel
      }
    })
  }, [filterMode, selectedState, currentCityData])

  return (
    <div className="live-monitor-v2">
      {/* 4 Top KPI Cards Grid */}
      <div className="grid-top-kpis">
        
        {/* Card 1: Selected State/City AQI */}
        <div className="ui-card card-kpi-highlight">
          <div className="kpi-header-row">
            <div className="kpi-title-tag">
              <span className="pulse-dot red"></span>
              <span className="tag-text">{selectedCity ? `${selectedCity.toUpperCase()} FOCUS` : 'REGIONAL FOCUS'}</span>
            </div>
            <span className="badge-pill danger" style={{ background: currentCityData.aqi > 200 ? '#FFF1F2' : '#FFFBEB', color: currentCityData.aqi > 200 ? '#BE123C' : '#D97706' }}>
              {currentCityData.aqi > 300 ? 'SEVERE / HAZARDOUS' : (currentCityData.aqi > 200 ? 'VERY POOR' : (currentCityData.aqi > 100 ? 'MODERATE / UNHEALTHY' : 'GOOD / CLEAN'))}
            </span>
          </div>
          <div className="kpi-sub">Continuous Monitoring Index • {currentCityData.state}</div>
          <div className="kpi-main-stat">
            <span className="stat-num-huge" style={{ color: getSeverityColor(currentCityData.aqi) }}>{currentCityData.aqi}</span>
            <div className="stat-units-box">
              <span className="stat-unit">AQI (CPCB / EPA Scale)</span>
              <span className="stat-delta danger">{currentCityData.delta} vs baseline</span>
            </div>
          </div>
          <div className="kpi-footer-alert">
            <span className="alert-icon">⚠️</span>
            <span>{getAdvisory(currentCityData.aqi, selectedCity)}</span>
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
            <span className="badge-pill warning">{currentCityData.aqi > 200 ? 'Inversion Trap: High' : 'Dispersion: Normal'}</span>
          </div>
          <div className="dispersion-grid">
            <div className="disp-metric">
              <span className="disp-label">Surface Temp</span>
              <span className="disp-val">{currentCityData.temp}</span>
              <span className="disp-sub">Dew Point: 19°C</span>
            </div>
            <div className="disp-metric">
              <span className="disp-label">Wind Velocity</span>
              <span className="disp-val">{currentCityData.wind}</span>
              <span className="disp-sub">Directional Flow</span>
            </div>
          </div>
          <div className="disp-footer-row">
            <span>Rel. Humidity: <strong>{currentCityData.hum}</strong></span>
            <span>Mixing Height: <strong style={{ color: currentCityData.aqi > 200 ? '#E11D48' : '#10B981' }}>{currentCityData.mix}</strong></span>
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
                <div className="station-subtitle">{currentCityData.station}</div>
              </div>
              <span className="badge-pill danger" style={{ fontSize: 13, padding: '4px 10px', background: getSeverityColor(currentCityData.aqi), color: '#FFF' }}>
                AQI: {currentCityData.aqi}
              </span>
            </div>

            {/* 6 Pollutants Grid */}
            <div className="pollutants-6-grid">
              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">PM 2.5</span>
                  <span className="pol-badge danger">{currentCityData.pm25 > 60 ? `${(currentCityData.pm25/15).toFixed(1)}x WHO` : 'Normal'}</span>
                </div>
                <div className="pol-val danger">{currentCityData.pm25}</div>
                <div className="pol-meta">µg/m³ (CPCB: 60)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">PM 10</span>
                  <span className="pol-badge warning">{currentCityData.pm10 > 100 ? `${(currentCityData.pm10/100).toFixed(1)}x CPCB` : 'Normal'}</span>
                </div>
                <div className="pol-val warning">{currentCityData.pm10}</div>
                <div className="pol-meta">µg/m³ (CPCB: 100)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">NOx</span>
                  <span className="pol-badge yellow">{currentCityData.nox > 60 ? 'Elevated' : 'Normal'}</span>
                </div>
                <div className="pol-val text-dark">{currentCityData.nox}</div>
                <div className="pol-meta">µg/m³ (CPCB: 80)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">SO₂</span>
                  <span className="pol-badge good">Good</span>
                </div>
                <div className="pol-val text-good">{currentCityData.so2}</div>
                <div className="pol-meta">µg/m³ (CPCB: 80)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">CO</span>
                  <span className="pol-badge warning">{currentCityData.co > 2 ? 'Moderate' : 'Good'}</span>
                </div>
                <div className="pol-val text-dark">{currentCityData.co}</div>
                <div className="pol-meta">mg/m³ (CPCB: 2.0)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">O₃</span>
                  <span className="pol-badge good">Normal</span>
                </div>
                <div className="pol-val text-good">{currentCityData.o3}</div>
                <div className="pol-meta">µg/m³ (CPCB: 100)</div>
              </div>
            </div>

            {/* 24-Hour Concentration Trajectory */}
            <div className="trajectory-box">
              <div className="traj-header">
                <div className="traj-title">24-Hour Concentration Trajectory ({selectedCity})</div>
                <div className="traj-peaks">
                  <span className="peak-label">🔴 Peak: <strong>{Math.round(currentCityData.aqi * 1.22)}</strong></span>
                  <span className="low-label">• Low: <strong>{Math.round(currentCityData.aqi * 0.72)}</strong></span>
                </div>
              </div>

              <div style={{ width: '100%', height: 110 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aqiGradDynamic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getSeverityColor(currentCityData.aqi)} stopOpacity={0.35}/>
                        <stop offset="95%" stopColor={getSeverityColor(currentCityData.aqi)} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} hide={true} />
                    <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Unhealthy 200', fill: '#EF4444', fontSize: 9, position: 'right' }} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11 }} />
                    <Area type="monotone" dataKey="aqi" stroke={getSeverityColor(currentCityData.aqi)} strokeWidth={2.5} fillOpacity={1} fill="url(#aqiGradDynamic)" dot={{ r: 2, fill: getSeverityColor(currentCityData.aqi) }} />
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
                Primary node load-balanced with backup CPCB CAAQMS ingestion channel. Sub-second streaming active for {selectedCity}.
              </p>
              <div className="failover-footer">
                <span className="failover-latency">Latency: 18ms • Protocol: HTTP/2 websocket</span>
                <button className="btn-refresh-telemetry" onClick={() => setRefreshKey(k => k + 1)}>
                  🔄 Force Refresh Telemetry
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
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 35, left: 10, bottom: 0 }}
                  barCategoryGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 500]}
                    ticks={[0, 100, 200, 300, 400, 500]}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="state"
                    width={130}
                    tick={(props) => {
                      const isSel = props.payload.value.toLowerCase() === selectedState.toLowerCase() || (selectedState === 'Delhi' && props.payload.value.includes('Delhi')) || (currentCityData.state.toLowerCase() === props.payload.value.toLowerCase())
                      return (
                        <text
                          x={props.x - 6}
                          y={props.y + 4}
                          textAnchor="end"
                          fill={isSel ? '#E11D48' : '#334155'}
                          fontWeight={isSel ? 900 : 500}
                          fontSize={11}
                        >
                          {isSel ? `👉 ${props.payload.value}` : props.payload.value}
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
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.isSelected ? '#E11D48' : getSeverityColor(entry.aqi)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scale Label & Footer Note */}
            <div className="scale-label-row">
              <div className="scale-text">Scale (AQI): 0 ------- 100 ------- 200 ------- 300 ------- 400 ------- 500</div>
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
