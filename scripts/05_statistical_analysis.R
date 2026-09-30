# ============================================================
# PHASE 5: STATISTICAL ANALYSIS
# Project: Air Quality Index (AQI) Analysis and Prediction
# ============================================================

library(dplyr)
library(ggplot2)

setwd("G:/rproject")

cat("==============================================\n")
cat("  AQI ANALYSIS PROJECT - Phase 5: Statistical Analysis\n")
cat("==============================================\n\n")

# ---- Load Cleaned Data ----
aqi <- readRDS("data/aqi_clean.rds")

# ==================================================
# 5.1 DESCRIPTIVE STATISTICS
# ==================================================
cat("======================================\n")
cat("  5.1 DESCRIPTIVE STATISTICS\n")
cat("======================================\n")

desc_stats <- aqi %>%
  summarise(
    n        = n(),
    mean     = round(mean(aqi_value, na.rm = TRUE), 2),
    median   = median(aqi_value, na.rm = TRUE),
    sd       = round(sd(aqi_value, na.rm = TRUE), 2),
    min      = min(aqi_value, na.rm = TRUE),
    max      = max(aqi_value, na.rm = TRUE),
    q25      = quantile(aqi_value, 0.25, na.rm = TRUE),
    q75      = quantile(aqi_value, 0.75, na.rm = TRUE),
    skewness = round(mean((aqi_value - mean(aqi_value, na.rm=TRUE))^3,
                          na.rm=TRUE) / sd(aqi_value, na.rm=TRUE)^3, 3)
  )

cat("\nAQI Descriptive Statistics:\n")
print(as.data.frame(desc_stats))

cat("\nInterpretation:\n")
cat("- Mean AQI:", desc_stats$mean, "—",
    ifelse(desc_stats$mean <= 100, "Overall Satisfactory level across India.",
           "Moderate-to-Poor air quality across India."), "\n")
cat("- Skewness:", desc_stats$skewness, "—",
    ifelse(desc_stats$skewness > 0,
           "Right-skewed: more observations at lower AQI, with high-pollution extremes.",
           "Left-skewed: most values towards higher AQI."), "\n\n")

# ==================================================
# 5.2 ANOVA — AQI DIFFERENCES BETWEEN STATES
# ==================================================
cat("======================================\n")
cat("  5.2 ANOVA: AQI ACROSS STATES\n")
cat("======================================\n")

anova_result <- aov(aqi_value ~ state, data = aqi)
anova_summary <- summary(anova_result)
print(anova_summary)

p_value <- anova_summary[[1]][["Pr(>F)"]][1]
cat("\nInterpretation:\n")
if (p_value < 0.05) {
  cat("p-value =", signif(p_value, 4),
      "< 0.05 → SIGNIFICANT: AQI differs significantly across states.\n\n")
} else {
  cat("p-value =", signif(p_value, 4),
      ">= 0.05 → NOT significant: No significant difference across states.\n\n")
}

# ==================================================
# 5.3 ANOVA — AQI DIFFERENCES BY MONTH
# ==================================================
cat("======================================\n")
cat("  5.3 ANOVA: AQI ACROSS MONTHS\n")
cat("======================================\n")

anova_month <- aov(aqi_value ~ factor(month_num), data = aqi)
anova_month_sum <- summary(anova_month)
print(anova_month_sum)

p_month <- anova_month_sum[[1]][["Pr(>F)"]][1]
cat("\nInterpretation:\n")
if (p_month < 0.05) {
  cat("p-value =", signif(p_month, 4),
      "< 0.05 → SIGNIFICANT: AQI significantly varies across months (seasonal effect).\n\n")
} else {
  cat("p-value =", signif(p_month, 4),
      ">= 0.05 → NOT significant: No seasonal variation detected.\n\n")
}

# ==================================================
# 5.4 ANOVA — AQI BY POLLUTANT TYPE
# ==================================================
cat("======================================\n")
cat("  5.4 ANOVA: AQI ACROSS POLLUTANT TYPES\n")
cat("======================================\n")

anova_pol <- aov(aqi_value ~ prominent_pollutants, data = aqi)
anova_pol_sum <- summary(anova_pol)
print(anova_pol_sum)

p_pol <- anova_pol_sum[[1]][["Pr(>F)"]][1]
cat("\nInterpretation:\n")
if (p_pol < 0.05) {
  cat("p-value =", signif(p_pol, 4),
      "< 0.05 → SIGNIFICANT: Different pollutants cause significantly different AQI levels.\n\n")
} else {
  cat("p-value =", signif(p_pol, 4), ">= 0.05 → NOT significant.\n\n")
}

