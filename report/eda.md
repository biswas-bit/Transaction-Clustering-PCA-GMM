# Exploratory Data Analysis (EDA)

## 1. Quantity Analysis
Tracks the volume of items per transaction.

- **Central Tendency:**  
  - Average purchase: **9.55 units**  
  - Median purchase: **3.0 units**  
  - Observation: Distribution is **right-skewed**, with many small purchases and a few very large ones.

- **Dispersion:**  
  - Standard deviation: **218.08**  
  - Maximum: **80,995 units**  
  - Indicates presence of **significant outliers**.

- **Anomalies:**  
  - Minimum: **-80,995 units**, likely representing **returns or cancellations**.

---

## 2. Temporal Range (InvoiceDate)
Analyzes the time span of the transactions.

- **Start Date:** `2010-12-01 08:26:00`  
- **End Date:** `2011-12-09 12:50:00`  
- **Average Date:** Around **July 4, 2011**  
- Observation: Data spans **approximately one year**, providing a complete seasonal view.

---

## 3. Unit Price Distribution
Pricing metrics for products in the catalog.

- **Pricing Tiers:**  
  - **25% (Budget):** ≤ $1.25  
  - **50% (Standard, Median):** $2.08  
  - **75% (Premium):** ≥ $4.13  

- **Note:**  
  - Minimum price: **-$11,062.06**, which likely represents **errors or refunds**.  
  - Data cleaning is recommended before financial modeling.

---

## 4. Customer Coverage
Insight into customer data quality.

- **Active Customers:** **406,829** records with valid `CustomerID`.  
- **Missing Data:** Approximately **135,080 rows** (~25%) lack `CustomerID`.  
- Observation: Missing data may impact **customer-level analysis** and **segmentation**.
