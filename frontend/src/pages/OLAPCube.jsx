import { useState, useEffect, useCallback } from 'react'
import { fetchOLAP, getErrorMessage } from '../api/api'
import { ALL_STATES } from '../context/AQIContext'
import { MetricCard } from '../components/MetricCard'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// Available Dimensions
const DIMENSIONS = [
  { id: 'region',              label: 'Region (North, South, NE, etc.)' },
  { id: 'state',               label: 'State / UT (32 States)' },
  { id: 'season_name',         label: 'Season (Winter, Monsoon, etc.)' },
  { id: 'month_name',          label: 'Month (Jan – Dec)' },
  { id: 'year_num',            label: 'Year (2022 – 2025)' },
  { id: 'prominent_pollutant', label: 'Prominent Pollutant' },
  { id: 'status',              label: 'AQI Status Category' },
]

// Measures
const MEASURES = [
  { id: 'mean_aqi',       label: 'Mean AQI (Average)' },
  { id: 'max_aqi',        label: 'Peak / Max AQI' },
  { id: 'min_aqi',        label: 'Minimum AQI' },
  { id: 'count',          label: 'Observation Count' },
  { id: 'exceedance_pct', label: '% Days Exceeding CPCB (>100)' },
]

// Preset Standard OLAP Cubes for Quick Analysis & Review Demo
const PRESETS = [
  {
    id: 'preset_reg_season',
    title: '🌏 Region × Season',
    subtitle: 'Roll-up: State → Region aggregation across 4 seasons',
    op: 'Roll-up',
    row: 'region',
    col: 'season_name',
    measure: 'mean_aqi',
  },
  {
    id: 'preset_state_month',
    title: '🗓️ State × Month',
    subtitle: 'Monthly temporal variations across all 32 states',
    op: 'Drill-down / Slice',
    row: 'state',
    col: 'month_name',
    measure: 'mean_aqi',
  },
  {
    id: 'preset_state_year',
    title: '📅 State × Year Trend',
    subtitle: 'Year-over-year progression (2022 to 2025)',
    op: 'Multi-Year Drill-down',
    row: 'state',
    col: 'year_num',
    measure: 'mean_aqi',
  },
  {
    id: 'preset_pollutant_season',
    title: '☁️ Pollutant × Season',
    subtitle: 'Dominant pollutant distribution across climate cycles',
    op: 'Dice (Cross-dim)',
    row: 'prominent_pollutant',
    col: 'season_name',
    measure: 'count',
  },
  {
    id: 'preset_reg_pollutant',
    title: '🏭 Region × Pollutant',
    subtitle: 'Pollutant intensity across geographic regions',
    op: 'Roll-up & Dice',
    row: 'region',
    col: 'prominent_pollutant',
    measure: 'mean_aqi',
  },
]

const REGIONS = ['All', 'North', 'South', 'East', 'West', 'Central', 'Northeast']
const SEASONS = ['All', 'Winter', 'Spring/Summer', 'Monsoon', 'Autumn']
const YEARS = ['All', '2022', '2023', '2024', '2025']
const POLLUTANTS = ['All', 'PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3']

