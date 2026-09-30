import axios from 'axios'

// All requests go through the Vite proxy: /api → http://localhost:8000
const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── GET endpoints ──────────────────────────────────────────────
export const fetchLiveAQI   = (city)  => client.get('/live-aqi',   { params: { city } }).then(r => r.data)
export const fetchForecast  = (state) => client.get('/forecast',   { params: { state } }).then(r => r.data)
export const fetchAnomalies = (state) => client.get('/anomalies',  { params: { state } }).then(r => r.data)
export const fetchBenchmarks = (state) => client.get('/benchmarks', { params: { state } }).then(r => r.data)
export const fetchGISData   = ()      => client.get('/gis-data').then(r => r.data)
export const fetchStates    = ()      => client.get('/states').then(r => r.data)
export const fetchPredict   = (params) => client.get('/predict', { params }).then(r => r.data)
export const fetchOLAP      = (params) => client.get('/olap', { params }).then(r => r.data)
export const fetchReport    = (state) => {
  // Report endpoint returns HTML — open directly in new tab
  const url = `/api/report?state=${encodeURIComponent(state)}`
  window.open(url, '_blank')
}

// ── POST endpoints ─────────────────────────────────────────────
export const postPolicySimulate = (body) => client.post('/policy-simulate', body).then(r => r.data)
export const postAQLICalculate  = (body) => client.post('/aqli-calculate',  body).then(r => r.data)
export const postPurifierSize   = (body) => client.post('/purifier-size',   body).then(r => r.data)
export const postTelegramAlert  = (body) => client.post('/telegram-alert',  body).then(r => r.data)

// ── Error extractor ────────────────────────────────────────────
export function getErrorMessage(err) {
  return err?.response?.data?.error ?? err?.message ?? 'Unknown error'
}
