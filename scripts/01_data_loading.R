# ============================================================
# PHASE 1: DATA LOADING
# Project: Air Quality Index (AQI) Analysis and Prediction
# Dataset: Indian AQI Data (aqi.csv)
# ============================================================

# ---- Load Required Libraries ----
library(readr)    # Fast CSV reading
library(dplyr)    # Data manipulation
library(tidyr)    # Data tidying

# ---- Set Working Directory ----
setwd("G:/rproject")

cat("==============================================\n")
cat("  AQI ANALYSIS PROJECT - Phase 1: Data Loading\n")
cat("==============================================\n\n")

# ---- Load the Dataset ----
cat("Loading dataset...\n")
aqi_raw <- read_csv("aqi.csv", show_col_types = FALSE)

cat("Dataset loaded successfully!\n\n")

# ---- Dataset Dimensions ----
cat("--- Dataset Dimensions ---\n")
cat("Rows   :", nrow(aqi_raw), "\n")
cat("Columns:", ncol(aqi_raw), "\n\n")

# ---- Column Names ----
cat("--- Column Names ---\n")
print(names(aqi_raw))
cat("\n")

# ---- Dataset Structure ----
cat("--- Dataset Structure ---\n")
glimpse(aqi_raw)
cat("\n")

# ---- First 6 Rows ----
cat("--- First 6 Rows ---\n")
print(head(aqi_raw, 6))
cat("\n")

# ---- Last 6 Rows ----
cat("--- Last 6 Rows ---\n")
print(tail(aqi_raw, 6))
cat("\n")

# ---- Summary Statistics ----
cat("--- Summary Statistics ---\n")
print(summary(aqi_raw))
cat("\n")

# ---- Missing Value Check ----
cat("--- Missing Values Per Column ---\n")
missing_counts <- colSums(is.na(aqi_raw))
print(missing_counts)
cat("\nTotal missing values:", sum(is.na(aqi_raw)), "\n\n")

# ---- Unique Values in Key Columns ----
cat("--- Unique States ---\n")
cat("Number of unique states:", n_distinct(aqi_raw$state), "\n")
cat("States:", paste(unique(aqi_raw$state), collapse = ", "), "\n\n")

cat("--- Unique AQI Status Categories ---\n")
print(table(aqi_raw$air_quality_status))
cat("\n")

cat("--- Unique Prominent Pollutants ---\n")
print(table(aqi_raw$prominent_pollutants))
cat("\n")

# ---- AQI Value Range ----
cat("--- AQI Value Range ---\n")
cat("Min AQI:", min(aqi_raw$aqi_value, na.rm = TRUE), "\n")
cat("Max AQI:", max(aqi_raw$aqi_value, na.rm = TRUE), "\n")
cat("Mean AQI:", round(mean(aqi_raw$aqi_value, na.rm = TRUE), 2), "\n")
cat("Median AQI:", median(aqi_raw$aqi_value, na.rm = TRUE), "\n\n")

# ---- Date Range ----
cat("--- Date Information ---\n")
cat("Date column (raw sample):", head(aqi_raw$date, 3), "\n\n")

# ---- Save raw data reference ----
saveRDS(aqi_raw, "data/aqi_raw.rds")
cat("Raw data saved to data/aqi_raw.rds\n")
cat("Phase 1 Complete! Proceed to 02_data_cleaning.R\n")
