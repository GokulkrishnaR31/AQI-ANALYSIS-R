import { useState } from 'react'
import { useAQI } from '../context/AQIContext'
import { ALL_STATES } from '../context/AQIContext'
import { postTelegramAlert, fetchReport, getErrorMessage } from '../api/api'

export default function AlertsReports() {
  const { selectedState } = useAQI()

  // Telegram state
  const [tgCity,    setTgCity]    = useState('Delhi')
  const [tgAQI,     setTgAQI]     = useState(340)
  const [tgResult,  setTgResult]  = useState(null)
  const [tgLoading, setTgLoading] = useState(false)
  const [tgError,   setTgError]   = useState(null)

  // Report state
  const [rptState,  setRptState]  = useState('All India')
  const [rptLoading,setRptLoading]= useState(false)

  async function sendAlert() {
    setTgLoading(true); setTgError(null); setTgResult(null)
    try {
      const data = await postTelegramAlert({ city: tgCity, aqi: tgAQI })
      setTgResult(data)
    } catch (e) { setTgError(getErrorMessage(e)) }
    finally     { setTgLoading(false) }
  }

  function downloadReport() {
    setRptLoading(true)
    fetchReport(rptState)
    setTimeout(() => setRptLoading(false), 2000)
  }

  return (
    <div className="fade-in">
      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>

        {/* Telegram Alert Panel */}
        <div className="card">
          <div className="card-title"><span className="icon">📢</span>Dispatch Telegram Alert</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 18 }}>
            Sends an AQI health alert via Telegram. Runs in <strong style={{ color: 'var(--accent)' }}>simulated mode</strong> until
            a real bot token and chat ID are configured in <code style={{ color: '#e6edf3', fontSize: 11 }}>13_plumber_api.R</code>.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="tg-city">Target City</label>
            <input
              type="text"
              id="tg-city"
              className="form-control"
              value={tgCity}
              onChange={e => setTgCity(e.target.value)}
              placeholder="e.g. Delhi"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tg-aqi">Current AQI Value</label>
            <input
              type="number"
              id="tg-aqi"
              className="form-control"
              value={tgAQI}
              min={0}
              max={999}
              onChange={e => setTgAQI(Number(e.target.value))}
            />
          </div>

          {tgError && <div className="error-state" style={{ marginBottom: 12 }}>⚠️ {tgError}</div>}

          <button
            id="btn-send-telegram"
            className="btn btn-danger"
            style={{ width: '100%' }}
            onClick={sendAlert}
            disabled={tgLoading}
          >
            {tgLoading ? '⏳ Dispatching…' : '🚀 Dispatch Telegram Alert'}
          </button>

          {tgResult && !tgLoading && (
            <div style={{
              marginTop: 14,
              background: tgResult.status === 'success'
                ? 'rgba(46,204,113,0.1)' : 'rgba(0,173,181,0.1)',
              border: `1px solid ${tgResult.status === 'success' ? '#2ecc71' : 'var(--accent)'}`,
              borderRadius: 8, padding: 12,
            }}>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: tgResult.status === 'success' ? '#2ecc71' : 'var(--accent)',
                marginBottom: 6,
              }}>
                {tgResult.status === 'success' ? '✅ Alert Dispatched' : '📋 Simulated Alert'}
              </div>
              <pre style={{
                fontSize: 11, color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.5,
              }}>
                {tgResult.message}
              </pre>
            </div>
          )}
        </div>

        {/* HTML Report Download */}
        <div className="card">
          <div className="card-title"><span className="icon">📥</span>Executive HTML Summary Report</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 18 }}>
            Generate a self-contained, downloadable executive intelligence report with key statistics,
            top polluted states, and health advisories for the selected region.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="rpt-state">Select State / Region</label>
            <select
              id="rpt-state"
              className="form-control"
              value={rptState}
              onChange={e => setRptState(e.target.value)}
            >
              {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button
            id="btn-download-report"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={downloadReport}
            disabled={rptLoading}
          >
            {rptLoading ? '⏳ Generating…' : '📥 Download HTML Report'}
          </button>

          <div style={{
            marginTop: 20, padding: 14,
            background: 'var(--bg-elevated)', borderRadius: 8,
            borderLeft: '4px solid var(--info)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--info)', marginBottom: 6 }}>
              📊 Report Contents
            </div>
            <ul style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 2, margin: 0, paddingLeft: 18 }}>
              <li>Average, max & min AQI summary</li>
              <li>Top 5 most polluted states</li>
              <li>Total observation count</li>
              <li>Health advisory summary</li>
              <li>Generated date & region stamp</li>
            </ul>
          </div>

          <div style={{
            marginTop: 14, padding: 12,
            background: 'var(--bg-elevated)', borderRadius: 8,
            borderLeft: '4px solid var(--accent)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
              🌐 Current Global Selection
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              The top bar state selector is currently set to <strong style={{ color: 'var(--text-primary)' }}>{selectedState}</strong>.
              The report selector above is independent — choose your target region above.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
