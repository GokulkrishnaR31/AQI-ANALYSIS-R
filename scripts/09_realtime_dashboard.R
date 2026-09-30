# ============================================================
# PHASE 9: REAL-TIME & ADVANCED FEATURE SHINY DASHBOARD
# Project: Air Quality Index (AQI) Analysis and Prediction
# ============================================================

required_pkgs <- c("shiny", "ggplot2", "dplyr", "plotly", "httr",
                   "jsonlite", "lubridate", "DT", "leaflet")
missing <- required_pkgs[!required_pkgs %in% installed.packages()[, "Package"]]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(shiny)
library(ggplot2)
library(dplyr)
library(plotly)
library(httr)
library(jsonlite)
library(lubridate)
library(DT)
library(leaflet)

setwd("G:/rproject")

# Source helper scripts
source("scripts/10_advanced_analytics.R")
source("scripts/11_health_policy_utilities.R")
source("scripts/12_alert_reporting.R")

WAQI_TOKEN <- "7628162b0f9d8c0d4ed04f2559ca27c8acadb15b"

# Load data assets safely
aqi_hist   <- readRDS("data/aqi_clean.rds")
state_list <- sort(unique(as.character(aqi_hist$state)))

# Top 15 most polluted states for clean boxplot rendering without text overlap
top_15_states_list <- aqi_hist %>%
  group_by(state) %>%
  summarise(mean_aqi = mean(aqi_value, na.rm = TRUE), .groups = "drop") %>%
  arrange(desc(mean_aqi)) %>%
  head(15) %>%
  pull(state)

aqi_top15 <- aqi_hist %>%
  filter(state %in% top_15_states_list)

# Pre-computed coordinates for major Indian cities for GIS Mapping
city_coords <- data.frame(
  city = c("Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru",
           "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
           "Kanpur", "Nagpur", "Indore", "Bhopal", "Patna",
           "Varanasi", "Agra", "Gurgaon", "Noida", "Surat",
           "Visakhapatnam", "Coimbatore", "Kochi", "Chandigarh", "Amritsar"),
  lat = c(28.6139, 19.0760, 13.0827, 22.5726, 12.9716,
          17.3850, 23.0225, 18.5204, 26.9124, 26.8467,
          26.4499, 21.1458, 22.7196, 23.2599, 25.5941,
          25.3176, 27.1767, 28.4595, 28.5355, 21.1702,
          17.6868, 11.0168, 9.9312, 30.7333, 31.6340),
  lng = c(77.2090, 72.8777, 80.2707, 88.3639, 77.5946,
          78.4867, 72.5714, 73.8567, 75.7873, 80.9462,
          80.3319, 79.0882, 75.8577, 77.4126, 85.1376,
          82.9739, 78.0081, 77.0266, 77.3910, 72.8311,
          83.2185, 76.9558, 76.2673, 76.7794, 74.8723)
)

aqi_colors <- c(
  "Good"="#2ecc71", "Satisfactory"="#a8e063", "Moderate"="#f39c12",
  "Poor"="#e67e22", "Very Poor"="#e74c3c", "Severe"="#8e1a1a", "Unknown"="#999"
)

fetch_live_aqi <- function(city, token) {
  tryCatch({
    url <- paste0("https://api.waqi.info/feed/", URLencode(city), "/?token=", token)
    response <- GET(url, timeout(6))
    data <- fromJSON(content(response, "text", encoding="UTF-8"), simplifyVector = FALSE)
    if (data$status != "ok") return(NULL)
    d <- data$data
    get_p <- function(iaqi, name) {
      v <- iaqi[[name]]$v
      if (is.null(v)) NA_real_ else as.numeric(v)
    }
    iaqi <- d$iaqi
    list(
      city        = city,
      aqi         = as.numeric(d$aqi),
      pollutant   = ifelse(is.null(d$dominentpol), "N/A", d$dominentpol),
      pm25        = get_p(iaqi, "pm25"),
      pm10        = get_p(iaqi, "pm10"),
      temperature = get_p(iaqi, "t"),
      humidity    = get_p(iaqi, "h"),
      wind_speed  = get_p(iaqi, "w"),
      time        = format(Sys.time(), "%H:%M:%S"),
      status      = case_when(
        as.numeric(d$aqi) <= 50  ~ "Good",
        as.numeric(d$aqi) <= 100 ~ "Satisfactory",
        as.numeric(d$aqi) <= 200 ~ "Moderate",
        as.numeric(d$aqi) <= 300 ~ "Poor",
        as.numeric(d$aqi) <= 400 ~ "Very Poor",
        TRUE                     ~ "Severe"
      )
    )
  }, error = function(e) NULL)
}

