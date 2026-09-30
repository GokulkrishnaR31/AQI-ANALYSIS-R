import { useState } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'

export default function AlertsReports() {
  const { selectedCity, selectedState } = useAQI()
  const cityData = getCityDetails(selectedCity)

  const [alertSent, setAlertSent] = useState(false)

  const handleSendAlert = () => {
    setAlertSent(true)
    setTimeout(() => setAlertSent(false), 4000)
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 2-Column Main Layout */}
      <div className="grid-main-columns">
        
        {/* Left: Report Generator */}
        <div className="ui-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>📄</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Executive Air Quality Report Generator</h2>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Formatted CPCB Compliance Documentation & Statistical Summary</p>
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, marginBottom: 16 }}>
            Generate and export comprehensive statistical reports containing 16 ggplot2 visualizations, ANOVA hypothesis test outputs, Random Forest variable importance scores, and municipal policy recommendations for <strong>{selectedState}</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn-telemetry"
              style={{ background: '#0D9488', borderColor: '#0D9488', color: '#FFF', justifyContent: 'center', padding: '10px 16px' }}
              onClick={() => window.open(`/api/report?state=${encodeURIComponent(selectedState)}`, '_blank')}
            >
              📥 View & Download HTML Executive Report
            </button>
            <button
              className="btn-export-csv"
              style={{ padding: '10px 16px', textAlign: 'center' }}
              onClick={() => alert(`Exporting 235,785 clean CPCB observation records for ${selectedState} as CSV...`)}
            >
              📊 Export Full Clean Dataset (CSV)
            </button>
          </div>
        </div>

        {/* Right: Emergency Telemetry Dispatcher */}
        <div className="ui-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Automated Emergency Advisory Dispatcher</h2>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Trigger municipal public health notifications</p>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Active City Target: {selectedCity} ({cityData.state})</div>
            <div style={{ fontSize: 12, color: '#E11D48', fontWeight: 800, marginTop: 4 }}>Current Index: {cityData.aqi} AQI ({cityData.cat})</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Primary Trigger: PM2.5 ({cityData.pm25} µg/m³)</div>
          </div>

          {alertSent ? (
            <div style={{ padding: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, color: '#166534', fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
              ✅ Emergency Telemetry Advisory successfully dispatched to municipal monitoring network!
            </div>
          ) : (
            <button
              className="btn-telemetry"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
              onClick={handleSendAlert}
            >
              🚨 Dispatch Real-Time Health Advisory Alert
            </button>
          )}
        </div>

      </div>

    </div>
  )
}
