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
---

# 2.Model Architecture & Selection
   1. **Algorithm:** Gaussian Mixture Model(GMM)
   2. **Coviariance Type:** Ful
   3. **Hyperparameter Tuning:** K=4 was selected based on the Baysian information Criterion(BIC) "Elbow" point.
---
# 3.Quantitative Evaluation
The model was evaluated on internal cluster validity metrics:
  1. **silhouette Score:** 0.1578 (Reflects expected "soft" boundaries and natral behaviour overlap).
  2. **Davies-Boulin Index:** 1.5293 (indicates moderate seperation between clusters centers).
  3. **Calinski-Harabasz index:** 290,208 (High value confirming strong, dense patterns in the data).
---