// Helper to color heatmap cells based on value & measure
function getHeatmapColor(value, measure) {
  if (value == null || isNaN(value)) return { bg: '#161b22', text: '#6e7681' }
  
  if (measure === 'count') {
    // Blue intensity scale for counts
    if (value > 10000) return { bg: 'rgba(56, 189, 248, 0.45)', text: '#e6edf3' }
    if (value > 4000)  return { bg: 'rgba(56, 189, 248, 0.30)', text: '#e6edf3' }
    if (value > 1000)  return { bg: 'rgba(56, 189, 248, 0.18)', text: '#e6edf3' }
    return { bg: 'rgba(56, 189, 248, 0.08)', text: '#8b949e' }
  }

  if (measure === 'exceedance_pct') {
    if (value >= 75) return { bg: 'rgba(231, 76, 60, 0.45)',  text: '#ff6b6b' }
    if (value >= 50) return { bg: 'rgba(230, 126, 34, 0.35)', text: '#f39c12' }
    if (value >= 25) return { bg: 'rgba(243, 156, 18, 0.25)', text: '#f1c40f' }
    return { bg: 'rgba(46, 204, 113, 0.25)', text: '#2ecc71' }
  }

  // Standard AQI colors
  if (value <= 50)  return { bg: 'rgba(46, 204, 113, 0.25)', text: '#2ecc71' }
  if (value <= 100) return { bg: 'rgba(168, 224, 99, 0.22)', text: '#a8e063' }
  if (value <= 200) return { bg: 'rgba(243, 156, 18, 0.25)', text: '#f39c12' }
  if (value <= 300) return { bg: 'rgba(230, 126, 34, 0.35)', text: '#e67e22' }
  if (value <= 400) return { bg: 'rgba(231, 76, 60, 0.40)',  text: '#e74c3c' }
  return { bg: 'rgba(255, 107, 107, 0.50)', text: '#ff6b6b' }
}

