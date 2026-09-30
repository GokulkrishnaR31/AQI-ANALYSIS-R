# ============================================================
# PHASE 12: AUTOMATED ALERTS & EXECUTIVE REPORT GENERATOR
# Project: Air Quality Index (AQI) Analysis and Prediction
# ============================================================

library(httr)
library(dplyr)
library(lubridate)
library(readr)

setwd("G:/rproject")

cat("==============================================\n")
cat("  AQI PROJECT - Phase 12: Alerts & Reporting\n")
cat("==============================================\n\n")

# ============================================================
# 12.1 TELEGRAM ALERT BOT INTEGRATION
# ============================================================
#' Send Telegram AQI Alert Notification
#' @param city City name
#' @param aqi_val AQI numerical value
#' @param status AQI status description
#' @param bot_token Telegram Bot Token (optional)
#' @param chat_id Telegram Chat ID (optional)
send_telegram_aqi_alert <- function(city, aqi_val, status = "Severe", 
                                   bot_token = NULL, chat_id = NULL) {
  if (is.null(bot_token) || bot_token == "" || is.null(chat_id) || chat_id == "") {
    # Demo mode simulation
    msg <- sprintf("🚨 [SIMULATED TELEGRAM ALERT]\nCity: %s\nAQI: %d (%s)\nTime: %s\nAction Required: Wear N95 Mask, Avoid outdoor exposure.",
                   city, round(aqi_val), status, format(Sys.time(), "%Y-%m-%d %H:%M:%S"))
    cat(msg, "\n\n")
    return(list(status = "simulated", message = msg))
  }
  
  url <- sprintf("https://api.telegram.org/bot%s/sendMessage", bot_token)
  text <- sprintf("🚨 *AIR QUALITY ALERT*\n\n📍 *City*: %s\n📊 *AQI*: %d (%s)\n🕒 *Time*: %s\n\n⚠️ *Health Advisory*: High pollution level detected. Sensitive groups avoid outdoor activities.",
                  city, round(aqi_val), status, format(Sys.time(), "%Y-%m-%d %H:%M:%S"))
  
  tryCatch({
    res <- POST(url, body = list(chat_id = chat_id, text = text, parse_mode = "Markdown"))
    if (status_code(res) == 200) {
      cat("✅ Telegram alert dispatched successfully to chat", chat_id, "\n")
      return(list(status = "success"))
    } else {
      cat("⚠️ Telegram API returned status code:", status_code(res), "\n")
      return(list(status = "failed", code = status_code(res)))
    }
  }, error = function(e) {
    cat("❌ Telegram API error:", e$message, "\n")
    return(list(status = "error", message = e$message))
  })
}

# ============================================================
# 12.2 AUTOMATED EXECUTIVE HTML REPORT GENERATOR
# ============================================================
#' Generate Self-Contained HTML Executive Air Quality Summary Report
generate_aqi_html_report <- function(output_file = "output/AQI_Executive_Report.html",
                                      selected_state = "All India") {
  
  aqi <- readRDS("data/aqi_clean.rds")
  
  if (selected_state != "All India" && selected_state %in% aqi$state) {
    aqi_filtered <- aqi %>% filter(state == selected_state)
  } else {
    aqi_filtered <- aqi
  }
  
  avg_aqi  <- round(mean(aqi_filtered$aqi_value, na.rm = TRUE), 1)
  max_aqi  <- max(aqi_filtered$aqi_value, na.rm = TRUE)
  min_aqi  <- min(aqi_filtered$aqi_value, na.rm = TRUE)
  total_obs<- nrow(aqi_filtered)
  
  top_polluted <- aqi_filtered %>%
    group_by(state) %>%
    summarise(mean_aqi = round(mean(aqi_value, na.rm=TRUE), 1), .groups="drop") %>%
    arrange(desc(mean_aqi)) %>%
    head(5)
  
  top_polluted_rows <- paste0(
    sprintf("<tr><td style='padding:8px;border-bottom:1px solid #333;'>%s</td><td style='padding:8px;border-bottom:1px solid #333;font-weight:bold;color:#e74c3c;'>%.1f</td></tr>",
            top_polluted$state, top_polluted$mean_aqi),
    collapse = ""
  )
  
  html_content <- sprintf('<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Air Quality Executive Summary Report</title>
  <style>
    body { font-family: "Segoe UI", Roboto, Helvetica, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #334155; }
    .header { border-bottom: 2px solid #38bdf8; padding-bottom: 20px; margin-bottom: 24px; }
    .header h1 { margin: 0; color: #38bdf8; font-size: 28px; }
    .header p { margin: 4px 0 0; color: #94a3b8; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; }
    .card .val { font-size: 32px; font-weight: bold; color: #f43f5e; margin-top: 4px; }
    .card .lbl { font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
    table { width: 100%%; border-collapse: collapse; margin-top: 12px; }
    th { text-align: left; padding: 10px; background: #0f172a; color: #38bdf8; font-size: 13px; text-transform: uppercase; }
    .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Air Quality Executive Intelligence Report</h1>
      <p>Region: %s | Generated on: %s</p>
    </div>
    
    <div class="grid">
      <div class="card"><div class="lbl">Average AQI</div><div class="val" style="color:#f59e0b;">%.1f</div></div>
      <div class="card"><div class="lbl">Peak AQI Level</div><div class="val" style="color:#ef4444;">%d</div></div>
      <div class="card"><div class="lbl">Total Samples</div><div class="val" style="color:#38bdf8;">%d</div></div>
    </div>
    
    <h3>🚨 Top 5 Most Polluted States</h3>
    <table>
      <thead>
        <tr><th>State</th><th>Average AQI</th></tr>
      </thead>
      <tbody>
        %s
      </tbody>
    </table>
    
    <div style="margin-top:24px; background:#0f172a; padding:16px; border-radius:12px; border-left:4px solid #ef4444;">
      <h4 style="margin:0 0 8px; color:#ef4444;">🏥 Health Advisory Summary</h4>
      <p style="margin:0; font-size:14px; color:#cbd5e1;">High particulate concentration observed in peak winter & autumn months. Vulnerable individuals, children, and elderly should maintain indoor HEPA air filtration and limit morning outdoor exposure when AQI > 200.</p>
    </div>
    
    <div class="footer">
      Generated automatically by Air Quality Intelligence Platform (R / Shiny Pipeline)
    </div>
  </div>
</body>
</html>', selected_state, format(Sys.time(), "%d %B %Y, %H:%M"), avg_aqi, max_aqi, total_obs, top_polluted_rows)
  
  writeLines(html_content, output_file)
  cat("✅ Executive HTML Report generated at:", output_file, "\n")
  return(output_file)
}

# Run test HTML report generation
generate_aqi_html_report("output/AQI_Executive_Report.html")

cat("\n==============================================\n")
cat("  PHASE 12 COMPLETE!\n")
cat("==============================================\n")
