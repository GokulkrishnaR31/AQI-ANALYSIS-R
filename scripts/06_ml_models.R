# ============================================================
# PHASE 6: MACHINE LEARNING — AQI PREDICTION
# Project: Air Quality Index (AQI) Analysis and Prediction
# Models: Linear Regression, Random Forest
# ============================================================

# ---- Auto-install required packages if missing ----
required <- c("dplyr", "randomForest", "Metrics", "ggplot2")
missing  <- required[!required %in% installed.packages()[, "Package"]]
if (length(missing) > 0) {
  cat("Installing missing packages:", paste(missing, collapse = ", "), "\n")
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(dplyr)
library(randomForest)  # Random Forest model
library(Metrics)       # RMSE, MAE metrics
library(ggplot2)

setwd("G:/rproject")

cat("==============================================\n")
cat("  AQI ANALYSIS PROJECT - Phase 6: Machine Learning\n")
cat("==============================================\n\n")

# ---- Load Cleaned Data ----
aqi <- readRDS("data/aqi_clean.rds")
cat("Loaded data:", nrow(aqi), "rows\n\n")

# ==================================================
# 6.1 FEATURE ENGINEERING
# ==================================================
cat("======================================\n")
cat("  6.1 FEATURE ENGINEERING\n")
cat("======================================\n")

# Create numeric features from categorical variables
# One-hot encode pollutant type using model.matrix or numeric encoding
aqi_ml <- aqi %>%
  mutate(
    # Encode pollutant as numeric AQI hazard level
    pollutant_score = case_when(
      prominent_pollutants == "PM2.5" ~ 5,
      prominent_pollutants == "PM10"  ~ 4,
      prominent_pollutants == "NO2"   ~ 3,
      prominent_pollutants == "SO2"   ~ 3,
      prominent_pollutants == "NH3"   ~ 2,
      prominent_pollutants == "CO"    ~ 2,
      prominent_pollutants == "O3"    ~ 2,
      TRUE ~ 1
    ),
    # Encode season
    season = case_when(
      month_num %in% c(12, 1, 2)  ~ 1,  # Winter
      month_num %in% c(3, 4, 5)   ~ 2,  # Spring/Summer
      month_num %in% c(6, 7, 8)   ~ 3,  # Monsoon
      month_num %in% c(9, 10, 11) ~ 4   # Autumn
    ),
    # State average AQI as a numeric feature (label encoding via lookup)
    is_winter = as.integer(month_num %in% c(11, 12, 1, 2)),
    is_monsoon = as.integer(month_num %in% c(6, 7, 8, 9))
  )

# Compute state-level mean AQI to use as feature
state_means <- aqi_ml %>%
  group_by(state) %>%
  summarise(state_mean_aqi = mean(aqi_value, na.rm = TRUE), .groups = "drop")

aqi_ml <- aqi_ml %>%
  left_join(state_means, by = "state")

# Final ML feature set
aqi_ml_final <- aqi_ml %>%
  select(
    aqi_value,                    # Target variable
    month_num,                    # Month (1-12)
    number_of_monitoring_stations, # Station count
    pollutant_score,              # Pollutant severity
    season,                       # Season
    is_winter,                    # Winter flag
    is_monsoon,                   # Monsoon flag
    state_mean_aqi                # State-level avg AQI
  ) %>%
  filter(complete.cases(.))       # Remove any remaining NAs

cat("ML dataset size:", nrow(aqi_ml_final), "rows,", ncol(aqi_ml_final), "columns\n")
cat("Features:", paste(names(aqi_ml_final)[-1], collapse = ", "), "\n\n")

# ==================================================
# 6.2 TRAIN-TEST SPLIT (80/20)
# ==================================================
cat("======================================\n")
cat("  6.2 TRAIN-TEST SPLIT\n")
cat("======================================\n")

set.seed(42)  # For reproducibility

n           <- nrow(aqi_ml_final)
train_index <- sample(seq_len(n), size = floor(0.80 * n))
train_data  <- aqi_ml_final[train_index, ]
test_data   <- aqi_ml_final[-train_index, ]

cat("Training set:", nrow(train_data), "rows (80%)\n")
cat("Testing set :", nrow(test_data),  "rows (20%)\n\n")

# Separate features and target
X_train <- train_data %>% select(-aqi_value)
y_train <- train_data$aqi_value
X_test  <- test_data  %>% select(-aqi_value)
y_test  <- test_data$aqi_value

# ==================================================
# 6.3 MODEL 1: LINEAR REGRESSION
# ==================================================
cat("======================================\n")
cat("  6.3 MODEL 1: LINEAR REGRESSION\n")
cat("======================================\n")

cat("Training Linear Regression...\n")
lr_model <- lm(aqi_value ~ ., data = train_data)

# Summary
cat("\n--- Model Summary ---\n")
print(summary(lr_model))

# Predictions
lr_preds <- predict(lr_model, newdata = test_data)

# Metrics
lr_rmse <- rmse(y_test, lr_preds)
lr_mae  <- mae(y_test, lr_preds)
lr_r2   <- cor(y_test, lr_preds)^2

cat("\n--- Linear Regression Evaluation ---\n")
cat("RMSE :", round(lr_rmse, 4), "\n")
cat("MAE  :", round(lr_mae,  4), "\n")
cat("R²   :", round(lr_r2,   4), "\n\n")

# ==================================================
# 6.4 MODEL 2: RANDOM FOREST
# ==================================================
cat("======================================\n")
cat("  6.4 MODEL 2: RANDOM FOREST\n")
cat("======================================\n")

cat("Training Random Forest (this may take 1-2 minutes)...\n")

set.seed(42)
# Use a sample if dataset is very large (for speed); full if feasible
if (nrow(train_data) > 50000) {
  cat("Large dataset detected. Sampling 50,000 rows for Random Forest...\n")
  train_sample <- train_data %>% sample_n(50000)
} else {
  train_sample <- train_data
}

rf_model <- randomForest(
  aqi_value ~ .,
  data       = train_sample,
  ntree      = 200,         # 200 trees for good balance of speed vs accuracy
  mtry       = 3,           # Number of features at each split
  importance = TRUE,        # For variable importance plot
  na.action  = na.omit
)

cat("Random Forest training complete!\n")
print(rf_model)

# Predictions
rf_preds <- predict(rf_model, newdata = test_data)

# Metrics
rf_rmse <- rmse(y_test, rf_preds)
rf_mae  <- mae(y_test, rf_preds)
rf_r2   <- cor(y_test, rf_preds)^2

cat("\n--- Random Forest Evaluation ---\n")
cat("RMSE :", round(rf_rmse, 4), "\n")
cat("MAE  :", round(rf_mae,  4), "\n")
cat("R²   :", round(rf_r2,   4), "\n\n")

# ==================================================
# 6.5 MODEL COMPARISON TABLE
# ==================================================
cat("======================================\n")
cat("  6.5 MODEL COMPARISON\n")
cat("======================================\n")

comparison <- data.frame(
  Model = c("Linear Regression", "Random Forest"),
  RMSE  = round(c(lr_rmse, rf_rmse), 4),
  MAE   = round(c(lr_mae,  rf_mae),  4),
  R2    = round(c(lr_r2,   rf_r2),   4)
)

print(comparison)

best_model <- comparison$Model[which.min(comparison$RMSE)]
cat("\nBest Model by RMSE:", best_model, "\n")
cat("Lower RMSE = better prediction accuracy\n\n")

# ==================================================
# 6.6 VARIABLE IMPORTANCE (Random Forest)
# ==================================================
cat("======================================\n")
cat("  6.6 VARIABLE IMPORTANCE PLOT\n")
cat("======================================\n")

importance_df <- as.data.frame(importance(rf_model)) %>%
  tibble::rownames_to_column("Feature") %>%
  arrange(desc(`%IncMSE`))

cat("Feature Importance:\n")
print(importance_df)

# Plot
p_imp <- ggplot(importance_df,
                aes(x = reorder(Feature, `%IncMSE`), y = `%IncMSE`, fill = `%IncMSE`)) +
  geom_bar(stat = "identity", width = 0.7) +
  geom_text(aes(label = round(`%IncMSE`, 1)), hjust = -0.2, size = 4) +
  scale_fill_gradient(low = "#a8e063", high = "#e74c3c") +
  coord_flip() +
  labs(
    title    = "Random Forest — Variable Importance",
    subtitle = "% Increase in MSE when feature is permuted",
    x        = "Feature",
    y        = "% Increase in MSE",
    fill     = "Importance"
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title    = element_text(face = "bold", hjust = 0.5, size = 14),
    plot.subtitle = element_text(hjust = 0.5, color = "grey50"),
    legend.position = "none"
  )
print(p_imp)
ggsave("output/14_rf_variable_importance.png", width = 10, height = 7, dpi = 150, bg = "white")
cat("Saved: 14_rf_variable_importance.png\n\n")

# ==================================================
# 6.7 ACTUAL vs PREDICTED PLOTS
# ==================================================
cat("--- Saving Actual vs Predicted Plots ---\n")

# Linear Regression
pred_df_lr <- data.frame(Actual = y_test, Predicted = lr_preds)
p_lr <- ggplot(pred_df_lr %>% sample_n(min(3000, nrow(pred_df_lr))),
               aes(x = Actual, y = Predicted)) +
  geom_point(alpha = 0.3, color = "#3498db", size = 1.2) +
  geom_abline(intercept = 0, slope = 1, color = "red",
              linetype = "dashed", linewidth = 1) +
  labs(
    title    = "Linear Regression: Actual vs Predicted AQI",
    subtitle = paste("RMSE:", round(lr_rmse, 2), "| R²:", round(lr_r2, 3)),
    x        = "Actual AQI",
    y        = "Predicted AQI"
  ) +
  theme_minimal(base_size = 13) +
  theme(plot.title    = element_text(face = "bold", hjust = 0.5),
        plot.subtitle = element_text(hjust = 0.5, color = "grey50"))
print(p_lr)
ggsave("output/15_lr_actual_vs_predicted.png", width = 9, height = 7, dpi = 150, bg = "white")
cat("Saved: 15_lr_actual_vs_predicted.png\n")

# Random Forest
pred_df_rf <- data.frame(Actual = y_test, Predicted = rf_preds)
p_rf <- ggplot(pred_df_rf %>% sample_n(min(3000, nrow(pred_df_rf))),
               aes(x = Actual, y = Predicted)) +
  geom_point(alpha = 0.3, color = "#e74c3c", size = 1.2) +
  geom_abline(intercept = 0, slope = 1, color = "black",
              linetype = "dashed", linewidth = 1) +
  labs(
    title    = "Random Forest: Actual vs Predicted AQI",
    subtitle = paste("RMSE:", round(rf_rmse, 2), "| R²:", round(rf_r2, 3)),
    x        = "Actual AQI",
    y        = "Predicted AQI"
  ) +
  theme_minimal(base_size = 13) +
  theme(plot.title    = element_text(face = "bold", hjust = 0.5),
        plot.subtitle = element_text(hjust = 0.5, color = "grey50"))
print(p_rf)
ggsave("output/16_rf_actual_vs_predicted.png", width = 9, height = 7, dpi = 150, bg = "white")
cat("Saved: 16_rf_actual_vs_predicted.png\n\n")

# ==================================================
# 6.8 SAVE MODELS AND RESULTS
# ==================================================
saveRDS(lr_model,   "data/lr_model.rds")
saveRDS(rf_model,   "data/rf_model.rds")
saveRDS(comparison, "data/model_comparison.rds")

cat("Models and comparison saved.\n")
cat("Phase 6 Complete! Proceed to 07_shiny_dashboard.R\n")
