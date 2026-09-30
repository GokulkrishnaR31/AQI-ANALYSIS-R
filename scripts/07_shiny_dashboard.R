# ============================================================
# PHASE 7: SHINY DASHBOARD (OPTIONAL)
# Project: Air Quality Index (AQI) Analysis and Prediction
# ============================================================

library(shiny)
library(ggplot2)
library(dplyr)
library(plotly)

setwd("G:/rproject")

# ---- Load data safely ----
aqi        <- readRDS("data/aqi_clean.rds")
state_list <- sort(unique(as.character(aqi$state)))

# ---- Load RF model safely (may not exist yet) ----
rf_model      <- NULL
rf_model_path <- "data/rf_model.rds"
if (file.exists(rf_model_path)) {
  rf_model <- readRDS(rf_model_path)
  cat("✅ Random Forest model loaded.\n")
} else {
  cat("⚠️  rf_model.rds not found. Run scripts/06_ml_models.R first to enable AQI prediction.\n")
}

pollutant_score_map <- c(
  "PM2.5" = 5, "PM10" = 4, "NO2" = 3, "SO2" = 3,
  "NH3" = 2, "CO" = 2, "O3" = 2, "Unknown" = 1
)

state_means <- aqi %>%
  group_by(state) %>%
  summarise(state_mean_aqi = mean(aqi_value, na.rm = TRUE), .groups = "drop")

aqi_colors <- c(
  "Good" = "#2ecc71", "Satisfactory" = "#a8e063", "Moderate" = "#f39c12",
  "Poor" = "#e67e22", "Very Poor" = "#e74c3c", "Severe" = "#8e1a1a"
)

get_aqi_status <- function(val) {
  if (val <= 50)  "Good"
  else if (val <= 100) "Satisfactory"
  else if (val <= 200) "Moderate"
  else if (val <= 300) "Poor"
  else if (val <= 400) "Very Poor"
  else "Severe"
}

