import { getAQIColor, getAQIBadgeClass } from '../context/AQIContext'

/**
 * Reusable metric display card
 * Props: value, label, unit?, sub?, color? (css color), status? (for AQI badge)
 */
export function MetricCard({ value, label, unit = '', sub, color, status, id }) {
  const displayColor = color ?? (status ? getAQIColor(status) : 'var(--info)')

  return (
    <div className="metric-card fade-in" id={id}>
      <div className="metric-lbl">{label}</div>
      <div className="metric-val" style={{ color: displayColor }}>
        {value ?? '—'}
        {unit && <span style={{ fontSize: '16px', fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
      </div>
      {status && (
        <span className={`badge ${getAQIBadgeClass(status)}`} style={{ marginTop: 6 }}>
          {status}
        </span>
      )}
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  )
}

/**
 * Full AQI live card with colored left border
 */
export function AQILiveCard({ data }) {
  if (!data) return null
  const color = getAQIColor(data.status)
  return (
    <div style={{
      borderLeft:  `5px solid ${color}`,
      paddingLeft: '16px',
      marginTop:   '12px',
    }}>
      <div style={{ fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {data.aqi}
      </div>
      <div style={{ color, fontWeight: 700, fontSize: 17, margin: '4px 0' }}>
        {data.status}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 6 }}>
        Dominant Pollutant: <strong style={{ color: 'var(--text-primary)' }}>{data.pollutant}</strong>
      </div>
      {data.temperature != null && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
          🌡️ {data.temperature}°C &nbsp;|&nbsp; 💧 {data.humidity}%
          {data.wind_speed != null && <>&nbsp;|&nbsp; 🌬️ {data.wind_speed} m/s</>}
        </div>
      )}
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 6 }}>
        Fetched at {data.fetched_at}
      </div>
    </div>
  )
}
