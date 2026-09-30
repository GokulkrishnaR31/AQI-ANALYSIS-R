# ============================================================
# PHASE 10: ADVANCED ANALYTICS & TIME-SERIES FORECASTING
# Project: Air Quality Index (AQI) Analysis and Prediction
# ============================================================

required_pkgs <- c("dplyr", "lubridate", "ggplot2", "readr", "randomForest")
missing <- required_pkgs[!required_pkgs %in% installed.packages()[, "Package"]]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(dplyr)
library(lubridate)
library(ggplot2)
library(readr)
library(randomForest)

setwd("G:/rproject")

cat("==============================================\n")
cat("  AQI PROJECT - Phase 10: Advanced Analytics\n")
cat("==============================================\n\n")

# Load Cleaned Data
aqi <- readRDS("data/aqi_clean.rds")

# ============================================================
# 10.1 TIME-SERIES FORECASTING (Holt-Winters / Exponential Smoothing)
# ============================================================
cat("--- 10.1 Running Time-Series Forecasting ---\n")

generate_aqi_forecast <- function(data, forecast_days = 7) {
  # Aggregate daily mean AQI
  daily_aqi <- data %>%
    group_by(date) %>%
    summarise(mean_aqi = mean(aqi_value, na.rm = TRUE), .groups = "drop") %>%
    arrange(date)
  
  if (nrow(daily_aqi) < 14) {
    # Fallback if insufficient historical days
    last_date <- max(daily_aqi$date, na.rm = TRUE)
    last_val  <- tail(daily_aqi$mean_aqi, 1)
    
    fc_df <- data.frame(
      date = seq.Date(last_date + 1, by = "day", length.out = forecast_days),
      predicted_aqi = round(rep(last_val, forecast_days), 1),
      lower_bound = round(rep(max(0, last_val - 15), forecast_days), 1),
      upper_bound = round(rep(last_val + 15, forecast_days), 1)
    )
    return(fc_df)
  }
  
  # Create daily time series
  ts_data <- ts(daily_aqi$mean_aqi, frequency = 7)
  
  # Fit Holt-Winters model
  tryCatch({
    hw_model <- HoltWinters(ts_data, beta = FALSE, gamma = FALSE)
    fc <- predict(hw_model, n.ahead = forecast_days, prediction.interval = TRUE, level = 0.90)
    
    # Anchor forecast to current system date (today onwards)
    start_date <- Sys.Date()
    fc_df <- data.frame(
      date = seq.Date(start_date, by = "day", length.out = forecast_days),
      predicted_aqi = round(as.numeric(fc[, "fit"]), 1),
      lower_bound = round(pmax(0, as.numeric(fc[, "lwr"])), 1),
      upper_bound = round(as.numeric(fc[, "upr"]), 1)
    )
    return(fc_df)
  }, error = function(e) {
    # Exponential smoothing fallback
    start_date <- Sys.Date()
    last_val   <- mean(tail(daily_aqi$mean_aqi, 7), na.rm = TRUE)
    
    fc_df <- data.frame(
      date = seq.Date(start_date, by = "day", length.out = forecast_days),
      predicted_aqi = round(rep(last_val, forecast_days), 1),
      lower_bound = round(rep(max(0, last_val - 20), forecast_days), 1),
      upper_bound = round(rep(last_val + 20, forecast_days), 1)
    )
    return(fc_df)
  })
}

forecast_results <- generate_aqi_forecast(aqi, forecast_days = 7)
saveRDS(forecast_results, "data/aqi_7day_forecast.rds")
cat("✅ 7-Day Forecast saved to data/aqi_7day_forecast.rds\n\n")

# ============================================================
# 10.2 ANOMALY & SPIKE EVENT DETECTION
# ============================================================
cat("--- 10.2 Detecting Extreme Pollution Anomaly Events ---\n")