# Helper to apply unified dark styling to Plotly plots
style_dark_plotly <- function(p) {
  p %>% layout(
    paper_bgcolor = '#161b22',
    plot_bgcolor  = '#161b22',
    font = list(color = '#e6edf3', family = 'Inter, sans-serif'),
    xaxis = list(gridcolor = '#21262d', zerolinecolor = '#21262d', tickfont = list(color = '#8b949e')),
    yaxis = list(gridcolor = '#21262d', zerolinecolor = '#21262d', tickfont = list(color = '#8b949e'))
  )
}

# ============================================================
# UI DEFINITION
# ============================================================
ui <- fluidPage(
  tags$head(tags$style(HTML("
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    body { background:#0d1117; font-family:'Inter',sans-serif; color:#e6edf3; margin:0; padding-bottom:30px; }
    .header {
      background: linear-gradient(135deg, #1f2937, #111827);
      padding: 18px 28px; border-bottom: 2px solid #00adb5;
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom: 15px;
    }
    .header h1 { margin:0; font-size:22px; color:#fff; font-weight:700; }
    .header p { margin:2px 0 0; color:#94a3b8; font-size:12px; }
    .badge-live { background:#e94560; color:#fff; font-size:11px; padding:4px 12px; border-radius:20px; font-weight:700; }
    .card-panel { background:#161b22; border:1px solid #30363d; border-radius:12px; padding:20px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,0.3); }
    .metric-val { font-size:32px; font-weight:800; color:#38bdf8; }
    .metric-lbl { color:#8b949e; font-size:11px; text-transform:uppercase; letter-spacing:1px; }
    .nav-tabs > li > a { color:#8b949e; font-weight:600; border:none; background:transparent; font-size:13px; }
    .nav-tabs > li.active > a { color:#00adb5; border-bottom:3px solid #00adb5; background:transparent; }
    .btn-action { background:linear-gradient(135deg, #00adb5, #007b83); color:#fff; border:none; border-radius:8px; padding:10px 18px; font-weight:600; cursor:pointer; }
    .btn-action:hover { opacity:0.9; }
    
    /* Dark Theme DataTables */
    .dataTables_wrapper { color: #e6edf3 !important; }
    table.dataTable tbody tr { background-color: #161b22 !important; color: #e6edf3 !important; }
    table.dataTable thead th { background-color: #0d1117 !important; color: #38bdf8 !important; border-bottom: 1px solid #30363d !important; }
    .dataTables_info, .dataTables_paginate { color: #8b949e !important; }
  "))),
  
  div(class="header",
    div(
      h1("🌿 India Air Quality Intelligence Platform"),
      p("Real-Time Analytics, GIS Mapping, Policy Simulations & Health Forecasts")
    ),
    span(class="badge-live", "● LIVE SYSTEM ONLINE")
  ),
  
  tabsetPanel(id="main_tabs",
    
    # ----------------------------------------------------
    # TAB 1: LIVE & STATION MONITOR
    # ----------------------------------------------------
    tabPanel("📍 Live Monitor",
      br(),
      fluidRow(
        column(4,
          div(class="card-panel",
            h4("🌆 Select City"),
            selectInput("live_city", "Choose City:", choices = city_coords$city, selected = "Delhi"),
            actionButton("btn_refresh", "🔄 Fetch Live AQI", class="btn-action"),
            br(), br(),
            uiOutput("live_card_ui")
          )
        ),
        column(8,
          div(class="card-panel",
            h4("📊 Top 15 Most Polluted States (AQI Distribution)"),
            plotlyOutput("plot_state_box", height = "420px")
          )
        )
      )
    ),
    
    # ----------------------------------------------------
    # TAB 2: GIS INTERACTIVE MAP
    # ----------------------------------------------------
    tabPanel("🗺️ GIS Interactive Map",
      br(),
      div(class="card-panel",
        h4("🗺️ Spatial Air Quality Monitoring Map"),
        p("Click any station marker to inspect city location coordinates and real-time monitoring coverage."),
        leafletOutput("gis_map", height = "520px")
      )
    ),
    
    # ----------------------------------------------------
    # TAB 3: FORECAST & ANOMALY DETECTOR
    # ----------------------------------------------------
    tabPanel("🔮 Forecast & Anomalies",
      br(),
      fluidRow(
        column(7,
          div(class="card-panel",
            h4("📈 7-Day AQI Trend Forecast"),
            plotlyOutput("plot_forecast", height = "380px")
          )
        ),
        column(5,
          div(class="card-panel",
            h4("🚨 Historical Anomaly Spike Events"),
            DTOutput("tbl_anomalies")
          )
        )
      )
    ),
    
    # ----------------------------------------------------
    # TAB 4: WHAT-IF POLICY SIMULATOR
    # ----------------------------------------------------
    tabPanel("🧪 Policy Simulator",
      br(),
      fluidRow(
        column(4,
          div(class="card-panel",
            h4("⚙️ Policy Interventions"),
            sliderInput("sim_traffic", "Vehicular Traffic Reduction (%):", 0, 50, 20),
            sliderInput("sim_stubble", "Stubble Burning Mitigation (%):", 0, 100, 50),
            sliderInput("sim_industry", "Industrial Emission Control (%):", 0, 40, 15),
            numericInput("sim_base_aqi", "Baseline City AQI:", value = 280, min = 50, max = 500)
          )
        ),
        column(8,
          div(class="card-panel",
            h4("🎯 Simulation Impact Results"),
            uiOutput("policy_results_ui")
          )
        )
      )
    ),
    
    # ----------------------------------------------------
    # TAB 5: HEALTH IMPACT & PURIFIER CALC
    # ----------------------------------------------------
    tabPanel("🏥 Health & Purifier Calc",
      br(),
      fluidRow(
        column(6,
          div(class="card-panel",
            h4("⏳ Life Expectancy Loss Calculator (AQLI)"),
            numericInput("aqli_pm25_input", "Current PM2.5 Concentration (µg/m³):", value = 85, min = 5, max = 500),
            uiOutput("aqli_results_ui")
          )
        ),
        column(6,
          div(class="card-panel",
            h4("🏠 Air Purifier CADR Calculator"),
            numericInput("purifier_room_sqft", "Room Area (Square Feet):", value = 250, min = 50, max = 2000),
            numericInput("purifier_outdoor_pm25", "Outdoor PM2.5 (µg/m³):", value = 110, min = 10, max = 500),
            uiOutput("purifier_results_ui")
          )
        )
      )
    ),
    
    # ----------------------------------------------------
    # TAB 6: WHO VS CPCB BENCHMARK
    # ----------------------------------------------------
    tabPanel("🌍 WHO vs CPCB Benchmarks",
      br(),
      div(class="card-panel",
        h4("⚖️ Air Quality Compliance Standards"),
        plotlyOutput("plot_benchmarks", height = "380px")
      )
    ),
    
    # ----------------------------------------------------
    # TAB 7: ALERTS & EXECUTIVE REPORT
    # ----------------------------------------------------
    tabPanel("📄 Alerts & Executive Report",
      br(),
      fluidRow(
        column(6,
          div(class="card-panel",
            h4("📢 Trigger Telegram Alert"),
            textInput("tg_city", "Target City:", "Delhi"),
            numericInput("tg_aqi", "Current AQI Value:", 340),
            actionButton("btn_send_tg", "🚀 Dispatch Telegram Alert", class="btn-action"),
            br(), br(),
            verbatimTextOutput("tg_status_out")
          )
        ),
        column(6,
          div(class="card-panel",
            h4("📥 Executive HTML Summary Report"),
            p("Generate and download a self-contained executive intelligence summary report."),
            selectInput("rpt_state", "Select State / Region:", choices = c("All India", state_list)),
            downloadButton("btn_download_html", "📥 Download HTML Executive Report", class="btn-action")
          )
        )
      )
    )
  )
)

# ============================================================
# SERVER LOGIC
# ============================================================
server <- function(input, output, session) {
  
  # Reactive live AQI fetcher
  live_data <- eventReactive(input$btn_refresh, {
    fetch_live_aqi(input$live_city, WAQI_TOKEN)
  }, ignoreNULL = FALSE)
  
  output$live_card_ui <- renderUI({
    res <- live_data()
    if (is.null(res)) {
      return(div(style="color:#ef4444;", "⚠️ Unable to fetch live API data. Rate limit or city offline."))
    }
    col <- aqi_colors[res$status]
    div(style=paste0("border-left: 5px solid ", col, "; padding-left:15px;"),
      h3(style="margin:0; font-size:36px; font-weight:800; color:#fff;", res$aqi),
      p(style=paste0("color:", col, "; font-weight:700; font-size:16px; margin:2px 0;"), res$status),
      p(style="color:#8b949e; font-size:12px;", paste("Dominant Pollutant:", res$pollutant)),
      p(style="color:#8b949e; font-size:12px;", paste("Temp:", res$temperature, "°C | Humidity:", res$humidity, "%"))
    )
  })
  
  # Clean, spacious Top 15 States Boxplot with Dark Theme
  output$plot_state_box <- renderPlotly({
    p <- ggplot(aqi_top15, aes(x = reorder(state, aqi_value, FUN = median), y = aqi_value, fill = state)) +
      geom_boxplot(outlier.size = 0.3, alpha = 0.85, show.legend = FALSE) +
      coord_flip() +
      theme_minimal() +
      theme(
        legend.position = "none",
        text = element_text(color="#e6edf3", family = "Inter"),
        axis.text = element_text(color="#8b949e", size = 10),
        panel.grid = element_line(color="#21262d")
      ) +
      labs(x = "", y = "AQI Value")
    
    style_dark_plotly(ggplotly(p))
  })
  
  # GIS Leaflet Map with robust tile fallback
  output$gis_map <- renderLeaflet({
    map <- leaflet(data = city_coords)
    
    # Try loading CartoDB Dark Matter tiles, fallback to standard OpenStreetMap if provider unavailable
    tryCatch({
      map <- map %>% addProviderTiles("CartoDB.DarkMatter")
    }, error = function(e) {
      map <- map %>% addTiles()
    })
    
    map %>%
      addCircleMarkers(
        lng = ~lng, lat = ~lat,
        popup = ~paste0("<b>City:</b> ", city, "<br><b>Lat:</b> ", lat, "<br><b>Lng:</b> ", lng),
        radius = 8,
        color = "#00adb5",
        stroke = FALSE, fillOpacity = 0.85
      )
  })
  
  # Forecast Plot
  output$plot_forecast <- renderPlotly({
    fc <- readRDS("data/aqi_7day_forecast.rds")
    p <- ggplot(fc, aes(x = date, y = predicted_aqi)) +
      geom_line(color = "#38bdf8", linewidth = 1.2) +
      geom_point(color = "#f43f5e", size = 3) +
      geom_ribbon(aes(ymin = lower_bound, ymax = upper_bound), fill = "#38bdf8", alpha = 0.2) +
      theme_minimal() +
      theme(
        text = element_text(color="#e6edf3", family = "Inter"),
        axis.text = element_text(color="#8b949e"),
        panel.grid = element_line(color="#21262d")
      ) +
      labs(x = "Date", y = "Predicted AQI")
    
    style_dark_plotly(ggplotly(p))
  })
  
  output$tbl_anomalies <- renderDT({
    anom <- readRDS("data/aqi_anomalies.rds") %>%
      filter(is_anomaly) %>%
      select(date, mean_aqi, event_type) %>%
      arrange(desc(mean_aqi))
    datatable(anom, options = list(pageLength = 5, dom = 'tip'), rownames = FALSE)
  })
  
  # Policy Simulation Reactive
  output$policy_results_ui <- renderUI({
    res <- simulate_policy_impact(input$sim_traffic, input$sim_stubble, input$sim_industry, input$sim_base_aqi)
    div(
      div(class="metric-lbl", "Simulated New AQI Level"),
      div(class="metric-val", style="color:#00adb5;", res$simulated_aqi),
      p(style="color:#2ecc71; font-weight:700; font-size:15px;", paste("Total AQI Reduction:", res$aqi_drop, "points (", res$pct_reduction, "%)")),
      p(style="color:#e6edf3;", paste("Hospital Visits Avoided per 100k Population:", res$er_visits_avoided)),
      p(style="color:#f39c12; font-weight:600;", paste("New Air Quality Hazard Status:", res$new_status))
    )
  })
  
  # AQLI Calculation Reactive
  output$aqli_results_ui <- renderUI({
    res <- calculate_aqli_impact(input$aqli_pm25_input)
    div(style="margin-top:15px;",
      div(class="metric-lbl", "Estimated Life Expectancy Loss"),
      div(class="metric-val", style="color:#f43f5e;", paste(res$years_lost, "Years")),
      p(style="color:#cbd5e1; font-weight:600;", res$risk_level),
      p(style="color:#8b949e; font-size:13px;", res$advisory)
    )
  })
  
  # Purifier Sizing Reactive
  output$purifier_results_ui <- renderUI({
    res <- calculate_cadr(input$purifier_room_sqft, input$purifier_outdoor_pm25)
    div(style="margin-top:15px;",
      div(class="metric-lbl", "Required Air Purifier CADR"),
      div(class="metric-val", style="color:#38bdf8;", paste(res$cadr_m3h, "m³/h (", res$cadr_cfm, "CFM)")),
      p(style="color:#e74c3c;", paste("Indoor PM2.5 without Purifier:", res$indoor_no_filter, "µg/m³")),
      p(style="color:#2ecc71; font-weight:700;", paste("Indoor PM2.5 with HEPA Filter:", res$indoor_with_hepa, "µg/m³"))
    )
  })
  
  # Benchmark Chart
  output$plot_benchmarks <- renderPlotly({
    stats <- readRDS("data/benchmark_stats.rds")
    df_bm <- data.frame(
      Standard = c("CPCB Safe Standard (AQI ≤ 100)", "WHO Safe Guidelines (AQI ≤ 50)"),
      Compliance_Pct = c(stats$cpcb_compliance_pct, stats$who_compliance_pct)
    )
    p <- ggplot(df_bm, aes(x = Standard, y = Compliance_Pct, fill = Standard)) +
      geom_bar(stat = "identity", width = 0.45, show.legend = FALSE) +
      scale_fill_manual(values = c("#2ecc71", "#e74c3c")) +
      theme_minimal() +
      theme(
        legend.position = "none",
        text = element_text(color="#e6edf3", family = "Inter"),
        axis.text = element_text(color="#8b949e", size = 11)
      ) +
      labs(y = "Compliance Percentage (%)", x = "")
    
    style_dark_plotly(ggplotly(p))
  })
  
  # Telegram Alert Handler
  observeEvent(input$btn_send_tg, {
    res <- send_telegram_aqi_alert(input$tg_city, input$tg_aqi)
    output$tg_status_out <- renderText({ res$message })
  })
  
  # HTML Report Download Handler
  output$btn_download_html <- downloadHandler(
    filename = function() {
      paste0("AQI_Executive_Report_", Sys.Date(), ".html")
    },
    content = function(file) {
      generate_aqi_html_report(file, input$rpt_state)
    }
  )
}

# Launch Dashboard in Web Browser
runApp(shinyApp(ui, server), launch.browser = TRUE)
