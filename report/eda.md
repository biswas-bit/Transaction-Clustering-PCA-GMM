# Exploratory Data Analysis (EDA)

## 1. Numerica Data Analysis
### 1.1 Quantity Analysis
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

### 1.2 Temporal Range (InvoiceDate)
Analyzes the time span of the transactions.

- **Start Date:** `2010-12-01 08:26:00`  
- **End Date:** `2011-12-09 12:50:00`  
- **Average Date:** Around **July 4, 2011**  
- Observation: Data spans **approximately one year**, providing a complete seasonal view.

---

### 1.3 Unit Price Distribution
Pricing metrics for products in the catalog.

- **Pricing Tiers:**  
  - **25% (Budget):** ≤ $1.25  
  - **50% (Standard, Median):** $2.08  
  - **75% (Premium):** ≥ $4.13  

- **Note:**  
  - Minimum price: **-$11,062.06**, which likely represents **errors or refunds**.  
  - Data cleaning is recommended before financial modeling.

---

### 1.4. Customer Coverage
Insight into customer data quality.

- **Active Customers:** **406,829** records with valid `CustomerID`.  
- **Missing Data:** Approximately **135,080 rows** (~25%) lack `CustomerID`.  
- Observation: Missing data may impact **customer-level analysis** and **segmentation**.

---

## 2. Categorical Feature Analysis

This section explores the non-numeric metadata of the transactional dataset. Initial observation reveals high cardinality in product identifiers and a heavy geographical bias toward the domestic market.

### 2.1 Feature Summary Table
The table below summarizes the distribution of the primary categorical variables across **541,909** records.

| Feature | Unique Count | Top Value | Frequency | Business Insight |
| :--- | :--- | :--- | :--- | :--- |
| **InvoiceNo** | 25,900 | `573585` | 1,114 | High frequency in single invoices suggests bulk/B2B purchasing. |
| **StockCode** | 4,070 | `85123A` | 2,313 | Inventory is diverse, but sales are concentrated in top SKUs. |
| **Description** | 4,223 | `WHITE HANGING HEART...` | 2,369 | This "Anchor Product" serves as a primary entry point for customers. |
| **Country** | 38 | `United Kingdom` | 495,478 | **91.4% Market Share** is domestic; international is a growth niche. |

Here InvoiceNO and Stockcode is removed cause they are just identifier's for transactions they don't make any sense for model.

---

### 2.2 Key Data Insights

#### A. The "Wholesaler" Signature
The presence of **Invoice 573585**, which contains **1,114 unique entries**, indicates that the dataset includes wholesale or B2B (Business-to-Business) entities. 
* **Model Impact:** These outliers can skew K-Means centroids. They are treated as a distinct "Wholesaler" segment to avoid diluting the "Retail Shopper" personas.

#### B. High Cardinality & Dimensionality
With over **4,000 unique product descriptions**, using standard encoding techniques (like One-Hot Encoding) would lead to the *Curse of Dimensionality*, expanding the dataset into 4,000+ sparse columns.
* **Modeling Strategy:** Instead of encoding product names, we engineered features such as **"Variety of Products Bought"** and **"Average Items per Transaction"** to capture behavior without overwhelming the model.



#### C. Geographical Concentration
The vast majority of transactions occur in the **United Kingdom (91.4%)**.
* **Strategic Action:** For marketing purposes, the "Country" feature is collapsed into a binary category: **Domestic (UK)** vs. **International**. This simplifies the model while retaining the most important geographical distinction.



---

### 2.3 Implications for Modeling
The categorical analysis confirms that the data is not "isotropic" (uniform). The high frequency of specific items and the dominance of the UK market suggest that a **Centroid-based approach (K-Means)** will be effective at slicing the main "Retail Cloud," while **DBSCAN** may be useful specifically for isolating the massive B2B invoices as outliers.

## 3.Handaling MIssing Values
A neglible portion of the dataset (**0.27%**) was found to have missing values in the "description" column.

### Strategy: Mode Imputation
- **Action:** Missing values were replaced with the mode : ' "WHITE HANGING HEART T-LIGHT HOLDER" '.
- **Justification:** Given the extremly low percentage of the missingness, this imputation maintains the dataset's integrity without introducing significant bias into the transactional clusters.
- **Alternative Considered:** Deletion was rejected to preserve the associated 'UnitPrice' amd 'Quantity' data, which are vital for the soft Clustering (GMM) probability calculations.

---

## 4.Date Time Analysis
### Findings:
1. **Daily Cycle:** Transactions peak between **12:00 and 15:00**, suggesting a business-heavy operating window.
2. **weekly Cycle:** A significant drop-off is observed on **saturday and Wednesday**, indicating a specific operational constraint in the data source (likely a closed warehouse).
3. **Monthly Momentum:** there is a clear upward trend moving into **sept-Nov** then little decrement in the **dec**. 

---

## 5.Handling Data Redundancy
An audit for duplicate records was conducted to ensure the statistical integrity of the clusters.

- **Discovery:** Approximately **5268** records were identified as exact duplicates across all feature dimensions.
- **Action:** Duplicate rows were removed using the `drop_duplicates()` method.
- **Impact on Modeling:** This step prevents the Gaussian Mixture Model from "over-learning" specific transactional signatures and ensures that the membership probabilities are based on unique economic events rather than logging errors.