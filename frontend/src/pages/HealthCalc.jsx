import { useState, useMemo } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'

export default function HealthCalc() {
  const { selectedCity } = useAQI()
  const cityData = getCityDetails(selectedCity)
  
  // AQLI State
  const [pm25Input, setPm25Input] = useState(cityData.pm25)
  const [roomSqft, setRoomSqft]   = useState(250)
  const [ceilingFt, setCeilingFt] = useState(10)

  // Recalculate AQLI
  const aqliResults = useMemo(() => {
    const whoStandard = 5.0
    const excess = Math.max(0, pm25Input - whoStandard)
    const yearsLost = (excess * 0.098).toFixed(1)
    const monthsLost = Math.round(yearsLost * 12)

    return {
      yearsLost,
      monthsLost,
      risk: pm25Input > 100 ? 'Severe Health Hazard' : (pm25Input > 50 ? 'High Risk' : 'Moderate Risk'),
    }
  }, [pm25Input])

  // Recalculate CADR
  const cadrResults = useMemo(() => {
    const roomVolumeCuFt = roomSqft * ceilingFt
    const cadrCFM = Math.round((roomVolumeCuFt * 5) / 60)
    const cadrM3H = Math.round(cadrCFM * 1.699)
    const indoorClean = Math.round(pm25Input * 0.12)

    return {
      cadrCFM,
      cadrM3H,
      indoorClean,
    }
  }, [pm25Input, roomSqft, ceilingFt])

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 2-Column Main Layout */}
      <div className="grid-main-columns">
        
        {/* Left: AQLI Life Expectancy Calculator */}
        <div className="ui-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🫁</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>AQLI Life Expectancy Impact Calculator</h2>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>University of Chicago Air Quality Life Index Formula</p>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
              Annual Average PM2.5 Concentration (µg/m³) for {selectedCity}:
            </label>
            <input
              type="number"
              value={pm25Input}
              onChange={e => setPm25Input(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
            />
          </div>

          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>Estimated Longevity Reduction</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#BE123C' }}>{aqliResults.yearsLost}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#E11D48' }}>Years Lost</span>
            </div>
            <div style={{ fontSize: 12, color: '#9F1239', marginTop: 4 }}>
              ≈ <strong>{aqliResults.monthsLost} months</strong> shorter life expectancy compared to WHO guideline standard (5 µg/m³).
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
            🛡️ <strong>Health Advisory:</strong> Long-term sustained exposure to {pm25Input} µg/m³ PM2.5 increases coronary artery disease, stroke, and chronic respiratory illness risk.
          </div>
        </div>

        {/* Right: Room Air Purifier CADR Sizing Tool */}
        <div className="ui-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Smart Air Purifier CADR Sizing Engine</h2>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>AHAM AC-1 Certified Clean Air Delivery Rate Sizing</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Room Area (sq. ft.):</label>
              <input
                type="number"
                value={roomSqft}
                onChange={e => setRoomSqft(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Ceiling Height (ft.):</label>
              <input
                type="number"
                value={ceilingFt}
                onChange={e => setCeilingFt(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Recommended CADR Rating</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#166534' }}>{cadrResults.cadrCFM}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#15803D' }}>CFM ({cadrResults.cadrM3H} m³/h)</span>
            </div>
            <div style={{ fontSize: 12, color: '#14532D', marginTop: 4 }}>
              Delivers <strong>5 Air Changes per Hour (ACH)</strong> in your {roomSqft} sq.ft room.
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Outdoor Ambient PM2.5:</span>
              <strong style={{ color: '#E11D48' }}>{pm25Input} µg/m³</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Expected Indoor PM2.5 with H13 HEPA:</span>
              <strong style={{ color: '#10B981' }}>{cadrResults.indoorClean} µg/m³ (Safe Zone)</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
