# ============================================================
# PHASE 13: PLUMBER REST API — AQI Intelligence Platform
# Project: Air Quality Index (AQI) Analysis and Prediction
#
# Exposes all R logic as JSON REST endpoints for React frontend.
# Run with: Rscript scripts/run_api.R
# Default port: 8000
# ============================================================

# ---- Package bootstrap ----
required_pkgs <- c("plumber", "dplyr", "lubridate", "jsonlite",
                   "httr", "randomForest", "readr")
missing_pkgs <- required_pkgs[!required_pkgs %in% installed.packages()[, "Package"]]
if (length(missing_pkgs) > 0) {
  install.packages(missing_pkgs, repos = "https://cloud.r-project.org")
}

library(plumber)
library(dplyr)
library(lubridate)
library(jsonlite)
library(httr)
library(randomForest)

# ============================================================
# STARTUP: Load data & models ONCE (not per-request)
# ============================================================
cat("🚀 Booting AQI Plumber API...\n")

BASE_DIR <- "G:/rproject"
setwd(BASE_DIR)

# Source helper scripts (reuse existing functions, no rewrites)
source("scripts/10_advanced_analytics.R")
source("scripts/11_health_policy_utilities.R")
source("scripts/12_alert_reporting.R")

# Load cleaned dataset
cat("  Loading aqi_clean.rds...\n")
aqi_data <- readRDS("data/aqi_clean.rds")
state_list <- sort(unique(as.character(aqi_data$state)))

# Load trained ML models
cat("  Loading ML models...\n")
rf_model_reg  <- tryCatch(readRDS("data/rf_model.rds"),      error = function(e) NULL)
lr_model_obj  <- tryCatch(readRDS("data/lr_model.rds"),      error = function(e) NULL)
rf_classifier_obj <- tryCatch(readRDS("data/rf_classifier.rds"), error = function(e) NULL)

# WAQI API token
WAQI_TOKEN <- "7628162b0f9d8c0d4ed04f2559ca27c8acadb15b"

# NULL-coalescing helper
`%||%` <- function(x, y) if (!is.null(x) && length(x) > 0 && !is.na(x[1])) x else y

# City name aliases for WAQI API (some cities are indexed under different names)
WAQI_ALIASES <- c(
  "Bengaluru"           = "Bangalore",
  "Kochi"               = "Cochin",
  "Thiruvananthapuram"  = "Trivandrum",
  "Prayagraj"           = "Allahabad",
  "Puducherry"          = "Pondicherry",
  "Mysuru"              = "Mysore",
  "Nashik"              = "Nasik",
  "Vadodara"            = "Baroda",
  "Faridabad"           = "Delhi",        # WAQI usually returns Delhi data
  "Visakhapatnam"       = "Visakhapatnam",
  "Howrah"              = "Kolkata"
)

# Helper: fetch WAQI data for a city, trying alias on failure
fetch_waqi_city <- function(city, token) {
  try_url <- function(name) {
    tryCatch({
      url  <- paste0("https://api.waqi.info/feed/", URLencode(name), "/?token=", token)
      resp <- GET(url, timeout(3))
      dat  <- fromJSON(content(resp, "text", encoding = "UTF-8"), simplifyVector = FALSE)
      if (dat$status == "ok") dat else NULL
    }, error = function(e) NULL)
  }
  
  # 1. Try exact name
  result <- try_url(city)
  if (!is.null(result)) return(result)
  
  # 2. Try known alias
  alias <- WAQI_ALIASES[city]
  if (!is.na(alias) && !is.null(alias)) {
    result <- try_url(alias)
    if (!is.null(result)) return(result)
  }
  
  # 3. Some NE cities: try appending ", India" for disambiguation
  result <- try_url(paste0(city, ", India"))
  return(result)  # NULL if all fail
}

