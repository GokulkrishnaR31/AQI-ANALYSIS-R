# ============================================================
# PHASE 4: DATA VISUALIZATION
# Project: Air Quality Index (AQI) Analysis and Prediction
# ============================================================

library(ggplot2)
library(dplyr)
library(tidyr)
library(scales)   # For better axis formatting
library(forcats)  # For factor reordering in plots

setwd("G:/rproject")

cat("==============================================\n")
cat("  AQI ANALYSIS PROJECT - Phase 4: Visualization\n")
cat("==============================================\n\n")

# ---- Load Cleaned Data ----
aqi       <- readRDS("data/aqi_clean.rds")
state_aqi <- readRDS("data/state_aqi.rds")
monthly   <- readRDS("data/monthly_aqi.rds")
pollutant <- readRDS("data/pollutant_aqi.rds")
pol_dist  <- readRDS("data/pollutant_dist.rds")

# ---- Color Palette ----
aqi_colors <- c(
  "Good"         = "#2ecc71",
  "Satisfactory" = "#a8e063",
  "Moderate"     = "#f39c12",
  "Poor"         = "#e67e22",
  "Very Poor"    = "#e74c3c",
  "Severe"       = "#8e1a1a"
)

theme_aqi <- theme_minimal(base_size = 13) +
  theme(
    plot.title    = element_text(face = "bold", size = 15, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "grey50"),
    axis.text.x   = element_text(angle = 45, hjust = 1),
    legend.position = "bottom",
    panel.grid.minor = element_blank()
  )

save_plot <- function(filename, width = 10, height = 7) {
  ggsave(paste0("output/", filename), width = width, height = height,
         dpi = 150, bg = "white")
  cat("Saved:", filename, "\n")
}

# ==================================================
# PLOT 1: Histogram of AQI Values
# ==================================================
cat("\n--- Plot 1: AQI Distribution Histogram ---\n")
p1 <- ggplot(aqi, aes(x = aqi_value)) +
  geom_histogram(binwidth = 10, fill = "#3498db", color = "white", alpha = 0.85) +
  geom_vline(xintercept = mean(aqi$aqi_value, na.rm = TRUE),
             color = "red", linetype = "dashed", linewidth = 1) +
  annotate("text", x = mean(aqi$aqi_value, na.rm = TRUE) + 20,
           y = Inf, label = paste("Mean:", round(mean(aqi$aqi_value, na.rm = TRUE), 1)),
           vjust = 2, color = "red", size = 4) +
  labs(
    title    = "Distribution of AQI Values Across India",
    subtitle = "Red dashed line represents the mean AQI",
    x        = "AQI Value",
    y        = "Frequency"
  ) +
  theme_aqi
print(p1)
save_plot("01_aqi_histogram.png")

# ==================================================
# PLOT 2: AQI Category Bar Chart
# ==================================================
cat("--- Plot 2: AQI Category Distribution ---\n")
cat_data <- aqi %>%
  count(air_quality_status) %>%
  mutate(percentage = round(n / sum(n) * 100, 1))

p2 <- ggplot(cat_data, aes(x = air_quality_status, y = n,
                            fill = air_quality_status)) +
  geom_bar(stat = "identity", width = 0.7) +
  geom_text(aes(label = paste0(percentage, "%")),
            vjust = -0.5, fontface = "bold", size = 4) +
  scale_fill_manual(values = aqi_colors) +
  labs(
    title    = "AQI Category Distribution",
    subtitle = "Count of records per air quality category",
    x        = "Air Quality Status",
    y        = "Number of Records",
    fill     = "Category"
  ) +
  theme_aqi +
  theme(legend.position = "none")
print(p2)
save_plot("02_aqi_category_bar.png")

# ==================================================
# PLOT 3: Top 15 Most Polluted States (Horizontal Bar)
# ==================================================
cat("--- Plot 3: Top 15 Polluted States ---\n")
top_states <- state_aqi %>% head(15)

p3 <- ggplot(top_states, aes(x = reorder(state, avg_aqi), y = avg_aqi,
                              fill = avg_aqi)) +
  geom_bar(stat = "identity", width = 0.75) +
  geom_text(aes(label = round(avg_aqi, 1)), hjust = -0.2, size = 3.5) +
  scale_fill_gradient(low = "#f7dc6f", high = "#e74c3c") +
  coord_flip() +
  labs(
    title    = "Top 15 Most Polluted States",
    subtitle = "Ranked by Average AQI",
    x        = "State",
    y        = "Average AQI",
    fill     = "Avg AQI"
  ) +
  theme_aqi +
  theme(axis.text.x = element_text(angle = 0))
print(p3)
save_plot("03_top_states_bar.png", width = 12, height = 8)

