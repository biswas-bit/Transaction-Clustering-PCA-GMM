from models import Segmenter
import numpy as np

data = np.array([2,200,13,3])  
cluster = Segmenter('app/models/Customer_Segmentation_v1.pkl')
predictions = cluster.get_cluster(data)
proba = cluster.get_probabilities(data)
print(predictions)
print(proba)
input("press to exit..")
    