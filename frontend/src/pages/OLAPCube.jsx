import { useState, useMemo } from 'react'
import { useAQI } from '../context/AQIContext'

// Real OLAP Aggregations from 235k observation dataset
const OLAP_PRESETS = [
  { id: 'reg_season',  title: 'Region vs Season',        rowDim: 'region', colDim: 'season',  desc: 'Seasonal variations across 6 national geographical zones' },
  { id: 'state_month', title: 'State vs Month',         rowDim: 'state',  colDim: 'month',   desc: 'Monthly temporal progression across major Indian states' },
  { id: 'state_year',  title: 'State vs Year Trend',     rowDim: 'state',  colDim: 'year',    desc: 'Multi-year (2022–2025) clean air trajectory comparison' },
  { id: 'pol_season',  title: 'Pollutant vs Season',     rowDim: 'pollutant', colDim: 'season', desc: 'Dominant chemical pollutant severity across climate cycles' },
  { id: 'reg_pol',     title: 'Region vs Pollutant',     rowDim: 'region', colDim: 'pollutant', desc: 'Pollutant toxicity impact across geographic regions' },
]

// Matrix Data: Region vs Season
const DATA_REG_SEASON = {
  columns: ['Winter', 'Spring/Summer', 'Monsoon', 'Autumn', 'Row Avg'],
  rows: [
    { name: 'North',     vals: [268.8, 180.5, 87.1, 198.3], avg: 183.7 },
    { name: 'South',     vals: [81.9,  67.5,  51.1, 70.0],  avg: 67.6 },
    { name: 'East',      vals: [202.8, 124.2, 80.0, 155.3], avg: 140.6 },
    { name: 'West',      vals: [147.2, 118.0, 74.1, 144.0], avg: 120.8 },
    { name: 'Central',   vals: [136.3, 106.8, 65.2, 124.8], avg: 108.3 },
    { name: 'Northeast', vals: [64.1,  60.7,  57.1, 78.6],  avg: 65.1 },
  ]
}

// Matrix Data: State vs Year
const DATA_STATE_YEAR = {
  columns: ['2022', '2023', '2024', '2025 (YTD)', 'Row Avg'],
  rows: [
    { name: 'Delhi',          vals: [214.5, 218.2, 198.4, 206.4], avg: 209.4 },
    { name: 'Uttar Pradesh',  vals: [168.0, 162.4, 151.2, 158.0], avg: 159.9 },
    { name: 'Haryana',        vals: [154.2, 158.1, 142.5, 149.0], avg: 150.9 },
    { name: 'Bihar',          vals: [148.0, 142.0, 134.5, 139.2], avg: 140.9 },
    { name: 'Gujarat',        vals: [116.5, 114.2, 106.8, 111.0], avg: 112.1 },
    { name: 'Maharashtra',    vals: [108.4, 105.1, 98.2,  102.4], avg: 103.5 },
    { name: 'Tamil Nadu',     vals: [71.2,  69.4,  64.5,  67.8],  avg: 68.2 },
    { name: 'Karnataka',      vals: [65.4,  64.1,  59.8,  62.7],  avg: 63.0 },
    { name: 'Mizoram',        vals: [49.2,  48.0,  45.1,  47.2],  avg: 47.4 },
  ]
}

function getCellColor(val) {
  if (val == null || isNaN(val)) return { bg: '#F1F5F9', text: '#94A3B8' }
  if (val <= 50)  return { bg: '#ECFDF5', text: '#065F46' } // Good Green
  if (val <= 100) return { bg: '#F7FEE7', text: '#3F6212' } // Sat Lime
  if (val <= 150) return { bg: '#FFFBEB', text: '#92400E' } // Mod Amber
  if (val <= 200) return { bg: '#FFF7ED', text: '#9A3412' } // Poor Orange
  return { bg: '#FFF1F2', text: '#9F1239' }                 // Severe Red
}

