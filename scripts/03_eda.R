# ============================================================
# PHASE 3: EXPLORATORY DATA ANALYSIS (EDA)
# Project: Air Quality Index (AQI) Analysis and Prediction
# ============================================================

library(dplyr)
library(tidyr)
library(lubridate)

setwd("G:/rproject")

cat("==============================================\n")
cat("  AQI ANALYSIS PROJECT - Phase 3: EDA\n")
cat("==============================================\n\n")

# ---- Load Cleaned Data ----
aqi <- readRDS("data/aqi_clean.rds")
cat("Loaded cleaned data:", nrow(aqi), "rows\n\n")

# ==================================================
# 3.1 OVERALL AQI STATISTICS
# ==================================================
cat("======================================\n")
cat("  3.1 OVERALL AQI STATISTICS\n")
cat("======================================\n")

cat("Average AQI :", round(mean(aqi$aqi_value, na.rm = TRUE), 2), "\n")
cat("Median AQI  :", median(aqi$aqi_value, na.rm = TRUE), "\n")
cat("Maximum AQI :", max(aqi$aqi_value, na.rm = TRUE), "\n")
cat("Minimum AQI :", min(aqi$aqi_value, na.rm = TRUE), "\n")
cat("Std Dev AQI :", round(sd(aqi$aqi_value, na.rm = TRUE), 2), "\n\n")

# ==================================================
# 3.2 AQI CATEGORY DISTRIBUTION
# ==================================================
cat("======================================\n")
cat("  3.2 AQI CATEGORY DISTRIBUTION\n")
cat("======================================\n")

aqi_cat_dist <- aqi %>%
  count(air_quality_status) %>%
  mutate(percentage = round(n / sum(n) * 100, 2)) %>%
  arrange(desc(n))

print(aqi_cat_dist)
cat("\n")

# ==================================================
# 3.3 STATE-WISE AQI COMPARISON
# ==================================================
cat("======================================\n")
cat("  3.3 STATE-WISE AQI COMPARISON\n")
cat("======================================\n")

state_aqi <- aqi %>%
  group_by(state) %>%
  summarise(
    avg_aqi    = round(mean(aqi_value, na.rm = TRUE), 2),
    max_aqi    = max(aqi_value, na.rm = TRUE),
    min_aqi    = min(aqi_value, na.rm = TRUE),
    median_aqi = median(aqi_value, na.rm = TRUE),
    count      = n()
  ) %>%
  arrange(desc(avg_aqi))

cat("Top 10 Most Polluted States (by avg AQI):\n")
print(head(state_aqi, 10))
cat("\n")

cat("Top 10 Cleanest States (by avg AQI):\n")
print(tail(state_aqi, 10))
cat("\n")

# ==================================================
# 3.4 CITY/AREA-WISE AQI COMPARISON
# ==================================================
cat("======================================\n")
cat("  3.4 TOP 10 MOST POLLUTED CITIES\n")
cat("======================================\n")

city_aqi <- aqi %>%
  group_by(area, state) %>%
  summarise(
    avg_aqi = round(mean(aqi_value, na.rm = TRUE), 2),
    count   = n(),
    .groups = "drop"
  ) %>%
  filter(count >= 5) %>%    # At least 5 records for reliability
  arrange(desc(avg_aqi))

cat("Top 15 Most Polluted Cities:\n")
print(head(city_aqi, 15))
cat("\n")

cat("Top 10 Cleanest Cities:\n")
print(tail(city_aqi %>% arrange(avg_aqi), 10))
cat("\n")

# ==================================================
# 3.5 MONTHLY AQI TRENDS
# ==================================================
cat("======================================\n")
cat("  3.5 MONTHLY AQI TRENDS\n")
cat("======================================\n")

monthly_aqi <- aqi %>%
  group_by(month_num, month) %>%
  summarise(
    avg_aqi    = round(mean(aqi_value, na.rm = TRUE), 2),
    max_aqi    = max(aqi_value, na.rm = TRUE),
    min_aqi    = min(aqi_value, na.rm = TRUE),
    count      = n(),
    .groups    = "drop"
  ) %>%
  arrange(month_num)