# ==================================================
# PLOT 4: Monthly AQI Trend (Line Chart)
# ==================================================
cat("--- Plot 4: Monthly AQI Trend ---\n")
p4 <- ggplot(monthly, aes(x = month_num, y = avg_aqi)) +
  geom_line(color = "#e74c3c", linewidth = 1.5) +
  geom_point(color = "#c0392b", size = 3.5) +
  geom_area(fill = "#e74c3c", alpha = 0.15) +
  geom_text(aes(label = round(avg_aqi, 1)), vjust = -1, size = 3.5) +
  scale_x_continuous(breaks = 1:12,
                     labels = c("Jan","Feb","Mar","Apr","May","Jun",
                                "Jul","Aug","Sep","Oct","Nov","Dec")) +
  labs(
    title    = "Monthly AQI Trend",
    subtitle = "Average AQI across all cities by month",
    x        = "Month",
    y        = "Average AQI"
  ) +
  theme_aqi +
  theme(axis.text.x = element_text(angle = 0))
print(p4)
save_plot("04_monthly_trend.png")

# ==================================================
# PLOT 5: Box Plot - AQI by Top 10 States
# ==================================================
cat("--- Plot 5: Box Plot - AQI by State ---\n")
top10_states <- state_aqi %>% head(10) %>% pull(state)

p5 <- aqi %>%
  filter(state %in% top10_states) %>%
  ggplot(aes(x = reorder(state, aqi_value, FUN = median), y = aqi_value,
             fill = state)) +
  geom_boxplot(outlier.alpha = 0.3, outlier.size = 0.8) +
  coord_flip() +
  labs(
    title    = "AQI Distribution by Top 10 Polluted States",
    subtitle = "Box plot showing median, IQR, and outliers",
    x        = "State",
    y        = "AQI Value"
  ) +
  theme_aqi +
  theme(legend.position = "none",
        axis.text.x = element_text(angle = 0))
print(p5)
save_plot("05_boxplot_states.png", width = 12, height = 7)

# ==================================================
# PLOT 6: Density Plot of AQI
# ==================================================
cat("--- Plot 6: AQI Density Plot ---\n")
p6 <- ggplot(aqi, aes(x = aqi_value, fill = air_quality_status)) +
  geom_density(alpha = 0.5) +
  scale_fill_manual(values = aqi_colors) +
  labs(
    title    = "AQI Density Distribution by Air Quality Status",
    subtitle = "Overlapping density curves per category",
    x        = "AQI Value",
    y        = "Density",
    fill     = "Air Quality"
  ) +
  xlim(0, 600) +
  theme_aqi
print(p6)
save_plot("06_density_plot.png")

# ==================================================
# PLOT 7: Pollutant Distribution (Pie-style Bar)
# ==================================================
cat("--- Plot 7: Prominent Pollutant Distribution ---\n")
pol_top <- pol_dist %>%
  filter(prominent_pollutants != "Unknown") %>%
  arrange(desc(n))

p7 <- ggplot(pol_top, aes(x = reorder(prominent_pollutants, n),
                           y = n, fill = prominent_pollutants)) +
  geom_bar(stat = "identity", width = 0.7) +
  geom_text(aes(label = paste0(percentage, "%")),
            hjust = -0.2, size = 3.5) +
  coord_flip() +
  labs(
    title    = "Distribution of Prominent Pollutants",
    subtitle = "Which pollutant is most frequently the primary cause of pollution?",
    x        = "Pollutant",
    y        = "Number of Records"
  ) +
  theme_aqi +
  theme(legend.position = "none",
        axis.text.x = element_text(angle = 0))
print(p7)
save_plot("07_pollutant_distribution.png", width = 10, height = 7)

# ==================================================
# PLOT 8: Average AQI by Pollutant Type
# ==================================================
cat("--- Plot 8: Avg AQI by Pollutant ---\n")
pol_clean <- pollutant %>%
  filter(prominent_pollutants != "Unknown", count >= 100)

p8 <- ggplot(pol_clean, aes(x = reorder(prominent_pollutants, avg_aqi),
                             y = avg_aqi, fill = avg_aqi)) +
  geom_bar(stat = "identity", width = 0.7) +
  geom_text(aes(label = round(avg_aqi, 1)), hjust = -0.2, size = 3.5) +
  scale_fill_gradient(low = "#a8e063", high = "#e74c3c") +
  coord_flip() +
  labs(
    title    = "Average AQI by Prominent Pollutant",
    subtitle = "Which pollutant is associated with highest AQI?",
    x        = "Pollutant",
    y        = "Average AQI",
    fill     = "Avg AQI"
  ) +
  theme_aqi +
  theme(legend.position = "none",
        axis.text.x = element_text(angle = 0))
