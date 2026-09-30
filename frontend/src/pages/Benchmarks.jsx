import { useState } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'

export default function Benchmarks() {
  const { selectedCity } = useAQI()
  const cityData = getCityDetails(selectedCity)

  const benchmarks = [
    { pollutant: 'PM2.5 (Annual)', cpcb: '40 µg/m³', who: '5 µg/m³', actual: `${cityData.pm25} µg/m³`, status: cityData.pm25 > 40 ? 'CPCB Exceeded' : 'CPCB Compliant' },
    { pollutant: 'PM10 (Annual)',  cpcb: '60 µg/m³', who: '15 µg/m³', actual: `${cityData.pm10} µg/m³`, status: cityData.pm10 > 60 ? 'CPCB Exceeded' : 'CPCB Compliant' },
    { pollutant: 'NO2 (Annual)',   cpcb: '40 µg/m³', who: '10 µg/m³', actual: `${cityData.nox} µg/m³`, status: cityData.nox > 40 ? 'Elevated' : 'Compliant' },
    { pollutant: 'SO2 (24-Hour)',  cpcb: '80 µg/m³', who: '40 µg/m³', actual: `${cityData.so2} µg/m³`, status: 'Compliant' },
    { pollutant: 'CO (8-Hour)',    cpcb: '2.0 mg/m³', who: '4.0 mg/m³', actual: `${cityData.co} mg/m³`, status: cityData.co > 2 ? 'Moderate' : 'Compliant' },
    { pollutant: 'O3 (8-Hour)',    cpcb: '100 µg/m³', who: '100 µg/m³', actual: `${cityData.o3} µg/m³`, status: 'Compliant' },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 2 Top Compliance Gauges */}
      <div className="grid-main-columns">
        
        <div className="ui-card" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>National CPCB Compliance Benchmark</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0' }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#D97706' }}>55.5%</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#B45309' }}>Compliant Days (&le;100 AQI)</span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#FDE68A', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: '55.5%', height: '100%', background: '#D97706' }}></div>
          </div>
          <div style={{ fontSize: 11, color: '#92400E', marginTop: 8 }}>Based on 130,868 compliant observations across 235,785 national sensor readings.</div>
        </div>

        <div className="ui-card" style={{ background: '#FFF1F2', borderColor: '#FECDD3' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>Global WHO Guideline Compliance</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0' }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#BE123C' }}>17.8%</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#9F1239' }}>Compliant Days (&le;50 AQI)</span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#FECDD3', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: '17.8%', height: '100%', background: '#E11D48' }}></div>
          </div>
          <div style={{ fontSize: 11, color: '#9F1239', marginTop: 8 }}>Only 41,971 out of 2.35 lakh daily logs satisfy WHO strict clean air standards.</div>
        </div>

      </div>

      {/* Comparison Matrix Table */}
      <div className="ui-card">
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
          Standard Threshold Matrix vs Observed Levels ({selectedCity}, {cityData.state})
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Criteria Pollutant</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>CPCB Indian Limit</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>WHO Global Limit</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Observed Level</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Compliance Status</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>{b.pollutant}</td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>{b.cpcb}</td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>{b.who}</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0F172A' }}>{b.actual}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge-pill ${b.status.includes('Exceeded') ? 'danger' : 'success'}`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
