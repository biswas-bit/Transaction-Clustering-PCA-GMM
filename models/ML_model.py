"""
ML Model Loader for Customer Segmentation
This file loads a pre-trained customer segmentation model from a pickle file.
"""

import pickle
import sys
import os

# Add the project root to Python path to find models
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

file_path = os.path.join(project_root, 'models', 'Customer_Segmentation_v1.pkl')

print(f"Python version: {sys.version}")
print(f"Loading model from: {file_path}")
print("="*60)

try:
    with open(file_path, 'rb') as file:
        model = pickle.load(file)

    # 1. See the object type
    print("Type:", type(model))

    # 2. See ALL attributes and methods
    print("\nAll attributes/methods:")
    print(dir(model))

    # 3. See only public methods (no dunders)
    print("\nPublic methods/attributes:")
    print([m for m in dir(model) if not m.startswith('_')])

    # 4. See the object's own properties (not inherited)
    print("\nObject __dict__:")
    print(model.__dict__)

    # 5. If it's a sklearn model, this shows full config (wrapped in try-except)
    try:
        print("\nModel params:")
        print(model.get_params())
    except AttributeError:
        print("\nNote: This model doesn't have sklearn's get_params() method.")

except ModuleNotFoundError as e:
    print(f"\nERROR: Required module not found: {e}")
    print("\nPlease install scikit-learn:")
    print("  pip install scikit-learn")
    sys.exit(1)

except pickle.UnpicklingError as e:
    print(f"\nERROR: Failed to unpickle the model file: {e}")
    print("\nThis is likely due to a version mismatch.")
    print("The model was created with a different version of Python or libraries.")
    print("\nPossible solutions:")
    print("1. Recreate the model using the current Python environment")
    print("2. Use the same Python version that was used to create the model")
    sys.exit(1)

except Exception as e:
    print(f"\nERROR: Failed to load model: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

