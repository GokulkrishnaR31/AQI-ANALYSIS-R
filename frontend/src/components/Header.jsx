import { useState, useEffect } from 'react'
import { useAQI, ALL_STATES, getCitiesForState } from '../context/AQIContext'
import './Header.css'

export default function Header({ activeTab, onTabChange }) {
  const { selectedState, setSelectedState, selectedCity, setSelectedCity } = useAQI()
  const [timeStr, setTimeStr] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const cityOptions = getCitiesForState(selectedState) || ['Delhi']

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST')
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'live',        label: 'Live Monitor',         icon: '📍', desc: 'Real-time telemetry, 6 criteria pollutants & state rankings' },
    { id: 'gis',         label: 'GIS Map',              icon: '🗺️', desc: 'Interactive spatial dispersion map with 34 CAAQMS stations' },
    { id: 'olap',        label: 'OLAP Cube',            icon: '🧊', desc: 'Multi-dimensional BI analytics, roll-up, drill-down & pivot matrix' },
    { id: 'forecast',    label: 'Forecast & Anomalies', icon: '📈', desc: '7-day ARIMA & ML predictive trajectory with anomaly logs' },
    { id: 'policy',      label: 'Policy Simulator',     icon: '🌱', desc: 'Simulate vehicular & industrial emission controls on city AQI' },
    { id: 'health',      label: 'Health & Purifier',    icon: '🛡️', desc: 'AQLI life expectancy loss & room air purifier CADR sizing' },
    { id: 'benchmarks',  label: 'WHO vs CPCB',          icon: '🌐', desc: 'National vs global air quality standards & compliance metrics' },
    { id: 'alerts',      label: 'Alerts & Reports',     icon: '📊', desc: 'Automated executive CPCB report generator & telemetry alerts' },
  ]

  const handleSelectTab = (tabId) => {
    onTabChange(tabId)
    setMenuOpen(false)
  }

  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0]

  return (
    <>
      <header className="clean-pro-header">
        <div className="header-container">
          
          {/* Left: Hamburger + Brand */}
          <div className="header-left">
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation Menu"
              title="Open Navigation Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <div className="pro-brand">
              <div className="brand-icon-shield">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M8 11h8"/>
                  <path d="M8 15h6"/>
                </svg>
              </div>
              <div>
                <div className="brand-title-wrap">
                  <h1 className="brand-title">India Air Quality Intelligence Platform</h1>
                  <span className="badge-vpro">v2.0-PRO</span>
                </div>
                <div className="brand-sub-badge">
                  <span className="active-tab-indicator">{activeTabObj.icon} {activeTabObj.label}</span>
                  <span className="sub-sep">•</span>
                  <span className="sub-text">Real-Time Analytics & ML Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls, Telemetry & Time */}
          <div className="header-right">
            <div className="select-field">
              <label className="select-label">STATE SELECTION</label>
              <select
                className="pro-select"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
              >
                <option value="All India">All India (Aggregated)</option>
                {Array.isArray(ALL_STATES) && ALL_STATES.filter(s => s !== 'All India').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="select-field">
              <label className="select-label">STATION / URBAN CENTER</label>
              <select
                className="pro-select"
                value={cityOptions.includes(selectedCity) ? selectedCity : cityOptions[0] ?? 'Delhi'}
                onChange={e => setSelectedCity(e.target.value)}
              >
                {cityOptions.map(c => (
                  <option key={c} value={c}>{c === 'Delhi' ? 'Delhi (NCR Composite)' : c}</option>
                ))}
              </select>
            </div>

            <button className="btn-telemetry" onClick={() => handleSelectTab('live')}>
              <span className="pulse-dot red"></span>
              LIVE TELEMETRY
            </button>

            <div className="pro-clock-badge">
              <div className="clock-time">{timeStr || '01:45:00 IST'}</div>
              <div className="clock-sync">
                <span className="pulse-dot green" style={{ width: 6, height: 6 }}></span>
                synced 2m ago
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Hamburger Slide-out Drawer */}
      {menuOpen && (
        <div className="drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            
            <div className="drawer-header">
              <div className="drawer-brand">
                <div className="brand-icon-shield" style={{ width: 34, height: 34 }}>
                  <span style={{ fontSize: 18 }}>🍃</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>Navigation Modules</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Select an analytical module</div>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <div className="drawer-menu-list">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id
                return (
                  <div
                    key={tab.id}
                    className={`drawer-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectTab(tab.id)}
                  >
                    <div className="menu-icon-box">{tab.icon}</div>
                    <div className="menu-text-wrap">
                      <div className="menu-item-title">
                        <span>{tab.label}</span>
                        {isActive && <span className="active-pill">ACTIVE</span>}
                      </div>
                      <div className="menu-item-desc">{tab.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="drawer-footer">
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>MoEFCC / CPCB & OpenAQ • 235K Records</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>R Plumber API + React Full-Stack Engine</div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