# City coordinates for GIS endpoint (34 cities — includes Northeast India)
CITY_COORDS <- data.frame(
  city = c(
    # Major metros & other cities
    "Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru",
    "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
    "Kanpur", "Nagpur", "Indore", "Bhopal", "Patna",
    "Varanasi", "Agra", "Gurgaon", "Noida", "Surat",
    "Visakhapatnam", "Coimbatore", "Kochi", "Chandigarh", "Amritsar",
    # Northeast India
    "Guwahati", "Shillong", "Imphal", "Agartala",
    "Aizawl", "Kohima", "Dimapur", "Itanagar", "Gangtok"
  ),
  lat  = c(
    28.6139, 19.0760, 13.0827, 22.5726, 12.9716,
    17.3850, 23.0225, 18.5204, 26.9124, 26.8467,
    26.4499, 21.1458, 22.7196, 23.2599, 25.5941,
    25.3176, 27.1767, 28.4595, 28.5355, 21.1702,
    17.6868, 11.0168,  9.9312, 30.7333, 31.6340,
    # Northeast
    26.1445, 25.5788, 24.8170, 23.8315,
    23.7271, 25.6701, 25.9091, 27.0844, 27.3314
  ),
  lng  = c(
    77.2090, 72.8777, 80.2707, 88.3639, 77.5946,
    78.4867, 72.5714, 73.8567, 75.7873, 80.9462,
    80.3319, 79.0882, 75.8577, 77.4126, 85.1376,
    82.9739, 78.0081, 77.0266, 77.3910, 72.8311,
    83.2185, 76.9558, 76.2673, 76.7794, 74.8723,
    # Northeast
    91.7362, 91.8933, 93.9368, 91.2868,
    92.7176, 94.1077, 93.7265, 93.6053, 88.6138
  ),
  stringsAsFactors = FALSE
)

# AQI status classification helper
aqi_status <- function(val) {
  dplyr::case_when(
    val <= 50  ~ "Good",
    val <= 100 ~ "Satisfactory",
    val <= 200 ~ "Moderate",
    val <= 300 ~ "Poor",
    val <= 400 ~ "Very Poor",
    TRUE       ~ "Severe"
  )
}

# Simple in-memory GIS cache (refresh every 5 minutes)
gis_cache      <- list(data = NULL, timestamp = NULL)
GIS_CACHE_SECS <- 300

# ── Precompute OLAP-ready dataset (adds region, season, month columns) ──────
cat("  Building OLAP cube dataset...\n")
aqi_olap <- aqi_data %>%
  mutate(
    year_num   = as.integer(year(date)),
    month_num2 = as.integer(month(date)),
    month_name = as.character(month(date, label = TRUE, abbr = TRUE)),
    season_name = dplyr::case_when(
      month(date) %in% c(12, 1, 2)     ~ "Winter",
      month(date) %in% c(3, 4, 5)      ~ "Spring/Summer",
      month(date) %in% c(6, 7, 8, 9)   ~ "Monsoon",
      TRUE                              ~ "Autumn"
    ),
    region = dplyr::case_when(
      state %in% c("Delhi", "Uttar Pradesh", "Haryana", "Punjab",
                   "Himachal Pradesh", "Uttarakhand", "Chandigarh",
                   "Jammu and Kashmir")                        ~ "North",
      state %in% c("Karnataka", "Tamil Nadu", "Andhra Pradesh",
                   "Telangana", "Kerala", "Puducherry")        ~ "South",
      state %in% c("West Bengal", "Bihar", "Odisha", "Jharkhand") ~ "East",
      state %in% c("Maharashtra", "Gujarat", "Rajasthan", "Goa")  ~ "West",
      state %in% c("Madhya Pradesh", "Chhattisgarh")            ~ "Central",
      state %in% c("Assam", "Meghalaya", "Manipur", "Tripura",
                   "Mizoram", "Nagaland", "Arunachal Pradesh", "Sikkim") ~ "Northeast",
      TRUE ~ "Other"
    )
  )
cat("✅ OLAP dataset ready:", nrow(aqi_olap), "rows,",
    length(unique(aqi_olap$region)), "regions,",
    length(unique(aqi_olap$state)), "states\n")

cat("✅ Startup complete. API ready.\n\n")

# ============================================================
# CORS FILTER — allow React dev server
# ============================================================

#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin",  "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  plumber::forward()
}

# ============================================================
# ENDPOINT 1: GET /live-aqi
# Returns real-time AQI for a given city via WAQI API
# Query: ?city=Delhi
# ============================================================

