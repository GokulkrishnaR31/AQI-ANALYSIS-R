import { useState } from 'react'
import { postAQLICalculate, postPurifierSize, getErrorMessage } from '../api/api'
import { MetricCard } from '../components/MetricCard'

function ResultBlock({ title, children }) {
  return (
    <div style={{
      marginTop: 18, background: 'var(--bg-elevated)',
      borderRadius: 10, padding: '16px',
      borderTop: '3px solid var(--accent)',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div className="section-title">{title}</div>
      {children}
    </div>
  )
}

export default function HealthCalc() {
  // AQLI state
  const [pm25,     setPm25]     = useState(85)
  const [aqliRes,  setAqliRes]  = useState(null)
  const [aqliLoad, setAqliLoad] = useState(false)
  const [aqliErr,  setAqliErr]  = useState(null)

  // Purifier state
  const [roomSqft,  setRoomSqft]  = useState(250)
  const [outdoorPm, setOutdoorPm] = useState(110)
  const [purRes,    setPurRes]    = useState(null)
  const [purLoad,   setPurLoad]   = useState(false)
  const [purErr,    setPurErr]    = useState(null)

  async function calcAQLI() {
    setAqliLoad(true); setAqliErr(null)
    try {
      const data = await postAQLICalculate({ pm25 })
      setAqliRes(data)
    } catch (e) { setAqliErr(getErrorMessage(e)) }
    finally     { setAqliLoad(false) }
  }

  async function calcPurifier() {
    setPurLoad(true); setPurErr(null)
    try {
      const data = await postPurifierSize({ room_sqft: roomSqft, outdoor_pm25: outdoorPm })
      setPurRes(data)
    } catch (e) { setPurErr(getErrorMessage(e)) }
    finally     { setPurLoad(false) }
  }

  return (
    <div className="fade-in">
      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>

        {/* AQLI Life Expectancy Calculator */}
        <div className="card">
          <div className="card-title"><span className="icon">⏳</span>Life Expectancy Loss Calculator (AQLI)</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 18 }}>
            Based on University of Chicago AQLI methodology. Every 10 µg/m³ excess PM2.5 above WHO guideline (5 µg/m³)
            reduces life expectancy by ~0.98 years.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="aqli-pm25">Current PM2.5 Concentration (µg/m³)</label>
            <input
              type="number"
              id="aqli-pm25"
              className="form-control"
              value={pm25}
              min={5}
              max={500}
              onChange={e => setPm25(Number(e.target.value))}
            />
          </div>

          {aqliErr && <div className="error-state" style={{ marginBottom: 12 }}>⚠️ {aqliErr}</div>}

          <button
            id="btn-calc-aqli"
            className="btn btn-danger"
            style={{ width: '100%' }}
            onClick={calcAQLI}
            disabled={aqliLoad}
          >
            {aqliLoad ? '⏳ Calculating…' : '🔬 Calculate Health Impact'}
          </button>

          {aqliRes && !aqliLoad && (
            <ResultBlock title="Health Impact Results">
              <div className="grid-2" style={{ gap: 10, marginBottom: 14 }}>
                <MetricCard id="aqli-years"  label="Life Years Lost"  value={aqliRes.years_lost}  unit="yrs" color="var(--danger)" />
                <MetricCard id="aqli-months" label="Months Lost"      value={aqliRes.months_lost} unit="mo"  color="var(--poor)" />
              </div>
              <div style={{
                background: 'var(--bg-base)', borderRadius: 8, padding: 12,
                borderLeft: '4px solid var(--danger)',
              }}>
                <div style={{ fontWeight: 700, color: '#f43f5e', marginBottom: 6 }}>{aqliRes.risk_level}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {aqliRes.advisory}
                </div>
              </div>
            </ResultBlock>
          )}
        </div>

        {/* Air Purifier CADR Calculator */}
        <div className="card">
          <div className="card-title"><span className="icon">🏠</span>Air Purifier CADR Calculator</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 18 }}>
            Calculates required Clean Air Delivery Rate for 5 air changes/hour. Estimates indoor PM2.5
            with and without HEPA filtration (90% efficiency).
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="purifier-sqft">Room Area (Square Feet)</label>
            <input
              type="number"
              id="purifier-sqft"
              className="form-control"
              value={roomSqft}
              min={50}
              max={2000}
              onChange={e => setRoomSqft(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="purifier-pm25">Outdoor PM2.5 (µg/m³)</label>
            <input
              type="number"
              id="purifier-pm25"
              className="form-control"
              value={outdoorPm}
              min={10}
              max={500}
              onChange={e => setOutdoorPm(Number(e.target.value))}
            />
          </div>

          {purErr && <div className="error-state" style={{ marginBottom: 12 }}>⚠️ {purErr}</div>}

          <button
            id="btn-calc-purifier"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={calcPurifier}
            disabled={purLoad}
          >
            {purLoad ? '⏳ Calculating…' : '🔧 Size Air Purifier'}
          </button>

          {purRes && !purLoad && (
            <ResultBlock title="Purifier Sizing Results">
              <div className="grid-2" style={{ gap: 10, marginBottom: 14 }}>
                <MetricCard id="cadr-m3h" label="Required CADR"       value={purRes.cadr_m3h} unit="m³/h"  color="var(--info)" />
                <MetricCard id="cadr-cfm" label="CADR (CFM)"          value={purRes.cadr_cfm} unit="CFM"   color="var(--info)" />
                <MetricCard id="indoor-no-filter"   label="Indoor PM2.5 (No Filter)"  value={purRes.indoor_no_filter}   unit="µg/m³" color="var(--danger)" />
                <MetricCard id="indoor-with-filter" label="Indoor PM2.5 (HEPA)"       value={purRes.indoor_with_hepa}   unit="µg/m³" color="var(--good)" />
              </div>
              <div style={{
                background: 'var(--bg-base)', borderRadius: 8, padding: 12,
                borderLeft: '4px solid var(--accent)',
                fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                Room volume: <strong>{purRes.room_volume_m3} m³</strong> ·
                HEPA filtration reduces indoor PM2.5 by <strong style={{ color: 'var(--good)' }}>~88%</strong>
              </div>
            </ResultBlock>
          )}
        </div>

      </div>
    </div>
  )
}
