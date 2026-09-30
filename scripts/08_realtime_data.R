# ============================================================
# PHASE 8: REAL-TIME AQI DATA FETCHING
# Project: Air Quality Index (AQI) Analysis and Prediction
#
# Uses WAQI API (World Air Quality Index) — FREE
# Get your free token at: https://aqicn.org/api/
# ============================================================

# ---- Auto-install required packages ----
required <- c("httr", "jsonlite", "dplyr", "readr", "lubridate")
missing  <- required[!required %in% installed.packages()[, "Package"]]
if (length(missing) > 0) {
  cat("Installing:", paste(missing, collapse = ", "), "\n")
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(httr)
library(jsonlite)
library(dplyr)
library(readr)
library(lubridate)

setwd("G:/rproject")

# ============================================================
# ⚙️  CONFIGURATION — PUT YOUR FREE API TOKEN HERE
# ============================================================
# Step 1: Go to https://aqicn.org/api/
# Step 2: Enter your email → get token in email
# Step 3: Paste token below between the quotes

WAQI_TOKEN <- "7628162b0f9d8c0d4ed04f2559ca27c8acadb15b"  
                        # ← Replace "demo" with your real token
                        # "demo" works but is rate-limited

# ---- List of major Indian cities to fetch ----
indian_cities <- c(
  "Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru",
  "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
  "Kanpur", "Nagpur", "Indore", "Bhopal", "Patna",
  "Varanasi", "Agra", "Gurgaon", "Noida", "Surat",
  "Visakhapatnam", "Coimbatore", "Kochi", "Chandigarh", "Amritsar"
)

# ============================================================
# FUNCTION: Fetch AQI for one city
# ============================================================
fetch_city_aqi <- function(city, token) {
  url <- paste0("https://api.waqi.info/feed/", URLencode(city), "/?token=", token)

  tryCatch({
    response <- GET(url, timeout(10))

    if (status_code(response) != 200) {
      cat("  ⚠️  HTTP error for", city, ":", status_code(response), "\n")
      return(NULL)
    }

    data <- fromJSON(content(response, "text", encoding = "UTF-8"),
                     simplifyVector = FALSE)

    if (data$status != "ok") {
      cat("  ⚠️  API error for", city, ":", data$status, "\n")
      return(NULL)
    }

    d <- data$data

    # Extract pollutants safely
    get_pollutant <- function(iaqi, name) {
      val <- iaqi[[name]]$v
      if (is.null(val)) NA_real_ else as.numeric(val)
    }

    iaqi <- d$iaqi

    row <- data.frame(
      date                = as.character(Sys.Date()),
      city                = city,
      aqi_value           = as.numeric(d$aqi),
      dominant_pollutant  = ifelse(is.null(d$dominentpol), NA, d$dominentpol),
      pm25                = get_pollutant(iaqi, "pm25"),
      pm10                = get_pollutant(iaqi, "pm10"),
      no2                 = get_pollutant(iaqi, "no2"),
      so2                 = get_pollutant(iaqi, "so2"),
      co                  = get_pollutant(iaqi, "co"),
      o3                  = get_pollutant(iaqi, "o3"),
      temperature         = get_pollutant(iaqi, "t"),
      humidity            = get_pollutant(iaqi, "h"),
      wind_speed          = get_pollutant(iaqi, "w"),
      station             = ifelse(is.null(d$city$name), city, d$city$name),
      fetched_at          = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
      stringsAsFactors    = FALSE
    )

    # Add AQI status category
    row$air_quality_status <- dplyr::case_when(
      row$aqi_value <= 50  ~ "Good",
      row$aqi_value <= 100 ~ "Satisfactory",
      row$aqi_value <= 200 ~ "Moderate",
      row$aqi_value <= 300 ~ "Poor",
      row$aqi_value <= 400 ~ "Very Poor",
      row$aqi_value >  400 ~ "Severe",
      TRUE ~ "Unknown"
    )

    cat("  ✅", city, "→ AQI:", row$aqi_value,
        "(", row$air_quality_status, ") |",
        "Dominant:", ifelse(is.na(row$dominant_pollutant),
                           "N/A", row$dominant_pollutant), "\n")
    return(row)

  }, error = function(e) {
    cat("  ❌ Error fetching", city, ":", e$message, "\n")
    return(NULL)
  })
}

# ============================================================
# FETCH ALL CITIES
# ============================================================
cat("==============================================\n")
cat("  FETCHING REAL-TIME AQI DATA\n")
cat("  Source: World Air Quality Index (waqi.info)\n")
cat("  Time:", format(Sys.time(), "%Y-%m-%d %H:%M:%S"), "\n")
cat("==============================================\n\n")

if (WAQI_TOKEN == "YOUR_TOKEN_HERE") {
  stop("❌ Please set your WAQI API token! Get it free at: https://aqicn.org/api/")
}

all_results <- list()

for (city in indian_cities) {
  cat("Fetching:", city, "...\n")
  result <- fetch_city_aqi(city, WAQI_TOKEN)
  if (!is.null(result)) {
    all_results[[length(all_results) + 1]] <- result
  }
  Sys.sleep(0.3)  # Polite delay between requests
}

# ============================================================
# COMBINE AND SAVE RESULTS
# ============================================================
if (length(all_results) == 0) {
  cat("\n❌ No data fetched. Check your token and internet connection.\n")
} else {
  live_df <- bind_rows(all_results)

  cat("\n==============================================\n")
  cat("  LIVE DATA SUMMARY\n")
  cat("==============================================\n")
  cat("Cities fetched :", nrow(live_df), "\n")
  cat("Average AQI    :", round(mean(live_df$aqi_value, na.rm = TRUE), 1), "\n")
  cat("Worst city     :", live_df$city[which.max(live_df$aqi_value)],
      "(AQI:", max(live_df$aqi_value, na.rm = TRUE), ")\n")
  cat("Best city      :", live_df$city[which.min(live_df$aqi_value)],
      "(AQI:", min(live_df$aqi_value, na.rm = TRUE), ")\n\n")

  cat("--- AQI Category Distribution ---\n")
  print(table(live_df$air_quality_status))

  cat("\n--- Full Live Data ---\n")
  print(live_df[, c("city", "aqi_value", "air_quality_status",
                    "dominant_pollutant", "pm25", "pm10")])

  # ---- Save Live Data ----
  # Append to running log (adds today's fetch to history)
  live_log_path <- "data/live_aqi_log.csv"

  if (file.exists(live_log_path)) {
    existing  <- read_csv(live_log_path, show_col_types = FALSE)
    live_log  <- bind_rows(existing, live_df)
  } else {
    live_log <- live_df
  }

  write_csv(live_log,  live_log_path)
  write_csv(live_df,   "data/live_aqi_today.csv")
  saveRDS(live_df,     "data/live_aqi_today.rds")

  cat("\n✅ Live data saved to:\n")
  cat("   data/live_aqi_today.csv   ← Today's snapshot\n")
  cat("   data/live_aqi_log.csv     ← Cumulative history log\n\n")

  cat("Total records in history log:", nrow(live_log), "\n")
  cat("\nRun this script daily to build a real-time history database!\n")
}