#* @get /live-aqi
#* @serializer json
function(city = "Delhi", res) {
  result <- tryCatch({
    # Use alias-aware fetch
    data <- fetch_waqi_city(city, WAQI_TOKEN)

    if (is.null(data)) {
      res$status <- 404
      return(list(
        error       = paste("City not found in WAQI database:", city),
        city        = city,
        aqi         = NA,
        status      = "Unknown",
        pollutant   = "N/A",
        fetched_at  = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
      ))
    }

    d    <- data$data
    iaqi <- d$iaqi
    get_p <- function(name) {
      v <- iaqi[[name]]$v
      if (is.null(v)) NA_real_ else as.numeric(v)
    }

    aqi_val <- as.numeric(d$aqi)
    list(
      city        = city,
      aqi         = aqi_val,
      status      = aqi_status(aqi_val),
      pollutant   = ifelse(is.null(d$dominentpol), "N/A", d$dominentpol),
      pm25        = get_p("pm25"),
      pm10        = get_p("pm10"),
      no2         = get_p("no2"),
      temperature = get_p("t"),
      humidity    = get_p("h"),
      wind_speed  = get_p("w"),
      fetched_at  = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
    )
  }, error = function(e) {
    res$status <- 500
    list(error = e$message)
  })
  result
}

# ============================================================
# ENDPOINT 2: GET /forecast
# 7-day Holt-Winters forecast, computed per state
# Query: ?state=Delhi (default: All India)
# ============================================================

