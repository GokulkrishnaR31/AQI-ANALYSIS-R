# ============================================================
# AQI Intelligence Platform — Plumber API Launcher
# Usage: Rscript scripts/run_api.R
# API runs at: http://localhost:8000
# ============================================================

required_pkgs <- c("plumber")
missing_pkgs <- required_pkgs[!required_pkgs %in% installed.packages()[,"Package"]]
if (length(missing_pkgs) > 0) {
  install.packages(missing_pkgs, repos = "https://cloud.r-project.org")
}

library(plumber)

setwd("G:/rproject")

cat("============================================================\n")
cat("  AQI Intelligence Platform — REST API Server\n")
cat("  Endpoints: http://localhost:8000\n")
cat("  Swagger UI: http://localhost:8000/__docs__/\n")
cat("============================================================\n\n")

pr <- plumber::plumb("scripts/13_plumber_api.R")
pr$run(
  host   = "0.0.0.0",
  port   = 8000,
  docs   = TRUE,   # Enable Swagger UI at /__docs__/
  quiet  = FALSE
)
