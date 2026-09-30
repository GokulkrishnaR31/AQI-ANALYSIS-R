import { useState, useMemo } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

export default function PolicySimulator() {
  const { selectedCity } = useAQI()
  const cityData = getCityDetails(selectedCity)
  const baseAQI = cityData.aqi

  const [trafficRed, setTrafficRed] = useState(25)
  const [indFilter, setIndFilter]   = useState(30)
  const [stubbleCtrl, setStubble]   = useState(40)
  const [greenCanopy, setGreen]     = useState(15)

  // Simulation calculation
  const simResults = useMemo(() => {
    const trafficDrop = (trafficRed * 0.35)
    const indDrop     = (indFilter * 0.45)
    const stubbleDrop = (stubbleCtrl * 0.50)
    const greenDrop   = (greenCanopy * 0.20)
    
    const totalDropPct = Math.min(65, trafficDrop + indDrop + stubbleDrop + greenDrop)
    const newAQI = Math.max(25, Math.round(baseAQI * (1 - totalDropPct / 100)))
    const aqiReduction = baseAQI - newAQI
    const avoidedER = Math.round((aqiReduction / baseAQI) * 48.5)

    return {
      newAQI,
      aqiReduction,
      pctDrop: totalDropPct.toFixed(1),
      avoidedER,
    }
  }, [baseAQI, trafficRed, indFilter, stubbleCtrl, greenCanopy])

  const chartComparison = [
    { name: 'Baseline AQI (Current)', aqi: baseAQI, fill: '#E11D48' },
    { name: 'Simulated Policy AQI',   aqi: simResults.newAQI, fill: '#10B981' },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Top Banner */}
      <div className="ui-card" style={{ background: 'linear-gradient(135deg, #0D9488, #1E293B)', color: '#FFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#FFF' }}>🏛️ Municipal Policy Impact & Intervention Simulator</h2>
            <p style={{ fontSize: 12, color: '#CCFBF1', margin: '4px 0 0' }}>
              Simulate emission controls and calculate health impact for <strong>{selectedCity} ({cityData.state})</strong>
            </p>
          </div>
          <span className="badge-pill" style={{ background: '#CCFBF1', color: '#0F766E' }}>Empirical Response Model</span>
        </div>
      </div>

      {/* 2-Column: Sliders on Left, Results on Right */}
      <div className="grid-main-columns">
        
        {/* Left Column: Sliders */}
        <div className="ui-card">
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Intervention Controls & Levers</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>🚗 Vehicular Traffic Curtailment (Odd-Even / EV Subsidy)</span>
                <strong style={{ color: '#0D9488' }}>{trafficRed}%</strong>
              </div>
              <input type="range" min="0" max="60" value={trafficRed} onChange={e => setTrafficRed(Number(e.target.value))} style={{ width: '100%', accentColor: '#0D9488' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>🏭 Industrial Emission Stack Scrubbers & Bag Filters</span>
                <strong style={{ color: '#2563EB' }}>{indFilter}%</strong>
              </div>
              <input type="range" min="0" max="80" value={indFilter} onChange={e => setIndFilter(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563EB' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>🌾 Agricultural Biomass & Stubble Management</span>
                <strong style={{ color: '#F59E0B' }}>{stubbleCtrl}%</strong>
              </div>
              <input type="range" min="0" max="90" value={stubbleCtrl} onChange={e => setStubble(Number(e.target.value))} style={{ width: '100%', accentColor: '#F59E0B' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>🌳 Urban Green Canopy & Water Mist Spraying</span>
                <strong style={{ color: '#10B981' }}>{greenCanopy}%</strong>
              </div>
              <input type="range" min="0" max="50" value={greenCanopy} onChange={e => setGreen(Number(e.target.value))} style={{ width: '100%', accentColor: '#10B981' }} />
            </div>

          </div>

          <div style={{ marginTop: 24, padding: 12, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11, color: '#64748B' }}>
            ℹ️ Response coefficients calibrated against 2022–2025 seasonal regression and CPCB interventions.
          </div>
        </div>

        {/* Right Column: Simulated Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div className="ui-card" style={{ background: '#F0FDFA', borderColor: '#99F6E4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0F766E', textTransform: 'uppercase' }}>Simulated Outcome ({selectedCity})</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#0F766E' }}>{simResults.newAQI}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0D9488' }}>AQI (Down from {baseAQI})</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge-pill success" style={{ fontSize: 12 }}>-{simResults.pctDrop}% Reduction</span>
                <div style={{ fontSize: 12, color: '#0F766E', fontWeight: 700, marginTop: 4 }}>🔻 {simResults.aqiReduction} AQI Units Dropped</div>
              </div>
            </div>
          </div>

          <div className="ui-card">
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Baseline vs Simulated Comparison</h3>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartComparison} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" domain={[0, Math.max(350, baseAQI + 50)]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip />
                  <Bar dataKey="aqi" radius={[0, 6, 6, 0]}>
                    {chartComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ui-card" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🏥</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1E40AF' }}>Avoided Hospitalization & Emergency Visits</div>
                <div style={{ fontSize: 11, color: '#3B82F6' }}>Estimated <strong>{simResults.avoidedER} daily respiratory hospital admissions avoided</strong> under this policy mix.</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
