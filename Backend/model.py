import pandas as pd
import joblib
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, precision_recall_curve, average_precision_score
from sklearn.utils import resample
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline

def load_data(file_path="uploads/creditcard.csv"):
    try:
        print("Loading dataset...")
        df = pd.read_csv(file_path)
        print(f"Dataset Loaded: {df.shape[0]} rows, {df.shape[1]} columns")
        return df
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

def preprocess_data(df, method="smote"):
    print(f"Preprocessing data using: {method.upper()}")

    if "Class" not in df.columns:
        print("Error: 'Class' column not found.")
        return None, None

    X = df.drop(columns=["Class"])
    y = df["Class"]

    if method == "downsample":
        fraud = df[df['Class'] == 1]
        non_fraud = df[df['Class'] == 0]
        if len(fraud) > len(non_fraud):
            print("Error: Not enough non-fraud samples to downsample.")
            return None, None
        non_fraud_downsampled = resample(non_fraud, replace=False, n_samples=len(fraud), random_state=42)
        balanced_data = pd.concat([fraud, non_fraud_downsampled])
        print(f"Data Balanced using Downsampling: {len(balanced_data)} rows")
        return balanced_data.drop(columns=["Class"]), balanced_data["Class"]

    elif method == "smote":
        try:
            smote = SMOTE(random_state=42)
            X_resampled, y_resampled = smote.fit_resample(X, y)
            print(f"Data Balanced using SMOTE: {len(X_resampled)} rows")
            return X_resampled, y_resampled
        except Exception as e:
            print(f"Error during SMOTE: {e}")
            return None, None
    else:
        print("Invalid Method. Use 'downsample' or 'smote'.")
        return None, None

def train_model(df, model_path="fraud_model.pkl", method="smote"):
    try:
        if 'Class' not in df.columns:
            print("No 'Class' column found. Cannot train model.")
            return False

        X, y = preprocess_data(df, method)
        if X is None or y is None:
            return False

        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight='balanced',
                random_state=42
            ))
        ])

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

        print("Training model...")
        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        accuracy = accuracy_score(y_test, y_pred)
        avg_precision = average_precision_score(y_test, y_prob)

        print(f"Model Accuracy: {accuracy * 100:.2f}%")
        print(f"Average Precision Score: {avg_precision:.2f}")
        print("Classification Report:\n", classification_report(y_test, y_pred))

        feature_importance = pipeline.named_steps['classifier'].feature_importances_
        feature_names = X.columns
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': feature_importance
        }).sort_values('importance', ascending=False)
        
        print("\nTop 10 Most Important Features:")
        print(importance_df.head(10))

        try:
            joblib.dump(pipeline, model_path)
            
            if not os.path.exists(model_path):
                print("Model file was not created successfully.")
                return False
            
            model_size = os.path.getsize(model_path)
            print(f"Model File Size: {model_size / 1024:.2f} KB")
            
            try:
                loaded_pipeline = joblib.load(model_path)
                print("Model successfully saved and can be loaded back")
                
                test_pred = loaded_pipeline.predict(X_test[:5])
                print("Test prediction successful")
            except Exception as load_err:
                print(f"Error loading back the model: {load_err}")
                return False
            
            return True
        
        except Exception as save_err:
            print(f"Error saving model: {save_err}")
            return False

    except Exception as e:
        print(f"Error during model training: {e}")
        return False

def predict_fraud(df, model_path="fraud_model.pkl"):
    try:
        if not os.path.isfile(model_path):
            print(f"Model not found at {model_path}. Cannot predict.")
            return np.array([])

        print("Loading model for prediction...")
        
        try:
            pipeline = joblib.load(model_path)
        except Exception as load_err:
            print(f"Error loading model: {load_err}")
            return np.array([])

        X = df.copy()
        X = X.drop(columns=["Class"], errors='ignore')

        if X.isnull().sum().sum() > 0:
            print("Missing Values Detected - Filling with 0.")
            X = X.fillna(0)

        try:
            predictions = pipeline.predict(X)
            probabilities = pipeline.predict_proba(X)[:, 1]

            fraud_count = (predictions == 1).sum()
            non_fraud_count = (predictions == 0).sum()
            
            print("Predictions completed.")
            print(f"Fraudulent Transactions: {fraud_count}")
            print(f"Non-Fraudulent Transactions: {non_fraud_count}")
            print(f"Total Predictions: {len(predictions)}")

            high_confidence_threshold = 0.8
            high_confidence_frauds = (probabilities >= high_confidence_threshold).sum()
            print(f"High Confidence Frauds (>={high_confidence_threshold*100}%): {high_confidence_frauds}")

            return predictions

        except Exception as pred_err:
            print(f"Error during prediction: {pred_err}")
            return np.array([])

    except Exception as e:
        print(f"Unexpected error in fraud prediction: {e}")
        return np.array([])
    
if __name__ == "__main__":
    df = load_data()
    if df is not None:
        model_trained = train_model(df)
        
        if model_trained:
            print("Making predictions on the dataset...")
            predictions = predict_fraud(df)
            if len(predictions) > 0:
                print("Predictions completed successfully.")
            else:
                print("No predictions were made.")
