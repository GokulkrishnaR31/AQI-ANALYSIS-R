# ============================================================
# PHASE 2: DATA CLEANING
# Project: Air Quality Index (AQI) Analysis and Prediction
# ============================================================

library(readr)
library(dplyr)
library(tidyr)
library(lubridate)  # For date parsing
library(stringr)    # For string operations

setwd("G:/rproject")

cat("==============================================\n")
cat("  AQI ANALYSIS PROJECT - Phase 2: Data Cleaning\n")
cat("==============================================\n\n")

# ---- Load Raw Data ----
cat("Loading raw data...\n")
aqi_raw <- read_csv("aqi.csv", show_col_types = FALSE)
cat("Rows before cleaning:", nrow(aqi_raw), "\n\n")

# ---- Step 1: Remove Duplicate Rows ----
cat("--- Step 1: Removing Duplicates ---\n")
aqi_clean <- aqi_raw %>% distinct()
cat("Rows removed (duplicates):", nrow(aqi_raw) - nrow(aqi_clean), "\n")
cat("Rows after deduplication:", nrow(aqi_clean), "\n\n")

# ---- Step 2: Drop Irrelevant Columns ----
cat("--- Step 2: Dropping Irrelevant Columns ---\n")
# 'unit' and 'note' are metadata/descriptive - not needed for analysis
aqi_clean <- aqi_clean %>%
  select(date, state, area, number_of_monitoring_stations,
         prominent_pollutants, aqi_value, air_quality_status)
cat("Kept columns:", paste(names(aqi_clean), collapse = ", "), "\n\n")

# ---- Step 3: Parse and Convert Date ----
cat("--- Step 3: Parsing Dates ---\n")
aqi_clean <- aqi_clean %>%
  mutate(
    date = dmy(date),           # Convert "30-04-2025" -> Date object
    year  = year(date),
    month = month(date, label = TRUE, abbr = TRUE),
    month_num = month(date),
    day   = day(date)
  )
cat("Date range:", as.character(min(aqi_clean$date, na.rm = TRUE)),
    "to", as.character(max(aqi_clean$date, na.rm = TRUE)), "\n\n")

# ---- Step 4: Handle Missing Values ----
cat("--- Step 4: Handling Missing Values ---\n")
cat("Missing values before cleaning:\n")
print(colSums(is.na(aqi_clean)))

# Remove rows where aqi_value or date is missing (critical fields)
aqi_clean <- aqi_clean %>%
  filter(!is.na(aqi_value), !is.na(date))

# Fill missing prominent_pollutants with "Unknown"
aqi_clean <- aqi_clean %>%
  mutate(prominent_pollutants = ifelse(is.na(prominent_pollutants) |
                                         prominent_pollutants == "",
                                       "Unknown", prominent_pollutants))

# Fill missing air_quality_status based on AQI value ranges
aqi_clean <- aqi_clean %>%
  mutate(air_quality_status = case_when(
    !is.na(air_quality_status) & air_quality_status != "" ~ air_quality_status,
    aqi_value <= 50  ~ "Good",
    aqi_value <= 100 ~ "Satisfactory",
    aqi_value <= 200 ~ "Moderate",
    aqi_value <= 300 ~ "Poor",
    aqi_value <= 400 ~ "Very Poor",
    aqi_value >  400 ~ "Severe",
    TRUE ~ "Unknown"
  ))

cat("\nMissing values after cleaning:\n")
print(colSums(is.na(aqi_clean)))
cat("\n")

# ---- Step 5: Fix Data Types ----
cat("--- Step 5: Fixing Data Types ---\n")
aqi_clean <- aqi_clean %>%
  mutate(
    state  = as.factor(state),
    area   = as.character(area),
    prominent_pollutants = as.factor(prominent_pollutants),
    air_quality_status   = factor(air_quality_status,
                                  levels = c("Good", "Satisfactory", "Moderate",
                                             "Poor", "Very Poor", "Severe"),
                                  ordered = TRUE),
    aqi_value = as.numeric(aqi_value),
    number_of_monitoring_stations = as.integer(number_of_monitoring_stations)
  )
cat("Data types fixed.\n\n")

# ---- Step 6: Handle Outliers in AQI ----
cat("--- Step 6: Handling Outliers ---\n")
Q1 <- quantile(aqi_clean$aqi_value, 0.01, na.rm = TRUE)
Q3 <- quantile(aqi_clean$aqi_value, 0.99, na.rm = TRUE)
cat("1st percentile AQI:", Q1, "\n")
cat("99th percentile AQI:", Q3, "\n")

# Flag extreme outliers (keep but mark) - AQI > 999 is unrealistic
outliers <- aqi_clean %>% filter(aqi_value > 999)
cat("Extreme outlier rows (AQI > 999):", nrow(outliers), "\n")
aqi_clean <- aqi_clean %>% filter(aqi_value <= 999)
cat("Rows after outlier removal:", nrow(aqi_clean), "\n\n")

# ---- Step 7: Standardize Text ----
cat("--- Step 7: Standardizing Text ---\n")
aqi_clean <- aqi_clean %>%
  mutate(
    state = str_trim(state),
    area  = str_trim(area),
    prominent_pollutants = str_trim(prominent_pollutants)
  )
cat("Text fields trimmed and standardized.\n\n")

# ---- Final Summary ----
cat("=== CLEANING COMPLETE ===\n")
cat("Final rows  :", nrow(aqi_clean), "\n")
cat("Final columns:", ncol(aqi_clean), "\n")
cat("Columns:", paste(names(aqi_clean), collapse = ", "), "\n\n")

cat("--- Final AQI Status Distribution ---\n")
print(table(aqi_clean$air_quality_status))
cat("\n")

cat("--- Final Summary ---\n")
print(summary(aqi_clean[, c("aqi_value", "number_of_monitoring_stations")]))

# ---- Save Cleaned Data ----
saveRDS(aqi_clean, "data/aqi_clean.rds")
write_csv(aqi_clean, "data/aqi_clean.csv")
cat("\nCleaned data saved to:\n  data/aqi_clean.rds\n  data/aqi_clean.csv\n")
cat("\nPhase 2 Complete! Proceed to 03_eda.R\n")