# ============================================================
# UI
# ============================================================
ui <- fluidPage(

  tags$head(
    tags$style(HTML("
      body { background-color: #1a1a2e; font-family: 'Segoe UI', sans-serif; color: #eee; }
      .navbar { background-color: #16213e; }
      .sidebar { background-color: #16213e; border-radius: 10px; padding: 15px; }
      .main-panel { background-color: #0f3460; border-radius: 10px; padding: 15px; }
      h1, h3, h4 { color: #e94560; }
      .shiny-input-container label { color: #aed6f1; font-weight: bold; }
      .metric-box {
        background: linear-gradient(135deg, #16213e, #0f3460);
        border-left: 4px solid #e94560;
        border-radius: 8px;
        padding: 15px;
        margin: 8px 0;
        text-align: center;
      }
      .metric-box h4 { color: #e94560; margin: 0; font-size: 13px; }
      .metric-box h2 { color: #fff; margin: 5px 0 0 0; font-size: 22px; }
      .predict-box {
        background: linear-gradient(135deg, #0f3460, #16213e);
        border: 2px solid #e94560;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        margin-top: 15px;
      }
      .predict-box h2 { color: #f39c12; font-size: 36px; margin: 5px 0; }
      .predict-box h4 { color: #aaa; font-size: 14px; }
      .predict-status { font-size: 20px; font-weight: bold; margin-top: 10px; }
      .btn-primary { background-color: #e94560; border-color: #e94560; border-radius: 6px; }
      .btn-primary:hover { background-color: #c0392b; }
      .tab-content { background-color: transparent !important; }
    "))
  ),

  # ---- Title ----
  fluidRow(
    column(12,
      div(style = "text-align:center; padding: 20px 0;",
          h1("🌿 India AQI Analysis Dashboard"),
          h4(style="color:#aaa;",
             "Air Quality Index Analysis & Prediction | Real India Data")
      )
    )
  ),

  # ---- Sidebar + Main ----
  sidebarLayout(
    sidebarPanel(
      class = "sidebar",
      h4("🔧 Filters"),
      selectInput("state_filter", "Select State:",
                  choices = c("All States", state_list),
                  selected = "All States"),
      dateRangeInput("date_range", "Date Range:",
                     start = min(aqi$date, na.rm = TRUE),
                     end   = max(aqi$date, na.rm = TRUE),
                     min   = min(aqi$date, na.rm = TRUE),
                     max   = max(aqi$date, na.rm = TRUE)),
      hr(style = "border-color: #e94560;"),
      h4("🤖 Predict AQI"),
      selectInput("pred_state", "State:", choices = state_list, selected = "Delhi"),
      sliderInput("pred_month", "Month:", min = 1, max = 12, value = 1, step = 1),
      sliderInput("pred_stations", "Monitoring Stations:", min = 1, max = 20, value = 3),
      selectInput("pred_pollutant", "Prominent Pollutant:",
                  choices = names(pollutant_score_map),
                  selected = "PM2.5"),
      actionButton("predict_btn", "🔮 Predict AQI", class = "btn btn-primary",
                   width = "100%"),
      hr(style = "border-color: #e94560;"),
      div(class = "predict-box",
          h4("Predicted AQI"),
          h2(textOutput("pred_aqi_value")),
          div(class = "predict-status", textOutput("pred_aqi_status"))
      )
    ),

    mainPanel(
      tabsetPanel(
        id = "main_tabs",

        # ---- Tab 1: Overview ----
        tabPanel("📊 Overview",
          br(),
          fluidRow(
            column(3, div(class="metric-box", h4("Avg AQI"),   h2(textOutput("met_avg")))),
            column(3, div(class="metric-box", h4("Max AQI"),   h2(textOutput("met_max")))),
            column(3, div(class="metric-box", h4("Min AQI"),   h2(textOutput("met_min")))),
            column(3, div(class="metric-box", h4("Records"),   h2(textOutput("met_count"))))
          ),
          br(),
          plotlyOutput("plot_trend", height = "350px"),
          br(),
          plotlyOutput("plot_category", height = "300px")
        ),

        # ---- Tab 2: State Analysis ----
        tabPanel("🗺️ State Analysis",
          br(),
          plotlyOutput("plot_states", height = "500px"),
          br(),
          plotlyOutput("plot_state_monthly", height = "350px")
        ),

        # ---- Tab 3: Pollutant Analysis ----
        tabPanel("🏭 Pollutant Analysis",
          br(),
          plotlyOutput("plot_pollutant_dist", height = "400px"),
          br(),
          plotlyOutput("plot_pollutant_aqi", height = "350px")
        ),

        # ---- Tab 4: Data Table ----
        tabPanel("📋 Data Table",
          br(),
          DT::dataTableOutput("data_table")
        )
      )
    )
  )
)

# ============================================================
# SERVER
# ============================================================
server <- function(input, output, session) {

  # ---- Filtered Data ----
  filtered_data <- reactive({
    df <- aqi %>%
      filter(date >= input$date_range[1], date <= input$date_range[2])
    if (input$state_filter != "All States") {
      df <- df %>% filter(state == input$state_filter)
    }
    df
  })

  # ---- Metrics ----
  output$met_avg   <- renderText({ round(mean(filtered_data()$aqi_value, na.rm=TRUE), 1) })
  output$met_max   <- renderText({ max(filtered_data()$aqi_value, na.rm=TRUE) })
  output$met_min   <- renderText({ min(filtered_data()$aqi_value, na.rm=TRUE) })
  output$met_count <- renderText({ format(nrow(filtered_data()), big.mark=",") })

  # ---- Plot: Monthly Trend ----
  output$plot_trend <- renderPlotly({
    df <- filtered_data() %>%
      group_by(month_num) %>%
      summarise(avg_aqi = mean(aqi_value, na.rm=TRUE), .groups="drop") %>%
      arrange(month_num)

    plot_ly(df, x = ~month_num, y = ~avg_aqi, type = "scatter", mode = "lines+markers",
            line = list(color="#e94560", width=2.5),
            marker = list(color="#e94560", size=8)) %>%
      layout(
        title = list(text = "Monthly AQI Trend", font = list(color="#fff")),
        plot_bgcolor  = "#16213e", paper_bgcolor = "#1a1a2e",
        font = list(color="#eee"),
        xaxis = list(title="Month", tickvals=1:12,
                     ticktext=c("Jan","Feb","Mar","Apr","May","Jun",
                                "Jul","Aug","Sep","Oct","Nov","Dec")),
        yaxis = list(title="Average AQI")
      )
  })

  # ---- Plot: Category Bar ----
  output$plot_category <- renderPlotly({
    df <- filtered_data() %>% count(air_quality_status) %>%
      mutate(air_quality_status = as.character(air_quality_status))
    plot_ly(df, x = ~air_quality_status, y = ~n, type = "bar",
            marker = list(color = unname(aqi_colors[df$air_quality_status]))) %>%
      layout(
        title = list(text = "AQI Category Distribution", font=list(color="#fff")),
        plot_bgcolor="#16213e", paper_bgcolor="#1a1a2e",
        font=list(color="#eee"),
        xaxis=list(title="Category"), yaxis=list(title="Count")
      )
  })

  # ---- Plot: Top States ----
  output$plot_states <- renderPlotly({
    df <- filtered_data() %>%
      group_by(state) %>%
      summarise(avg_aqi = mean(aqi_value, na.rm=TRUE), .groups="drop") %>%
      arrange(desc(avg_aqi)) %>% head(15)
    plot_ly(df, x=~avg_aqi, y=~reorder(state, avg_aqi), type="bar",
            orientation="h",
            marker=list(color=~avg_aqi, colorscale="RdYlGn", reversescale=TRUE)) %>%
      layout(
        title=list(text="Top 15 States by Avg AQI", font=list(color="#fff")),
        plot_bgcolor="#16213e", paper_bgcolor="#1a1a2e",
        font=list(color="#eee"),
        xaxis=list(title="Average AQI"), yaxis=list(title="")
      )
  })

  # ---- Plot: State x Monthly Heatmap ----
  output$plot_state_monthly <- renderPlotly({
    top_states <- filtered_data() %>%
      group_by(state) %>%
      summarise(avg=mean(aqi_value,na.rm=TRUE),.groups="drop") %>%
      arrange(desc(avg)) %>% head(8) %>% pull(state)

    df <- filtered_data() %>%
      filter(state %in% top_states) %>%
      group_by(state, month_num) %>%
      summarise(avg_aqi=mean(aqi_value,na.rm=TRUE),.groups="drop")

    plot_ly(df, x=~month_num, y=~state, z=~avg_aqi, type="heatmap",
            colorscale="RdYlGn", reversescale=TRUE) %>%
      layout(
        title=list(text="State × Month AQI Heatmap", font=list(color="#fff")),
        plot_bgcolor="#16213e", paper_bgcolor="#1a1a2e",
        font=list(color="#eee"),
        xaxis=list(title="Month", tickvals=1:12,
                   ticktext=c("Jan","Feb","Mar","Apr","May","Jun",
                              "Jul","Aug","Sep","Oct","Nov","Dec"))
      )
  })

  # ---- Plot: Pollutant Distribution ----
  output$plot_pollutant_dist <- renderPlotly({
    df <- filtered_data() %>%
      filter(prominent_pollutants != "Unknown") %>%
      count(prominent_pollutants) %>%
      arrange(desc(n))
    plot_ly(df, labels=~prominent_pollutants, values=~n, type="pie",
            textinfo="label+percent",
            marker=list(colors=c("#e94560","#f39c12","#3498db",
                                 "#2ecc71","#9b59b6","#1abc9c","#e67e22"))) %>%
      layout(
        title=list(text="Prominent Pollutant Share", font=list(color="#fff")),
        plot_bgcolor="#16213e", paper_bgcolor="#1a1a2e",
        font=list(color="#eee"), showlegend=TRUE
      )
  })

  # ---- Plot: Pollutant vs AQI ----
  output$plot_pollutant_aqi <- renderPlotly({
    df <- filtered_data() %>%
      filter(prominent_pollutants != "Unknown") %>%
      group_by(prominent_pollutants) %>%
      summarise(avg_aqi=mean(aqi_value,na.rm=TRUE), count=n(), .groups="drop") %>%
      filter(count >= 50) %>%
      arrange(desc(avg_aqi))
    plot_ly(df, x=~reorder(prominent_pollutants,-avg_aqi), y=~avg_aqi, type="bar",
            marker=list(color=~avg_aqi, colorscale="RdYlGn", reversescale=TRUE)) %>%
      layout(
        title=list(text="Avg AQI by Pollutant Type", font=list(color="#fff")),
        plot_bgcolor="#16213e", paper_bgcolor="#1a1a2e",
        font=list(color="#eee"),
        xaxis=list(title="Pollutant"), yaxis=list(title="Average AQI")
      )
  })

  # ---- Data Table ----
  output$data_table <- DT::renderDataTable({
    filtered_data() %>%
      select(date, state, area, aqi_value, air_quality_status,
             prominent_pollutants, number_of_monitoring_stations) %>%
      head(500)
  }, options = list(pageLength=10, scrollX=TRUE),
  style = "bootstrap")

  # ---- AQI Prediction ----
  pred_result <- eventReactive(input$predict_btn, {
    # Check if model is available
    if (is.null(rf_model)) {
      return(list(error = TRUE,
                  msg   = "Model not available. Please run scripts/06_ml_models.R first."))
    }

    state_mean <- state_means %>%
      filter(state == input$pred_state) %>%
      pull(state_mean_aqi)

    if (length(state_mean) == 0) state_mean <- mean(aqi$aqi_value, na.rm=TRUE)

    pol_score <- pollutant_score_map[input$pred_pollutant]
    m <- input$pred_month

    new_data <- data.frame(
      month_num                     = m,
      number_of_monitoring_stations = input$pred_stations,
      pollutant_score               = pol_score,
      season                        = ifelse(m %in% c(12,1,2), 1,
                                     ifelse(m %in% c(3,4,5), 2,
                                     ifelse(m %in% c(6,7,8), 3, 4))),
      is_winter                     = as.integer(m %in% c(11,12,1,2)),
      is_monsoon                    = as.integer(m %in% c(6,7,8,9)),
      state_mean_aqi                = state_mean
    )

    pred <- predict(rf_model, newdata = new_data)
    list(error = FALSE, value = round(max(0, pred), 1))
  })

  output$pred_aqi_value <- renderText({
    req(input$predict_btn)
    res <- pred_result()
    if (isTRUE(res$error)) "N/A" else res$value
  })

  output$pred_aqi_status <- renderText({
    req(input$predict_btn)
    res <- pred_result()
    if (isTRUE(res$error)) res$msg
    else paste("Status:", get_aqi_status(res$value))
  })
}

# ============================================================
# RUN APP
# ============================================================
shinyApp(ui = ui, server = server)
