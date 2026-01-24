# Model Trainning Report : Customer Behavioral Segmentation
## **project:** Ratail Transaction Clustering (GMM)
## **Date:** January 24 2026
## **Model Type:** Gaussian Mixture Model(soft clustering) 
---
# 1.Data Summary & Preprocessing
  1. **Features Used:** Quantity, UnitPrice, Hours, DayOfweek, Month.
  2. **Dropped Features:** TotalValue (redundancy/leakage), Description (metadata), CustomerID (identity).
  3. **Outlier Strategy:** IQR Method (1.5x) applied to financial metrics to ensure Gaussian stability.
  4. **Scaling:** StandardScaler applied to all numerical features to equalize feature influence.