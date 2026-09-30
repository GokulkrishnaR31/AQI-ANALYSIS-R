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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32, background: '#FFF1F2', border: '1px solid #FECDD3',
          borderRadius: 12, margin: 24, color: '#BE123C',
        }}>
          <h2 style={{ marginBottom: 8, fontSize: 18 }}>Component Error</h2>
          <p style={{ fontSize: 13, marginBottom: 12 }}>{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#E11D48', color: '#fff', border: 'none',
              borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Retry Component
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('live')

  const renderContent = () => {
    switch (activeTab) {
      case 'live':       return <LiveMonitor />
      case 'gis':        return <GISMap />
      case 'olap':       return <OLAPCube />
      case 'forecast':   return <ForecastAnomalies />
      case 'policy':     return <PolicySimulator />
      case 'health':     return <HealthCalc />
      case 'benchmarks': return <Benchmarks />
      case 'alerts':     return <AlertsReports />
      default:           return <LiveMonitor />
    }
  }

  return (
    <AQIProvider>
      <div className="app-container">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-content">
          <ErrorBoundary key={activeTab}>
            {renderContent()}
          </ErrorBoundary>
        </main>
        <footer className="platform-footer">
          <div className="footer-left">
            <span className="pulse-dot green" style={{ width: 7, height: 7 }}></span>
            <span>India AQI Intelligence Platform • R Plumber API + React Kernel Engine • 2022–2025</span>
          </div>
          <div className="footer-right">
            <span>MoEFCC / CPCB & OpenAQ Aggregation • 32 States • 235K records • 81 continuous monitoring stations</span>
          </div>
        </footer>
      </div>
    </AQIProvider>
  )
}