export default function OLAPCube() {
  const [rowDim, setRowDim] = useState('region')
  const [colDim, setColDim] = useState('season_name')
  const [measure, setMeasure] = useState('mean_aqi')

  // Slice / Dice Filters
  const [filterState, setFilterState] = useState('All India')
  const [filterRegion, setFilterRegion] = useState('All')
  const [filterSeason, setFilterSeason] = useState('All')
  const [filterYear, setFilterYear] = useState('All')
  const [filterPollutant, setFilterPollutant] = useState('All')

  // View tabs
  const [viewMode, setViewMode] = useState('heatmap') // 'heatmap' | 'pivot' | 'chart'

  // Data state
  const [cubeData, setCubeData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const executeQuery = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOLAP({
        row_dim: rowDim,
        col_dim: colDim,
        measure,
        filter_state: filterState,
        filter_region: filterRegion,
        filter_season: filterSeason,
        filter_year: filterYear,
        filter_pollutant: filterPollutant,
      })
      setCubeData(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [rowDim, colDim, measure, filterState, filterRegion, filterSeason, filterYear, filterPollutant])

  useEffect(() => {
    executeQuery()
  }, [executeQuery])

  // OLAP Pivot Operation (swap rows and columns)
  function handlePivot() {
    const temp = rowDim
    setRowDim(colDim)
    setColDim(temp)
  }

  // Load a preset
  function handlePreset(p) {
    setRowDim(p.row)
    setColDim(p.col)
    setMeasure(p.measure)
    setFilterState('All India')
    setFilterRegion('All')
    setFilterSeason('All')
    setFilterYear('All')
    setFilterPollutant('All')
  }

  // Check active operations for the badge summary
  const isSliced = filterState !== 'All India' || filterRegion !== 'All' || filterSeason !== 'All' || filterYear !== 'All' || filterPollutant !== 'All'
  const isRolledUp = rowDim === 'region' || colDim === 'region' || rowDim === 'season_name' || colDim === 'season_name'
  const isDrilledDown = rowDim === 'state' || colDim === 'month_name' || rowDim === 'month_name'

  // Chart data preparation
  const chartData = cubeData?.matrix?.map(row => {
    const obj = { name: row.row_key }
    cubeData.cols?.forEach(c => {
      obj[c] = row[c] ?? 0
    })
    return obj
  }) || []

  // Color palette for multi-bar chart
  const BAR_COLORS = ['#38bdf8', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#3498db', '#f1c40f', '#e84393', '#00adb5', '#a8e063']

  return (
    <div className="fade-in">
      {/* Platform BI Architecture Banner */}
      <div className="card" style={{ marginBottom: 18, background: 'linear-gradient(135deg, #161b22 0%, #1f2937 100%)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>🧊</span>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--accent)' }}>
                Multi-Dimensional OLAP Cube Analytics Engine
              </h2>
              <span className="badge badge-satisfactory" style={{ fontSize: 10 }}>BI Framework</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
              <strong>Star Schema Integration:</strong> Location Dim (State, Region) × Time Dim (Month, Season, Year) × Pollutant Dim × Status Dim across <strong>235K+ Records</strong> (Dataset 1) joined with Live WAQI API (Dataset 2).
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-info">Roll-up</span>
            <span className="badge badge-info">Drill-down</span>
            <span className="badge badge-good">Slice & Dice</span>
            <span className="badge badge-moderate">Pivot</span>
          </div>
        </div>
      </div>

      {/* Preset Cube Selector Buttons */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Quick Analysis Presets (Standard OLAP Operations)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {PRESETS.map(p => {
            const isActive = rowDim === p.row && colDim === p.col && measure === p.measure
            return (
              <button
                key={p.id}
                onClick={() => handlePreset(p)}
                className={`card ${isActive ? 'active-preset' : ''}`}
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(0, 173, 181, 0.12)' : 'var(--bg-surface)',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {p.title}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-base)', padding: '2px 6px', borderRadius: 4 }}>
                    {p.op}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.3 }}>
                  {p.subtitle}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dynamic OLAP Query Controls */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">
          <span className="icon">⚙️</span>
          OLAP Cube Custom Query Builder & Slicing Controls
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
          {/* Row Dimension */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Row Dimension</label>
            <select
              className="form-control"
              value={rowDim}
              onChange={e => setRowDim(e.target.value)}
            >
              {DIMENSIONS.map(d => (
                <option key={d.id} value={d.id} disabled={d.id === colDim}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Pivot Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <button
              className="btn btn-ghost"
              onClick={handlePivot}
              title="Pivot: Swap row and column axes"
              style={{ width: '100%', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              🔄 Pivot Axes
            </button>
          </div>

          {/* Column Dimension */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Column Dimension</label>
            <select
              className="form-control"
              value={colDim}
              onChange={e => setColDim(e.target.value)}
            >
              {DIMENSIONS.map(d => (
                <option key={d.id} value={d.id} disabled={d.id === rowDim}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Measure */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Aggregation Measure</label>
            <select
              className="form-control"
              value={measure}
              onChange={e => setMeasure(e.target.value)}
            >
              {MEASURES.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Slice & Dice Filters Row */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--bg-elevated)',
          borderRadius: 8,
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>
            🔪 Slice & Dice Dimensional Constraints
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {/* Region Slice */}
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Region Slice</label>
              <select
                className="form-control"
                style={{ fontSize: 11, padding: '4px 8px', height: 32 }}
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* State Slice */}
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>State Slice</label>
              <select
                className="form-control"
                style={{ fontSize: 11, padding: '4px 8px', height: 32 }}
                value={filterState}
                onChange={e => setFilterState(e.target.value)}
              >
                {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Season Slice */}
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Season Slice</label>
              <select
                className="form-control"
                style={{ fontSize: 11, padding: '4px 8px', height: 32 }}
                value={filterSeason}
                onChange={e => setFilterSeason(e.target.value)}
              >
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Year Slice */}
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Year Slice</label>
              <select
                className="form-control"
                style={{ fontSize: 11, padding: '4px 8px', height: 32 }}
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Pollutant Slice */}
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Pollutant Slice</label>
              <select
                className="form-control"
                style={{ fontSize: 11, padding: '4px 8px', height: 32 }}
                value={filterPollutant}
                onChange={e => setFilterPollutant(e.target.value)}
              >
                {POLLUTANTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Active OLAP Operations Badge Summary */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>Active OLAP Operations:</span>
          {isRolledUp && <span className="badge badge-info">▲ Roll-up</span>}
          {isDrilledDown && <span className="badge badge-info">▼ Drill-down</span>}
          {isSliced && <span className="badge badge-good">✂️ Slice / Dice</span>}
          <span className="badge badge-moderate">🔄 Pivot Ready</span>
        </div>
      </div>

      {/* KPI Metrics for Active Cube */}
      {cubeData?.summary && (
        <div className="grid-4" style={{ gap: 12, marginBottom: 18 }}>
          <MetricCard
            id="cube-total"
            label="Matched Observations"
            value={cubeData.summary.total_records.toLocaleString()}
            color="var(--accent)"
            sub="Active Cube Cells"
          />
          <MetricCard
            id="cube-mean"
            label="Overall Subset Mean"
            value={cubeData.summary.overall_mean}
            color="var(--warning)"
            sub="AQI Index"
          />
          <MetricCard
            id="cube-max"
            label="Subset Peak AQI"
            value={cubeData.summary.overall_max}
            color="var(--danger)"
            sub="Worst Event"
          />
          <MetricCard
            id="cube-min"
            label="Subset Min AQI"
            value={cubeData.summary.overall_min}
            color="var(--good)"
            sub="Cleanest Event"
          />
        </div>
      )}

      {/* Main Visualizations Container */}
      <div className="card">
        {/* View Mode Switcher */}
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            <span className="icon">📊</span>
            Cube Visualization: {DIMENSIONS.find(d => d.id === rowDim)?.label} vs {DIMENSIONS.find(d => d.id === colDim)?.label}
          </div>

          <div className="flex" style={{ gap: 6 }}>
            <button
              className={`btn ${viewMode === 'heatmap' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12 }}
              onClick={() => setViewMode('heatmap')}
            >
              🔥 Heatmap Grid
            </button>
            <button
              className={`btn ${viewMode === 'pivot' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12 }}
              onClick={() => setViewMode('pivot')}
            >
              📋 Pivot Table
            </button>
            <button
              className={`btn ${viewMode === 'chart' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12 }}
              onClick={() => setViewMode('chart')}
            >
              📈 Multi-Bar Chart
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-state" style={{ height: 350 }}>
            <div className="spinner" />
            <span>Computing OLAP Multi-Dimensional Aggregation…</span>
          </div>
        )}

        {error && !loading && (
          <div className="error-state">⚠️ {error}</div>
        )}

        {!loading && !error && cubeData && (
          <>
            {/* 1. HEATMAP VIEW */}
            {viewMode === 'heatmap' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3, fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'var(--bg-elevated)', padding: '10px 14px', textAlign: 'left', color: 'var(--text-primary)', borderRadius: 4 }}>
                        {rowDim.toUpperCase()} \ {colDim.toUpperCase()}
                      </th>
                      {cubeData.cols?.map(colName => (
                        <th key={colName} style={{ background: 'var(--bg-elevated)', padding: '10px 12px', textAlign: 'center', color: 'var(--text-primary)', borderRadius: 4 }}>
                          {colName}
                        </th>
                      ))}
                      <th style={{ background: 'rgba(0,173,181,0.15)', padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', borderRadius: 4 }}>
                        Row Avg
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cubeData.matrix?.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ padding: '8px 14px', fontWeight: 600, background: 'var(--bg-surface)', borderLeft: '3px solid var(--accent)', borderRadius: 4 }}>
                          {row.row_key}
                        </td>
                        {cubeData.cols?.map(colName => {
                          const val = row[colName]
                          const colorObj = getHeatmapColor(val, measure)
                          return (
                            <td
                              key={colName}
                              style={{
                                padding: '10px 12px',
                                textAlign: 'center',
                                background: colorObj.bg,
                                color: colorObj.text,
                                fontWeight: 700,
                                borderRadius: 4,
                                transition: 'all 0.15s ease',
                              }}
                              title={`${row.row_key} × ${colName}: ${val ?? 'N/A'}`}
                            >
                              {val != null ? val : '—'}
                            </td>
                          )
                        })}
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderRadius: 4 }}>
                          {row.row_avg != null ? row.row_avg : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Color scale legend */}
                <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Scale:</span>
                  <span style={{ color: '#2ecc71' }}>■ Good (0–50)</span>
                  <span style={{ color: '#a8e063' }}>■ Satisfactory (51–100)</span>
                  <span style={{ color: '#f39c12' }}>■ Moderate (101–200)</span>
                  <span style={{ color: '#e67e22' }}>■ Poor (201–300)</span>
                  <span style={{ color: '#e74c3c' }}>■ Very Poor (301–400)</span>
                  <span style={{ color: '#ff6b6b' }}>■ Severe (&gt;400)</span>
                </div>
              </div>
            )}

            {/* 2. PIVOT TABLE VIEW */}
            {viewMode === 'pivot' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{rowDim.toUpperCase()}</th>
                      {cubeData.cols?.map(c => <th key={c} style={{ textAlign: 'right' }}>{c}</th>)}
                      <th style={{ textAlign: 'right', color: 'var(--accent)' }}>ROW AVG</th>
                      <th style={{ textAlign: 'right', color: 'var(--danger)' }}>ROW MAX</th>
                      <th style={{ textAlign: 'right', color: 'var(--good)' }}>ROW MIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cubeData.matrix?.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{row.row_key}</td>
                        {cubeData.cols?.map(c => (
                          <td key={c} style={{ textAlign: 'right' }}>
                            {row[c] != null ? row[c] : '—'}
                          </td>
                        ))}
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>{row.row_avg ?? '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>{row.row_max ?? '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--good)' }}>{row.row_min ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. MULTI-BAR CHART VIEW */}
            {viewMode === 'chart' && (
              <div style={{ height: 420, width: '100%', marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1c2128', borderColor: '#30363d', borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: '#e6edf3' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: 11 }} />
                    {cubeData.cols?.map((c, idx) => (
                      <Bar key={c} dataKey={c} fill={BAR_COLORS[idx % BAR_COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>

      {/* BI OLAP Operations Academic Reference Guide */}
      <div className="card" style={{ marginTop: 18, background: 'var(--bg-elevated)' }}>
        <div className="card-title" style={{ fontSize: 14 }}>
          <span className="icon">📚</span>
          Business Intelligence (BI) Concept Guide — OLAP Operations
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, fontSize: 12 }}>
          <div style={{ padding: 10, background: 'var(--bg-base)', borderRadius: 6, borderLeft: '3px solid #38bdf8' }}>
            <strong style={{ color: '#38bdf8' }}>1. Roll-up (Aggregation)</strong>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Climbs up the dimensional hierarchy from fine to coarse granularity (e.g., aggregating 32 States up to 6 Geographic Regions).
            </p>
          </div>

          <div style={{ padding: 10, background: 'var(--bg-base)', borderRadius: 6, borderLeft: '3px solid #2ecc71' }}>
            <strong style={{ color: '#2ecc71' }}>2. Drill-down (Navigation)</strong>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Steps down from high-level summary to granular detail (e.g., drilling from Annual mean down into 12 individual months).
            </p>
          </div>

          <div style={{ padding: 10, background: 'var(--bg-base)', borderRadius: 6, borderLeft: '3px solid #f39c12' }}>
            <strong style={{ color: '#f39c12' }}>3. Slice (1D Filter)</strong>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Selects a single dimension value to produce a 2D sub-cube (e.g., filtering for only Season = "Winter").
            </p>
          </div>

          <div style={{ padding: 10, background: 'var(--bg-base)', borderRadius: 6, borderLeft: '3px solid #e74c3c' }}>
            <strong style={{ color: '#e74c3c' }}>4. Dice (Multi-D Filter)</strong>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Defines a sub-cube by applying selection criteria on multiple dimensions simultaneously (e.g., Year = 2024 AND Region = "North").
            </p>
          </div>

          <div style={{ padding: 10, background: 'var(--bg-base)', borderRadius: 6, borderLeft: '3px solid #00adb5' }}>
            <strong style={{ color: '#00adb5' }}>5. Pivot (Rotation)</strong>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Rotates data axes in 2D space to view information from an alternative analytical perspective (swapping row & column headers).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
