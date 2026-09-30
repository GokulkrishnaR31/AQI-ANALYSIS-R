# ============================================================
# MAIN.R — Master Runner Script
# Project: Air Quality Index (AQI) Analysis and Prediction
# Run this file to execute all phases in sequence
# ============================================================

setwd("G:/rproject")

cat("╔══════════════════════════════════════════════════════╗\n")
cat("║  AIR QUALITY INDEX ANALYSIS & PREDICTION PROJECT     ║\n")
cat("║  Master Runner — All Phases                           ║\n")
cat("╚══════════════════════════════════════════════════════╝\n\n")

run_phase <- function(phase_num, phase_name, script_path) {
  cat(rep("─", 55), "\n", sep="")
  cat(sprintf("  ▶ Phase %d: %s\n", phase_num, phase_name))
  cat(rep("─", 55), "\n", sep="")
  tryCatch({
    source(script_path)
    cat(sprintf("\n  ✅ Phase %d Complete!\n\n", phase_num))
  }, error = function(e) {
    cat(sprintf("\n  ❌ Phase %d Error: %s\n\n", phase_num, e$message))
  })
}

# ---- Check required packages ----
required_packages <- c("readr", "dplyr", "tidyr", "lubridate", "ggplot2",
                        "scales", "forcats", "stringr", "caret",
                        "randomForest", "Metrics", "plotly", "shiny", "DT",
                        "leaflet", "httr", "jsonlite")

cat("Checking required packages...\n")
missing_pkgs <- required_packages[!required_packages %in% installed.packages()[, "Package"]]
if (length(missing_pkgs) > 0) {
  cat("Installing missing packages:", paste(missing_pkgs, collapse = ", "), "\n")
  install.packages(missing_pkgs, repos = "https://cloud.r-project.org")
} else {
  cat("All packages already installed.\n\n")
}

# ---- Run All Phases ----
run_phase(1,  "Data Loading",         "scripts/01_data_loading.R")
run_phase(2,  "Data Cleaning",        "scripts/02_data_cleaning.R")
run_phase(3,  "Exploratory Analysis", "scripts/03_eda.R")
run_phase(4,  "Visualization",        "scripts/04_visualization.R")
run_phase(5,  "Statistical Analysis", "scripts/05_statistical_analysis.R")
run_phase(6,  "Machine Learning",     "scripts/06_ml_models.R")
run_phase(10, "Advanced Analytics",   "scripts/10_advanced_analytics.R")
run_phase(11, "Health & Policy Engine","scripts/11_health_policy_utilities.R")
run_phase(12, "Alerts & Reporting",    "scripts/12_alert_reporting.R")

cat("╔══════════════════════════════════════════════════════╗\n")
cat("║  ALL PHASES COMPLETE!                                ║\n")
cat("║  Output charts saved in:  output/                    ║\n")
cat("║  Cleaned data saved in:   data/                      ║\n")
cat("╚══════════════════════════════════════════════════════╝\n\n")
cat("To launch the Advanced Interactive Dashboard, run:\n")
cat("  source('scripts/09_realtime_dashboard.R')\n\n")

