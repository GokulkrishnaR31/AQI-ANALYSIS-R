# AQI Intelligence Platform — Architecture Guide

## Overview

This project has been refactored from a monolithic Shiny app into a **React frontend + R Plumber REST API** architecture.

```
┌─────────────────────────────────┐         ┌──────────────────────────────────┐
│  React Frontend (Vite)          │  fetch   │  R Plumber REST API              │
│  http://localhost:5173          │ ──────→  │  http://localhost:8000           │
│                                 │          │                                  │
│  7 Tab pages                    │          │  13_plumber_api.R                │
│  AQI Context (global state)     │          │  Sources: 10, 11, 12 scripts     │
│  Recharts + react-leaflet       │          │  Data: aqi_clean.rds             │
└─────────────────────────────────┘         │  Models: rf_model, lr_model      │
                                             └──────────────────────────────────┘
```

---

## Quick Start

### Step 1 — Start the R Plumber API

```powershell
# In an R console or terminal:
Rscript scripts/run_api.R
```

- API runs at: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/__docs__/`
- First startup installs missing packages and loads models (~30 seconds)

### Step 2 — Start the React Frontend

```powershell
cd frontend
npm install      # first time only
npm run dev
```

- App runs at: `http://localhost:5173`
- The Vite dev server proxies `/api/*` → `http://localhost:8000`

---

## API Endpoints

| Method | Endpoint | Description | Query / Body |
|--------|----------|-------------|-------------|
| GET | `/live-aqi` | Live AQI from WAQI API | `?city=Delhi` |
| GET | `/forecast` | 7-day Holt-Winters forecast | `?state=Delhi` |
| GET | `/anomalies` | Z-score anomaly spike events | `?state=Delhi` |
| GET | `/benchmarks` | WHO/CPCB compliance % | `?state=Delhi` |
| GET | `/gis-data` | 25 cities + AQI (5min cached) | — |
| GET | `/predict` | ML model prediction | `?month_num=6&pollutant_score=5&...` |
| GET | `/report` | Download HTML executive report | `?state=Delhi` |
| GET | `/states` | List of all states | — |
| POST | `/policy-simulate` | Policy what-if simulation | `{traffic_red, stubble_red, industry_red, base_aqi}` |
| POST | `/aqli-calculate` | Life expectancy loss | `{pm25}` |
| POST | `/purifier-size` | Air purifier CADR sizing | `{room_sqft, outdoor_pm25}` |
| POST | `/telegram-alert` | Dispatch Telegram alert | `{city, aqi}` |

### Example curl requests (test from PowerShell)

```powershell
# Live AQI
Invoke-WebRequest "http://localhost:8000/live-aqi?city=Delhi" | ConvertFrom-Json

# Forecast for Maharashtra
Invoke-WebRequest "http://localhost:8000/forecast?state=Maharashtra" | ConvertFrom-Json

# Policy simulation
Invoke-WebRequest -Method POST -Uri "http://localhost:8000/policy-simulate" `
  -ContentType "application/json" `
  -Body '{"traffic_red":20,"stubble_red":50,"industry_red":15,"base_aqi":280}' | ConvertFrom-Json

# AQLI calculation
Invoke-WebRequest -Method POST -Uri "http://localhost:8000/aqli-calculate" `
  -ContentType "application/json" `
  -Body '{"pm25":85}' | ConvertFrom-Json
```

---

## File Structure

```
rproject/
├── scripts/
│   ├── 10_advanced_analytics.R      # generate_aqi_forecast(), detect_aqi_anomalies(), compute_benchmarks()
│   ├── 11_health_policy_utilities.R # simulate_policy_impact(), calculate_aqli_impact(), calculate_cadr()
│   ├── 12_alert_reporting.R         # send_telegram_aqi_alert(), generate_aqi_html_report()
│   ├── 13_plumber_api.R             # ← NEW: All 12 plumber routes (CORS enabled)
│   └── run_api.R                    # ← NEW: API launcher (Rscript scripts/run_api.R)
│
├── data/
│   ├── aqi_clean.rds                # 235K records, 2022–2025
│   ├── rf_model.rds                 # Random Forest regressor
│   ├── lr_model.rds                 # Linear Regression model
│   └── rf_classifier.rds           # RF multi-class classifier
│
└── frontend/                        # ← NEW: React app
    ├── src/
    │   ├── context/AQIContext.jsx   # Global state/city selector
    │   ├── api/api.js               # Axios typed fetchers
    │   ├── components/
    │   │   ├── Header.jsx           # Top bar + tab nav
    │   │   └── MetricCard.jsx       # Reusable stat cards
    │   └── pages/
    │       ├── LiveMonitor.jsx      # Tab 1
    │       ├── GISMap.jsx           # Tab 2
    │       ├── ForecastAnomalies.jsx # Tab 3
    │       ├── PolicySimulator.jsx  # Tab 4
    │       ├── HealthCalc.jsx       # Tab 5
    │       ├── Benchmarks.jsx       # Tab 6
    │       └── AlertsReports.jsx    # Tab 7
    └── vite.config.js               # /api proxy → :8000
```

---

## Key Design Decisions

### Global State Context
`AQIContext.jsx` holds `selectedState` and `selectedCity`. The **Header** component renders both selectors. Switching state auto-triggers re-fetch in ForecastAnomalies, Benchmarks — fixing the "static tabs" problem from the original Shiny app.

### GIS Cache
The `/gis-data` endpoint fetches live AQI from WAQI API for all 25 cities — this takes ~7 seconds. Results are cached server-side for 5 minutes in a named R list. Subsequent requests within that window return instantly.

### Telegram (Simulated Mode)
`send_telegram_aqi_alert()` runs in simulated mode when no bot token is set. To enable real alerts, update `bot_token` and `chat_id` inside `scripts/12_alert_reporting.R` or pass them as environment variables.

### ML Predict Endpoint
`/predict` uses the saved `rf_model.rds` (trained on 80/20 random split). Features: `month_num`, `monitoring_stations`, `pollutant_score`, `season`, `is_winter`, `is_monsoon`. The `state_mean_aqi` feature is filled with the overall dataset mean as a fallback.

---

## Adding Real Telegram Credentials

Edit `scripts/12_alert_reporting.R`, line 26–27:
```r
send_telegram_aqi_alert <- function(city, aqi_val, status = "Severe",
                                   bot_token = "YOUR_BOT_TOKEN",
                                   chat_id   = "YOUR_CHAT_ID") {
```

Or set environment variables before launching:
```r
Sys.setenv(TELEGRAM_BOT_TOKEN = "...", TELEGRAM_CHAT_ID = "...")
```
