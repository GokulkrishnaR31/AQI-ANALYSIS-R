import { useState, Component } from 'react'
import { AQIProvider } from './context/AQIContext'
import Header           from './components/Header'
import LiveMonitor      from './pages/LiveMonitor'
import GISMap           from './pages/GISMap'
import OLAPCube         from './pages/OLAPCube'
import ForecastAnomalies from './pages/ForecastAnomalies'
import PolicySimulator  from './pages/PolicySimulator'
import HealthCalc       from './pages/HealthCalc'
import Benchmarks       from './pages/Benchmarks'
import AlertsReports    from './pages/AlertsReports'

// ── Error boundary so one broken tab doesn't crash the whole app ──────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(err) { return { error: err } }
  componentDidCatch(err, info) { console.error('Tab error:', err, info) }
  render() {
    if (this.state.error) {
      return (
        <div className="error-state" style={{ margin: 24, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <strong>⚠️ This tab encountered an error</strong>
          <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{this.state.error.message}</code>
          <button className="btn btn-ghost" style={{ fontSize: 12, marginTop: 4 }}
            onClick={() => this.setState({ error: null })}>
            🔄 Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Tab page map ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'live',       Component: LiveMonitor },
  { id: 'gis',        Component: GISMap },
  { id: 'olap',       Component: OLAPCube },
  { id: 'forecast',   Component: ForecastAnomalies },
  { id: 'policy',     Component: PolicySimulator },
  { id: 'health',     Component: HealthCalc },
  { id: 'benchmarks', Component: Benchmarks },
  { id: 'alerts',     Component: AlertsReports },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('live')

  // Switch tab and also reset any ErrorBoundary for the newly active tab
  const [tabKey, setTabKey] = useState({})
  function handleTabChange(id) {
    setActiveTab(id)
    // Bump the key to reset this tab's ErrorBoundary if it was in error state
    setTabKey(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }

  return (
    <AQIProvider>
      <div className="app-layout">
        <Header activeTab={activeTab} onTabChange={handleTabChange} />

        <main className="main-content" role="main">
          {TABS.map(({ id, Component }) => (
            /*
             * Keep all tabs mounted (display:none when inactive).
             * This avoids GIS map re-fetch on every tab switch, and
             * avoids Leaflet teardown/remount issues.
             */
            <div
              key={id}
              role="tabpanel"
              aria-labelledby={`tab-${id}`}
              hidden={activeTab !== id}
              style={{ display: activeTab === id ? 'block' : 'none' }}
              className={activeTab === id ? 'fade-in' : ''}
            >
              <ErrorBoundary key={tabKey[id] ?? 0}>
                <Component />
              </ErrorBoundary>
            </div>
          ))}
        </main>

        <footer style={{
          textAlign:  'center',
          padding:    '14px 24px',
          fontSize:   11,
          color:      'var(--text-muted)',
          borderTop:  '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          India AQI Intelligence Platform · R Plumber API + React ·
          2022–2025 · 32 States · 235K records · 34 monitoring cities incl. Northeast India
        </footer>
      </div>
    </AQIProvider>
  )
}
