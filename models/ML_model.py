import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import joblib
import pandas as pd

class Segmenter:
    def __init__(self, model_path:str):
        """ loads the gmm pipeline (scaler and gmm)"""
        try:
            self.pipeline = joblib.load(model_path)
            self.features = ['Quantity', 'UnitPrice', 'Hours', 'DayOfweek']
        except Exception as e:
            raise Exception(f"failed to load model from {model_path} : {e}")
        
    def get_cluster(self, data:list ):
        """ predict the clusters """
        input_df = pd.DataFrame([data], columns =self.features)
        cluster = self.pipeline.predict(input_df)
        return int(cluster[0])
    
    def get_probabilities(self, data:list):
        """ Returns the probability of the input belonginh to eachof the 4 clusters """
        input_df = pd.DataFrame([data],columns = self.features)
        probs = self.pipeline.predict_proba(input_df)
        return probs[0].tolist()
    
    
data = np.array([6,2.55,8,2])  
cluster = Segmenter('models/Customer_Segmentation_v1.pkl')
predictions = cluster.get_cluster(data)
proba = cluster.get_probabilities(data)
print(predictions)
print(proba)
input("press to exit..")
    
        