# ==================================================
# 5.5 T-TEST: COMPARING TWO STATES
# ==================================================
cat("======================================\n")
cat("  5.5 T-TEST: TOP 2 MOST POLLUTED STATES\n")
cat("======================================\n")

state_aqi <- readRDS("data/state_aqi.rds")
top2 <- as.character(head(state_aqi$state, 2))

state1_data <- aqi %>% filter(state == top2[1]) %>% pull(aqi_value)
state2_data <- aqi %>% filter(state == top2[2]) %>% pull(aqi_value)

cat("Comparing:", top2[1], "vs", top2[2], "\n")
t_result <- t.test(state1_data, state2_data)
print(t_result)

cat("\nInterpretation:\n")
if (t_result$p.value < 0.05) {
  cat("p-value =", round(t_result$p.value, 6),
      "< 0.05 → SIGNIFICANT: AQI in", top2[1], "is significantly different from", top2[2], "\n\n")
} else {
  cat("p-value =", round(t_result$p.value, 6),
      ">= 0.05 → No significant difference between these two states.\n\n")
}

# ==================================================
# 5.6 CORRELATION: MONITORING STATIONS vs AQI
# ==================================================
cat("======================================\n")
cat("  5.6 CORRELATION ANALYSIS\n")
cat("======================================\n")

cor_pearson  <- cor(aqi$number_of_monitoring_stations, aqi$aqi_value,
                    use = "complete.obs", method = "pearson")
cor_spearman <- cor(aqi$number_of_monitoring_stations, aqi$aqi_value,
                    use = "complete.obs", method = "spearman")

cat("Pearson Correlation (stations vs AQI)  :", round(cor_pearson,  4), "\n")
cat("Spearman Correlation (stations vs AQI) :", round(cor_spearman, 4), "\n\n")

interpret_cor <- function(r) {
  abs_r <- abs(r)
  dir   <- ifelse(r > 0, "positive", "negative")
  strength <- if (abs_r < 0.1) "negligible" else
              if (abs_r < 0.3) "weak" else
              if (abs_r < 0.5) "moderate" else "strong"
  paste(strength, dir, "correlation")
}

cat("Pearson  Interpretation:", interpret_cor(cor_pearson), "\n")
cat("Spearman Interpretation:", interpret_cor(cor_spearman), "\n\n")

# ==================================================
# 5.7 MONTHLY AQI STATISTICS TABLE
# ==================================================
cat("======================================\n")
cat("  5.7 MONTHLY AQI STATISTICS TABLE\n")
cat("======================================\n")

monthly_stats <- aqi %>%
  group_by(month_num, month) %>%
  summarise(
    mean   = round(mean(aqi_value, na.rm = TRUE), 2),
    median = median(aqi_value, na.rm = TRUE),
    sd     = round(sd(aqi_value, na.rm = TRUE), 2),
    min    = min(aqi_value, na.rm = TRUE),
    max    = max(aqi_value, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  arrange(month_num)

print(as.data.frame(monthly_stats))
cat("\n")

# ==================================================
# 5.8 VISUALIZATION: AQI DISTRIBUTION BY POLLUTANT (Violin)
# ==================================================
cat("--- Saving Statistical Visualization ---\n")

pol_filtered <- aqi %>%
  filter(prominent_pollutants != "Unknown") %>%
  group_by(prominent_pollutants) %>%
  filter(n() > 200) %>%
  ungroup()

p_violin <- ggplot(pol_filtered,
                   aes(x = reorder(prominent_pollutants, aqi_value, FUN = median),
                       y = aqi_value, fill = prominent_pollutants)) +
  geom_violin(trim = TRUE, alpha = 0.7) +
  geom_boxplot(width = 0.08, fill = "white", outlier.alpha = 0.2) +
  coord_flip() +
  labs(
    title    = "AQI Distribution by Pollutant Type (Violin + Box)",
    subtitle = "Statistical spread of AQI for each pollutant",
    x        = "Pollutant",
    y        = "AQI Value"
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title    = element_text(face = "bold", hjust = 0.5, size = 14),
    plot.subtitle = element_text(hjust = 0.5, color = "grey50"),
    legend.position = "none"
  )
print(p_violin)
ggsave("output/13_violin_aqi_pollutant.png", width = 12, height = 7, dpi = 150, bg = "white")
cat("Saved: 13_violin_aqi_pollutant.png\n\n")

# ---- Save results ----
saveRDS(monthly_stats, "data/monthly_stats.rds")
cat("Statistical results saved.\n")
cat("Phase 5 Complete! Proceed to 06_ml_models.R\n")
