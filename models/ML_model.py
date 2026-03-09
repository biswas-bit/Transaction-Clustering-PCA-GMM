import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib

try:
  model_path = 'models/Customer_Segmentation_v1.pkl'
  pipeline = joblib.load(model_path)
  print("successfully loaded")
except Exception as e:
    print(f"error occured:{e}")