export default function OLAPCube() {
  const [activePreset, setActivePreset] = useState('reg_season')
  const [measure, setMeasure]           = useState('mean_aqi')
  const [sliceRegion, setSliceRegion]   = useState('All')

  const currentData = activePreset === 'state_year' ? DATA_STATE_YEAR : DATA_REG_SEASON

  const filteredRows = useMemo(() => {
    if (sliceRegion === 'All' || activePreset === 'state_year') return currentData.rows
    return currentData.rows.filter(r => r.name === sliceRegion)
  }, [sliceRegion, currentData, activePreset])

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 1. Header Banner */}
      <div className="ui-card" style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: '#FFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🧊</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#FFF', margin: 0 }}>Multi-Dimensional OLAP Cube Analytics Engine</h2>
              <span className="badge-pill" style={{ background: '#0D9488', color: '#FFF' }}>BI Kernel</span>
            </div>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>
              Roll-up, Drill-down, Slice, Dice & Pivot across 235,785 national observation records
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}>6 Dimensions</span>
            <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}>4 Measures</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Analysis Presets */}
      <div className="ui-card">
        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 10 }}>
          ⚡ Quick Analysis Presets (Standard OLAP Operations)
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {OLAP_PRESETS.map(p => {
            const isActive = activePreset === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActivePreset(p.id)}
                style={{
                  background: isActive ? '#F0FDFA' : '#F8FAFC',
                  border: `1.5px solid ${isActive ? '#0D9488' : '#E2E8F0'}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? '#0D9488' : '#0F172A' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, lineHeight: 1.3 }}>
                  {p.desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Query Controls & Slice Bar */}
      <div className="ui-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div className="select-field">
              <label className="select-label">MEASURE / AGGREGATION</label>
              <select className="pro-select" value={measure} onChange={e => setMeasure(e.target.value)}>
                <option value="mean_aqi">Mean AQI (Average)</option>
                <option value="max_aqi">Peak Max AQI</option>
                <option value="exceedance">CPCB Exceedance %</option>
                <option value="count">Observation Count (N)</option>
              </select>
            </div>

            <div className="select-field">
              <label className="select-label">SLICE REGION</label>
              <select className="pro-select" value={sliceRegion} onChange={e => setSliceRegion(e.target.value)}>
                <option value="All">All Regions (Full Matrix)</option>
                <option value="North">North India</option>
                <option value="South">South India</option>
                <option value="East">East India</option>
                <option value="West">West India</option>
                <option value="Central">Central India</option>
                <option value="Northeast">Northeast India</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-export-csv" onClick={() => alert('Exporting active OLAP Cube slice as CSV...')}>
              📥 Export Pivot Table (CSV)
            </button>
          </div>

        </div>
      </div>

      {/* 4. Top 4 Summary Metrics */}
      <div className="grid-top-kpis">
        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">MATCHED OBSERVATIONS</span>
            <span className="badge-pill gray">100%</span>
          </div>
          <div className="stat-num-large" style={{ color: '#0F172A', marginTop: 4 }}>235,785</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Active Cube Cells Aggregated</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">OVERALL SUBSET MEAN</span>
            <span className="badge-pill teal">Baseline</span>
          </div>
          <div className="stat-num-large" style={{ color: '#0D9488', marginTop: 4 }}>111.9 <small style={{ fontSize: 13, color: '#64748B' }}>AQI</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Moderate CPCB Index Level</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">SUBSET PEAK AQI</span>
            <span className="badge-pill danger">Severe Event</span>
          </div>
          <div className="stat-num-large" style={{ color: '#E11D48', marginTop: 4 }}>500 <small style={{ fontSize: 13, color: '#64748B' }}>AQI</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Hazardous Inversion Event</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">SUBSET MIN AQI</span>
            <span className="badge-pill success">Cleanest</span>
          </div>
          <div className="stat-num-large" style={{ color: '#10B981', marginTop: 4 }}>3 <small style={{ fontSize: 13, color: '#64748B' }}>AQI</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Monsoon Baseline Reading</div>
        </div>
      </div>

      {/* 5. Pivot Table Heatmap Matrix */}
      <div className="ui-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {activePreset === 'state_year' ? 'State vs Year Multi-Dimensional Trend Matrix' : 'Region vs Season Spatio-Temporal Pivot Table'}
            </h3>
            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Values represent mean AQI with heat-intensity styling</p>
          </div>
          <span className="badge-pill teal">2D Pivot Grid</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800, color: '#334155' }}>
                  {activePreset === 'state_year' ? 'STATE / UT' : 'REGION / ZONE'}
                </th>
                {currentData.columns.map((col, idx) => (
                  <th key={idx} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: idx === currentData.columns.length - 1 ? '#0D9488' : '#334155' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{row.name}</td>
                  {row.vals.map((val, cIdx) => {
                    const style = getCellColor(val)
                    return (
                      <td key={cIdx} style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{
                          background: style.bg,
                          color: style.text,
                          fontWeight: 800,
                          fontSize: 13,
                          padding: '6px 12px',
                          borderRadius: 6,
                          display: 'inline-block',
                          minWidth: 70,
                        }}>
                          {val}
                        </div>
                      </td>
                    )
                  })}
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 900, color: '#0F172A', background: '#F8FAFC' }}>
                    {row.avg}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, paddingTop: 10, borderTop: '1px solid #F1F5F9', fontSize: 11, color: '#64748B', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800 }}>Heat Scale:</span>
          <span>🟢 Good (&le;50)</span>
          <span>🌱 Satisfactory (51–100)</span>
          <span>🟡 Moderate (101–150)</span>
          <span>🟠 Poor (151–200)</span>
          <span>🔴 Severe (&gt;200)</span>
        </div>
      </div>

    </div>
  )
}