print(monthly_aqi)
cat("\n")

cat("Worst Month (highest avg AQI):",
    as.character(monthly_aqi$month[which.max(monthly_aqi$avg_aqi)]),
    "-", max(monthly_aqi$avg_aqi), "\n")
cat("Best Month (lowest avg AQI):",
    as.character(monthly_aqi$month[which.min(monthly_aqi$avg_aqi)]),
    "-", min(monthly_aqi$avg_aqi), "\n\n")

# ==================================================
# 3.6 YEARLY AQI TRENDS
# ==================================================
cat("======================================\n")
cat("  3.6 YEARLY AQI TRENDS\n")
cat("======================================\n")

yearly_aqi <- aqi %>%
  group_by(year) %>%
  summarise(
    avg_aqi = round(mean(aqi_value, na.rm = TRUE), 2),
    count   = n(),
    .groups = "drop"
  ) %>%
  arrange(year)

print(yearly_aqi)
cat("\n")

# ==================================================
# 3.7 PROMINENT POLLUTANT ANALYSIS
# ==================================================
cat("======================================\n")
cat("  3.7 PROMINENT POLLUTANT DISTRIBUTION\n")
cat("======================================\n")

pollutant_dist <- aqi %>%
  count(prominent_pollutants) %>%
  mutate(percentage = round(n / sum(n) * 100, 2)) %>%
  arrange(desc(n))

print(pollutant_dist)
cat("\n")

cat("Most Common Pollutant:", as.character(pollutant_dist$prominent_pollutants[1]),
    "(", pollutant_dist$percentage[1], "% of records)\n\n")

# ==================================================
# 3.8 POLLUTANT vs AQI AVERAGE
# ==================================================
cat("======================================\n")
cat("  3.8 AVERAGE AQI BY POLLUTANT TYPE\n")
cat("======================================\n")

pollutant_aqi <- aqi %>%
  group_by(prominent_pollutants) %>%
  summarise(
    avg_aqi  = round(mean(aqi_value, na.rm = TRUE), 2),
    max_aqi  = max(aqi_value, na.rm = TRUE),
    count    = n(),
    .groups  = "drop"
  ) %>%
  arrange(desc(avg_aqi))

print(pollutant_aqi)
cat("\n")

# ==================================================
# 3.9 MONITORING STATION ANALYSIS
# ==================================================
cat("======================================\n")
cat("  3.9 MONITORING STATION ANALYSIS\n")
cat("======================================\n")

station_summary <- aqi %>%
  summarise(
    avg_stations    = round(mean(number_of_monitoring_stations, na.rm = TRUE), 2),
    max_stations    = max(number_of_monitoring_stations, na.rm = TRUE),
    total_readings  = n()
  )

print(station_summary)
cat("\n")

# ==================================================
# 3.10 CORRELATION: STATIONS vs AQI
# ==================================================
cat("======================================\n")
cat("  3.10 STATIONS vs AQI CORRELATION\n")
cat("======================================\n")

cor_val <- cor(aqi$number_of_monitoring_stations, aqi$aqi_value,
               use = "complete.obs")
cat("Correlation (monitoring stations vs AQI):",
    round(cor_val, 4), "\n")

if (abs(cor_val) < 0.1) {
  cat("Interpretation: Very weak / no linear relationship.\n\n")
} else if (abs(cor_val) < 0.3) {
  cat("Interpretation: Weak relationship.\n\n")
} else {
  cat("Interpretation: Moderate-to-strong relationship.\n\n")
}

# ---- Save EDA Results ----
saveRDS(state_aqi,      "data/state_aqi.rds")
saveRDS(city_aqi,       "data/city_aqi.rds")
saveRDS(monthly_aqi,    "data/monthly_aqi.rds")
saveRDS(yearly_aqi,     "data/yearly_aqi.rds")
saveRDS(pollutant_dist, "data/pollutant_dist.rds")
saveRDS(pollutant_aqi,  "data/pollutant_aqi.rds")

cat("EDA results saved to data/ folder.\n")
cat("Phase 3 Complete! Proceed to 04_visualization.R\n")