print(p8)
save_plot("08_aqi_by_pollutant.png")

# ==================================================
# PLOT 9: Scatter Plot - Monitoring Stations vs AQI
# ==================================================
cat("--- Plot 9: Scatter Plot - Stations vs AQI ---\n")
aqi_sample <- aqi %>% sample_n(min(5000, nrow(aqi)))  # Sample for speed

p9 <- ggplot(aqi_sample, aes(x = number_of_monitoring_stations, y = aqi_value,
                               color = air_quality_status)) +
  geom_jitter(alpha = 0.4, size = 1.5, width = 0.2) +
  geom_smooth(method = "lm", color = "black", se = TRUE, linetype = "dashed") +
  scale_color_manual(values = aqi_colors) +
  labs(
    title    = "Monitoring Stations vs AQI Value",
    subtitle = "Each point is one observation (sampled 5000 rows)",
    x        = "Number of Monitoring Stations",
    y        = "AQI Value",
    color    = "AQI Category"
  ) +
  theme_aqi
print(p9)
save_plot("09_scatter_stations_aqi.png")

# ==================================================
# PLOT 10: Stacked Bar - AQI Categories by State (Top 10)
# ==================================================
cat("--- Plot 10: AQI Category by State ---\n")
state_cat <- aqi %>%
  filter(state %in% top10_states) %>%
  count(state, air_quality_status) %>%
  group_by(state) %>%
  mutate(pct = n / sum(n) * 100)

p10 <- ggplot(state_cat, aes(x = reorder(state, -pct),
                              y = pct, fill = air_quality_status)) +
  geom_bar(stat = "identity", position = "stack") +
  scale_fill_manual(values = aqi_colors) +
  labs(
    title    = "AQI Category Composition by State",
    subtitle = "Top 10 most polluted states",
    x        = "State",
    y        = "Percentage (%)",
    fill     = "Air Quality"
  ) +
  theme_aqi
print(p10)
save_plot("10_category_by_state_stacked.png", width = 13, height = 7)

# ==================================================
# PLOT 11: Yearly Trend (if multiple years)
# ==================================================
cat("--- Plot 11: Yearly AQI Trend ---\n")
yearly <- readRDS("data/yearly_aqi.rds")

p11 <- ggplot(yearly, aes(x = year, y = avg_aqi)) +
  geom_line(color = "#9b59b6", linewidth = 1.5) +
  geom_point(color = "#8e44ad", size = 4) +
  geom_text(aes(label = round(avg_aqi, 1)), vjust = -1, size = 4) +
  scale_x_continuous(breaks = unique(yearly$year)) +
  labs(
    title    = "Year-wise AQI Trend",
    subtitle = "Average AQI across all India per year",
    x        = "Year",
    y        = "Average AQI"
  ) +
  theme_aqi +
  theme(axis.text.x = element_text(angle = 0))
print(p11)
save_plot("11_yearly_trend.png")

# ==================================================
# PLOT 12: Heatmap - State x Month AQI
# ==================================================
cat("--- Plot 12: State x Month Heatmap ---\n")
heatmap_data <- aqi %>%
  filter(state %in% top10_states) %>%
  group_by(state, month_num) %>%
  summarise(avg_aqi = mean(aqi_value, na.rm = TRUE), .groups = "drop")

p12 <- ggplot(heatmap_data, aes(x = factor(month_num), y = state,
                                 fill = avg_aqi)) +
  geom_tile(color = "white", linewidth = 0.5) +
  geom_text(aes(label = round(avg_aqi, 0)), size = 3.5, color = "black") +
  scale_fill_gradient2(low = "#2ecc71", mid = "#f39c12", high = "#e74c3c",
                       midpoint = 150) +
  scale_x_discrete(labels = c("Jan","Feb","Mar","Apr","May","Jun",
                               "Jul","Aug","Sep","Oct","Nov","Dec")) +
  labs(
    title    = "Average AQI Heatmap: Top States by Month",
    subtitle = "Darker red = worse air quality",
    x        = "Month",
    y        = "State",
    fill     = "Avg AQI"
  ) +
  theme_minimal(base_size = 12) +
  theme(plot.title    = element_text(face = "bold", hjust = 0.5, size = 14),
        plot.subtitle = element_text(hjust = 0.5, color = "grey50"),
        axis.text.x   = element_text(angle = 0))
print(p12)
save_plot("12_heatmap_state_month.png", width = 14, height = 8)

cat("\nAll 12 plots saved to output/ folder!\n")
cat("Phase 4 Complete! Proceed to 05_statistical_analysis.R\n")