#* @get /forecast
#* @serializer json
function(state = "All India", res) {
  tryCatch({
    df <- if (state == "All India" || !(state %in% state_list)) {
      aqi_data
    } else {
      aqi_data %>% filter(.data$state == !!state)
    }

    if (nrow(df) < 10) {
      res$status <- 400
      return(list(error = "Insufficient data for this state"))
    }

    fc <- generate_aqi_forecast(df, forecast_days = 7)
    # Convert dates to character for JSON serialization
    fc$date <- as.character(fc$date)
    as.list(fc)
  }, error = function(e) {
    res$status <- 500
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 3: GET /anomalies
# Z-score anomaly spike events, filtered by state
# Query: ?state=Delhi
# ============================================================

#* @get /anomalies
#* @serializer json
function(state = "All India", res) {
  tryCatch({
    df <- if (state == "All India" || !(state %in% state_list)) {
      aqi_data
    } else {
      aqi_data %>% filter(.data$state == !!state)
    }

    anom <- detect_aqi_anomalies(df) %>%
      filter(is_anomaly) %>%
      arrange(desc(mean_aqi)) %>%
      mutate(date = as.character(date))

    list(
      state      = state,
      total      = nrow(anom),
      anomalies  = lapply(seq_len(nrow(anom)), function(i) as.list(anom[i, ]))
    )
  }, error = function(e) {
    res$status <- 500
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 4: GET /benchmarks
# WHO vs CPCB compliance percentages, filtered by state
# Query: ?state=Delhi
# ============================================================

#* @get /benchmarks
#* @serializer json
function(state = "All India", res) {
  tryCatch({
    df <- if (state == "All India" || !(state %in% state_list)) {
      aqi_data
    } else {
      aqi_data %>% filter(.data$state == !!state)
    }

    stats <- compute_benchmarks(df)
    list(
      state               = state,
      total_observations  = stats$total_obs,
      cpcb_compliance_pct = stats$cpcb_compliance_pct,
      who_compliance_pct  = stats$who_compliance_pct,
      avg_aqi             = stats$avg_aqi,
      max_aqi             = stats$max_aqi
    )
  }, error = function(e) {
    res$status <- 500
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 5: GET /gis-data
# City coordinates + live AQI + status for map coloring
# Cached for 5 minutes to avoid hammering WAQI API
# ============================================================

#* @get /gis-data
#* @serializer json
function(res) {
  # Return cached data if still fresh
  if (!is.null(gis_cache$data) &&
      difftime(Sys.time(), gis_cache$timestamp, units = "secs") < GIS_CACHE_SECS) {
    return(gis_cache$data)
  }

  results <- lapply(CITY_COORDS$city, function(city) {
    aqi_val   <- NA_real_
    status    <- "Unknown"
    pollutant <- "N/A"

    tryCatch({
      data <- fetch_waqi_city(city, WAQI_TOKEN)
      if (!is.null(data) && !is.null(data$data)) {
        aqi_val   <- as.numeric(data$data$aqi)
        status    <- aqi_status(aqi_val)
        pollutant <- ifelse(is.null(data$data$dominentpol), "N/A", data$data$dominentpol)
      }
    }, error = function(e) NULL)

    idx <- which(CITY_COORDS$city == city)
    list(
      city      = city,
      lat       = CITY_COORDS$lat[idx],
      lng       = CITY_COORDS$lng[idx],
      aqi       = aqi_val,
      status    = status,
      pollutant = pollutant
    )
  })

  gis_cache$data      <<- results
  gis_cache$timestamp <<- Sys.time()
  results
}

# ============================================================
# ENDPOINT 6: POST /policy-simulate
# Body: {traffic_red, stubble_red, industry_red, base_aqi}
# Returns simulation impact result
# ============================================================

#* @post /policy-simulate
#* @serializer json
function(req, res) {
  tryCatch({
    body <- fromJSON(req$postBody)
    traffic_red  <- as.numeric(body$traffic_red  %||% 0)
    stubble_red  <- as.numeric(body$stubble_red  %||% 0)
    industry_red <- as.numeric(body$industry_red %||% 0)
    base_aqi     <- as.numeric(body$base_aqi     %||% 250)

    result <- simulate_policy_impact(traffic_red, stubble_red, industry_red, base_aqi)
    result
  }, error = function(e) {
    res$status <- 400
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 7: POST /aqli-calculate
# Body: {pm25}
# Returns life expectancy loss result
# ============================================================

#* @post /aqli-calculate
#* @serializer json
function(req, res) {
  tryCatch({
    body   <- fromJSON(req$postBody)
    pm25   <- as.numeric(body$pm25 %||% 85)
    result <- calculate_aqli_impact(pm25)
    result
  }, error = function(e) {
    res$status <- 400
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 8: POST /purifier-size
# Body: {room_sqft, outdoor_pm25}
# Returns CADR sizing result
# ============================================================

#* @post /purifier-size
#* @serializer json
function(req, res) {
  tryCatch({
    body         <- fromJSON(req$postBody)
    room_sqft    <- as.numeric(body$room_sqft    %||% 250)
    outdoor_pm25 <- as.numeric(body$outdoor_pm25 %||% 110)
    result       <- calculate_cadr(room_sqft, outdoor_pm25)
    result
  }, error = function(e) {
    res$status <- 400
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 9: POST /telegram-alert
# Body: {city, aqi}
# Dispatches Telegram notification (or simulated if no token set)
# ============================================================

#* @post /telegram-alert
#* @serializer json
function(req, res) {
  tryCatch({
    body    <- fromJSON(req$postBody)
    city    <- as.character(body$city %||% "Unknown")
    aqi_val <- as.numeric(body$aqi   %||% 0)
    status  <- aqi_status(aqi_val)
    result  <- send_telegram_aqi_alert(city, aqi_val, status)
    result
  }, error = function(e) {
    res$status <- 400
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 10: GET /report
# Generates and returns HTML executive report inline
# Query: ?state=Delhi (default: All India)
# ============================================================

#* @get /report
#* @serializer contentType list(type="text/html")
function(state = "All India", res) {
  tryCatch({
    tmp_file <- tempfile(fileext = ".html")
    generate_aqi_html_report(tmp_file, state)
    html_content <- paste(readLines(tmp_file, warn = FALSE), collapse = "\n")
    res$setHeader("Content-Disposition",
                  paste0("attachment; filename=\"AQI_Report_", state, "_", Sys.Date(), ".html\""))
    html_content
  }, error = function(e) {
    res$status <- 500
    paste0("<html><body><h1>Error generating report: ", e$message, "</h1></body></html>")
  })
}

# ============================================================
# ENDPOINT 11: GET /predict
# ML model prediction (Random Forest regression)
# Query: ?month_num=6&monitoring_stations=5&pollutant_score=5
#         &season=3&is_winter=0&is_monsoon=1&model=rf
# ============================================================

#* @get /predict
#* @serializer json
function(month_num = 6, monitoring_stations = 5, pollutant_score = 5,
         season = 3, is_winter = 0, is_monsoon = 1,
         model = "rf", res) {
  tryCatch({
    # Lookup state_mean_aqi from data (use overall mean as fallback)
    overall_mean_aqi <- mean(aqi_data$aqi_value, na.rm = TRUE)

    new_data <- data.frame(
      month_num                     = as.numeric(month_num),
      number_of_monitoring_stations = as.numeric(monitoring_stations),
      pollutant_score               = as.numeric(pollutant_score),
      season                        = as.numeric(season),
      is_winter                     = as.integer(is_winter),
      is_monsoon                    = as.integer(is_monsoon),
      state_mean_aqi                = overall_mean_aqi
    )

    if (tolower(model) == "lr" && !is.null(lr_model_obj)) {
      pred <- predict(lr_model_obj, newdata = new_data)
      list(model = "Linear Regression", predicted_aqi = round(as.numeric(pred), 1),
           status = aqi_status(as.numeric(pred)))
    } else if (!is.null(rf_model_reg)) {
      pred <- predict(rf_model_reg, newdata = new_data)
      list(model = "Random Forest", predicted_aqi = round(as.numeric(pred), 1),
           status = aqi_status(as.numeric(pred)))
    } else {
      res$status <- 503
      list(error = "ML models not loaded")
    }
  }, error = function(e) {
    res$status <- 500
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 12: GET /olap
# Multi-Dimensional OLAP Cube Aggregation Engine (BI Analysis)
# Supports Roll-up, Drill-down, Slice, Dice, and Pivot operations
# Query: ?row_dim=region&col_dim=season_name&measure=mean_aqi
# ============================================================

#* @get /olap
#* @serializer json
function(row_dim = "region", col_dim = "season_name", measure = "mean_aqi",
         filter_state = "All India", filter_region = "All",
         filter_season = "All", filter_year = "All",
         filter_pollutant = "All", res) {
  tryCatch({
    # Available valid dimensions
    valid_dims <- c("state", "region", "season_name", "month_name", "year_num", "prominent_pollutant", "status")
    
    # Map common aliases
    dim_map <- c(
      "season"    = "season_name",
      "month"     = "month_name",
      "year"      = "year_num",
      "pollutant" = "prominent_pollutant"
    )
    
    r_dim <- if (row_dim %in% names(dim_map)) dim_map[[row_dim]] else row_dim
    c_dim <- if (col_dim %in% names(dim_map)) dim_map[[col_dim]] else col_dim
    
    if (!(r_dim %in% valid_dims)) r_dim <- "region"
    if (!(c_dim %in% valid_dims)) c_dim <- "season_name"
    
    # Start with base OLAP dataset
    df <- aqi_olap
    
    # Apply Slicing / Dicing Filters
    if (!is.null(filter_state) && filter_state != "All India" && filter_state != "All" && filter_state != "") {
      df <- df %>% filter(.data$state == filter_state)
    }
    if (!is.null(filter_region) && filter_region != "All" && filter_region != "") {
      df <- df %>% filter(.data$region == filter_region)
    }
    if (!is.null(filter_season) && filter_season != "All" && filter_season != "") {
      df <- df %>% filter(.data$season_name == filter_season)
    }
    if (!is.null(filter_year) && filter_year != "All" && filter_year != "") {
      df <- df %>% filter(.data$year_num == as.integer(filter_year))
    }
    if (!is.null(filter_pollutant) && filter_pollutant != "All" && filter_pollutant != "") {
      df <- df %>% filter(.data$prominent_pollutant == filter_pollutant)
    }
    
    if (nrow(df) == 0) {
      return(list(
        row_dim = r_dim,
        col_dim = c_dim,
        measure = measure,
        rows = list(),
        cols = list(),
        matrix = list(),
        raw_data = list(),
        summary = list(total_records = 0, overall_mean = 0, overall_max = 0, overall_min = 0),
        message = "No records match the active slice/dice criteria"
      ))
    }
    
    # Group and aggregate according to requested measure
    agg <- df %>%
      group_by(.data[[r_dim]], .data[[c_dim]]) %>%
      summarise(
        mean_aqi       = round(mean(aqi_value, na.rm = TRUE), 1),
        max_aqi        = round(max(aqi_value, na.rm = TRUE), 1),
        min_aqi        = round(min(aqi_value, na.rm = TRUE), 1),
        count          = n(),
        exceedance_pct = round(100 * mean(aqi_value > 100, na.rm = TRUE), 1),
        .groups = "drop"
      )
    
    # Value column based on measure
    meas_col <- switch(
      measure,
      "max_aqi"        = "max_aqi",
      "min_aqi"        = "min_aqi",
      "count"          = "count",
      "exceedance_pct" = "exceedance_pct",
      "mean_aqi"
    )
    
    # Order dimensions meaningfully
    month_order <- c("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    season_order <- c("Winter", "Spring/Summer", "Monsoon", "Autumn")
    region_order <- c("North", "South", "East", "West", "Central", "Northeast", "Other")
    
    all_rows <- unique(as.character(agg[[r_dim]]))
    all_cols <- unique(as.character(agg[[c_dim]]))
    
    sort_dim <- function(items, dim_name) {
      if (dim_name == "month_name") items[order(match(items, month_order))]
      else if (dim_name == "season_name") items[order(match(items, season_order))]
      else if (dim_name == "region") items[order(match(items, region_order))]
      else if (dim_name == "year_num") sort(as.numeric(items))
      else sort(items)
    }
    
    ordered_rows <- sort_dim(all_rows, r_dim)
    ordered_cols <- sort_dim(all_cols, c_dim)
    
    # Construct 2D Matrix (Pivot view)
    matrix_rows <- lapply(ordered_rows, function(r_val) {
      row_obj <- list(row_key = r_val)
      row_data <- agg %>% filter(.data[[r_dim]] == r_val)
      
      row_vals <- c()
      for (c_val in ordered_cols) {
        match_cell <- row_data %>% filter(.data[[c_dim]] == c_val)
        val <- if (nrow(match_cell) > 0) match_cell[[meas_col]][1] else NA_real_
        row_obj[[c_val]] <- val
        if (!is.na(val)) row_vals <- c(row_vals, val)
      }
      
      row_obj$row_avg <- if (length(row_vals) > 0) round(mean(row_vals), 1) else NA_real_
      row_obj$row_max <- if (length(row_vals) > 0) round(max(row_vals), 1) else NA_real_
      row_obj$row_min <- if (length(row_vals) > 0) round(min(row_vals), 1) else NA_real_
      row_obj
    })
    
    # Flatten raw records for charts
    raw_records <- lapply(seq_len(nrow(agg)), function(i) {
      list(
        row   = as.character(agg[[r_dim]][i]),
        col   = as.character(agg[[c_dim]][i]),
        value = agg[[meas_col]][i],
        count = agg$count[i]
      )
    })
    
    list(
      row_dim         = r_dim,
      col_dim         = c_dim,
      measure         = measure,
      rows            = ordered_rows,
      cols            = ordered_cols,
      matrix          = matrix_rows,
      raw_data        = raw_records,
      summary         = list(
        total_records = nrow(df),
        overall_mean  = round(mean(df$aqi_value, na.rm = TRUE), 1),
        overall_max   = round(max(df$aqi_value, na.rm = TRUE), 1),
        overall_min   = round(min(df$aqi_value, na.rm = TRUE), 1)
      ),
      applied_filters = list(
        state     = filter_state,
        region    = filter_region,
        season    = filter_season,
        year      = filter_year,
        pollutant = filter_pollutant
      )
    )
  }, error = function(e) {
    res$status <- 500
    list(error = e$message)
  })
}

# ============================================================
# ENDPOINT 13: GET /states
# Returns list of all available states (for UI dropdowns)
# ============================================================

#* @get /states
#* @serializer json
function() {
  list(states = c("All India", state_list))
}

# (The %||% operator is defined near the top of this file, before CORS filter)