detect_aqi_anomalies <- function(data, threshold_z = 2.0) {
  daily <- data %>%
    group_by(date) %>%
    summarise(
      mean_aqi = mean(aqi_value, na.rm = TRUE),
      max_aqi  = max(aqi_value, na.rm = TRUE),
      .groups  = "drop"
    ) %>%
    arrange(date)
  
  overall_mean <- mean(daily$mean_aqi, na.rm = TRUE)
  overall_sd   <- sd(daily$mean_aqi, na.rm = TRUE)
  
  daily <- daily %>%
    mutate(
      z_score = (mean_aqi - overall_mean) / overall_sd,
      is_anomaly = z_score >= threshold_z,
      event_type = case_when(
        is_anomaly & month(date) %in% c(10, 11) ~ "Diwali / Stubble Burning Spike",
        is_anomaly & month(date) %in% c(4, 5, 6) ~ "Summer Dust Storm Spike",
        is_anomaly & month(date) %in% c(12, 1, 2) ~ "Winter Inversion Smog",
        is_anomaly ~ "Unusual Emission Anomaly",
        TRUE ~ "Normal Baseline"
      )
    )
  return(daily)
}

anomaly_results <- detect_aqi_anomalies(aqi)
saveRDS(anomaly_results, "data/aqi_anomalies.rds")
cat("✅ Detected", sum(anomaly_results$is_anomaly), "anomaly spike events.\n\n")

# ============================================================
# 10.3 MULTI-CLASS AQI HAZARD CLASSIFIER
# ============================================================
cat("--- 10.3 Training Multi-Class Classification Model ---\n")

aqi_cls_data <- aqi %>%
  mutate(
    status_factor = factor(air_quality_status, 
                           levels = c("Good", "Satisfactory", "Moderate", 
                                      "Poor", "Very Poor", "Severe")),
    pollutant_score = case_when(
      prominent_pollutants == "PM2.5" ~ 5,
      prominent_pollutants == "PM10"  ~ 4,
      prominent_pollutants == "NO2"   ~ 3,
      prominent_pollutants == "SO2"   ~ 3,
      TRUE ~ 2
    ),
    is_winter = as.integer(month_num %in% c(11, 12, 1, 2))
  ) %>%
  filter(!is.na(status_factor)) %>%
  select(status_factor, month_num, number_of_monitoring_stations, pollutant_score, is_winter)

set.seed(123)
rf_classifier <- randomForest(status_factor ~ ., data = aqi_cls_data, ntree = 100)
saveRDS(rf_classifier, "data/rf_classifier.rds")
cat("✅ AQI Hazard Category Classifier saved to data/rf_classifier.rds\n\n")

# ============================================================
# 10.4 WHO vs CPCB BENCHMARK ANALYSIS
# ============================================================
cat("--- 10.4 Computing WHO vs CPCB Compliance ---\n")

compute_benchmarks <- function(data) {
  # Daily mean AQI / PM proxy
  summary_stats <- data %>%
    summarise(
      total_obs           = n(),
      cpcb_compliant_days = sum(aqi_value <= 100, na.rm = TRUE), # CPCB Satisfactory/Good
      who_compliant_days  = sum(aqi_value <= 50,  na.rm = TRUE), # WHO Clean Air standard proxy
      cpcb_compliance_pct = round((cpcb_compliant_days / total_obs) * 100, 1),
      who_compliance_pct  = round((who_compliant_days / total_obs) * 100, 1),
      avg_aqi = round(mean(aqi_value, na.rm = TRUE), 1),
      max_aqi = max(aqi_value, na.rm = TRUE)
    )
  return(summary_stats)
}

benchmark_stats <- compute_benchmarks(aqi)
saveRDS(benchmark_stats, "data/benchmark_stats.rds")
cat("✅ Compliance stats: CPCB Safe =", benchmark_stats$cpcb_compliance_pct, 
    "% | WHO Safe =", benchmark_stats$who_compliance_pct, "%\n\n")

cat("==============================================\n")
cat("  PHASE 10 COMPLETE!\n")
cat("==============================================\n")
