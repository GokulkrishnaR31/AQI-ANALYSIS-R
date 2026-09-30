import { useAQI, ALL_STATES, getCitiesForState } from '../context/AQIContext'
import './Header.css'

export default function Header({ activeTab, onTabChange }) {
  const { selectedState, setSelectedState, selectedCity, setSelectedCity } = useAQI()

  // Cities filtered by currently selected state
  const cityOptions = getCitiesForState(selectedState)

  const tabs = [
    { id: 'live',       label: '📍 Live Monitor' },
    { id: 'gis',        label: '🗺️ GIS Map' },
    { id: 'olap',       label: '🧊 OLAP Cube' },
    { id: 'forecast',   label: '🔮 Forecast & Anomalies' },
    { id: 'policy',     label: '🧪 Policy Simulator' },
    { id: 'health',     label: '🏥 Health & Purifier' },
    { id: 'benchmarks', label: '🌍 WHO vs CPCB' },
    { id: 'alerts',     label: '📄 Alerts & Reports' },
  ]

  function handleStateChange(e) {
    const newState = e.target.value
    setSelectedState(newState)
    // City reset is handled by the useEffect in AQIContext
  }

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="header-brand">
          <span className="brand-icon">🌿</span>
          <div>
            <h1 className="brand-title">India Air Quality Intelligence Platform</h1>
            <p className="brand-sub">Real-Time Analytics · GIS Mapping · ML Forecasting · Policy Simulation</p>
          </div>
        </div>

        <div className="header-controls">
          {/* State selector — drives Forecast, Anomalies, Benchmarks AND filters city list */}
          <div className="selector-group">
            <label className="selector-label" htmlFor="global-state-select">State</label>
            <select
              id="global-state-select"
              className="header-select"
              value={selectedState}
              onChange={handleStateChange}
            >
              {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* City selector — filtered by selected state */}
          <div className="selector-group">
            <label className="selector-label" htmlFor="global-city-select">City</label>
            <select
              id="global-city-select"
              className="header-select"
              value={cityOptions.includes(selectedCity) ? selectedCity : cityOptions[0] ?? ''}
              onChange={e => setSelectedCity(e.target.value)}
            >
              {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <span className="badge badge-live">● LIVE</span>
        </div>
      </div>

      <nav className="tab-nav" role="tablist" aria-label="Main navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
