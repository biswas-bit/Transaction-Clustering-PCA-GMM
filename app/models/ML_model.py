import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib
import pandas as pd
import os

class Segmenter:
    def __init__(self, model_path:str):
        """ loads the gmm pipeline (scaler and gmm)"""
        self.pipeline = None
        self.features = ['Quantity', 'UnitPrice', 'Hours', 'DayOfweek']
        
        try:
            # Try to load with numpy compatibility
            if not os.path.exists(model_path):
                print(f"Model file not found: {model_path}")
                return
                
            self.pipeline = joblib.load(model_path)
            print(f"Successfully loaded model from {model_path}")
        except ImportError as e:
            print(f"Import error loading model: {e}")
            # Try reinstalling numpy or using workaround
            self.pipeline = None
        except Exception as e:
            print(f"Failed to load model from {model_path}: {e}")
            # Don't raise - allow the app to continue without ML functionality
            self.pipeline = None
        
    def get_cluster(self, data:list ):
        """ predict the clusters """
        if self.pipeline is None:
            return 0  # Return default cluster if model not loaded
        input_df = pd.DataFrame([data], columns =self.features)
        cluster = self.pipeline.predict(input_df)
        return int(cluster[0])
    
    def get_probabilities(self, data:list):
        """ Returns the probability of the input belonging to each of the 4 clusters """
        if self.pipeline is None:
            return [0.25, 0.25, 0.25, 0.25]  # Return equal probabilities if model not loaded
        input_df = pd.DataFrame([data],columns =self.features)
        probs = self.pipeline.predict_proba(input_df)
        return probs[0].tolist()
    
    

        
