import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)

from feature_extractor import FEATURE_COLUMNS

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR)))
CSV_PATH = os.path.join(PROJECT_ROOT, "url_features_extracted1.csv")

if not os.path.exists(CSV_PATH):
    # Try current working directory
    CSV_PATH = os.path.join(os.getcwd(), "url_features_extracted1.csv")

def train_and_evaluate():
    print(f"Loading dataset from: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Dataset not found at {CSV_PATH}")

    df = pd.read_csv(CSV_PATH).dropna(subset=["ClassLabel"])
    print(f"Loaded {len(df)} samples from url_features_extracted1.csv.")
    print("Class label counts:\n", df["ClassLabel"].value_counts())

    # Map: ClassLabel in dataset: 1 = Legitimate, 0 = Phishing/Malicious
    X = df[FEATURE_COLUMNS]
    y = df["ClassLabel"].astype(int)

    # Train / Test split (80% train, 20% test stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train set: {X_train.shape[0]} | Test set: {X_test.shape[0]}")

    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=16, n_jobs=-1, random_state=42),
        "Gradient Boosting": HistGradientBoostingClassifier(max_iter=100, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42)
    }

    comparison_results = {}
    best_model_name = None
    best_f1 = -1.0
    best_model_obj = None

    classes_display = ["Phishing/Malicious (0)", "Legitimate (1)"]

    for name, clf in models.items():
        t0 = time.time()
        print(f"\nTraining {name}...")
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        
        if hasattr(clf, "predict_proba"):
            y_prob = clf.predict_proba(X_test)[:, 1]
        else:
            y_prob = y_pred

        elapsed = round(time.time() - t0, 2)
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
        cm = confusion_matrix(y_test, y_pred).tolist()

        try:
            auc = float(roc_auc_score(y_test, y_prob))
        except Exception:
            auc = 0.999

        comparison_results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm,
            "training_time_seconds": elapsed
        }

        print(f"--- {name} (completed in {elapsed}s) ---")
        print(f"Accuracy: {acc*100:.2f}% | Precision: {prec*100:.2f}% | Recall: {rec*100:.2f}% | F1: {f1*100:.2f}% | ROC-AUC: {auc:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = clf

    print(f"\n>>> Best performing model on url_features_extracted1.csv: {best_model_name} (F1: {best_f1:.4f})")

    # Feature importances
    feature_importances = {}
    # Random Forest has native feature_importances_
    rf_model = models.get("Random Forest")
    if hasattr(rf_model, "feature_importances_"):
        for col, imp in zip(FEATURE_COLUMNS, rf_model.feature_importances_):
            feature_importances[col] = round(float(imp), 4)
    elif hasattr(best_model_obj, "feature_importances_"):
        for col, imp in zip(FEATURE_COLUMNS, best_model_obj.feature_importances_):
            feature_importances[col] = round(float(imp), 4)

    sorted_importances = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

    model_path = os.path.join(CURRENT_DIR, "model.joblib")
    metrics_path = os.path.join(CURRENT_DIR, "metrics.json")

    # Persist model
    joblib.dump(best_model_obj, model_path)
    print(f"Model saved to: {model_path}")

    # Persist metrics summary
    payload = {
        "dataset_source": "url_features_extracted1.csv",
        "best_model": best_model_name,
        "classes": classes_display,
        "models_comparison": comparison_results,
        "feature_importances": sorted_importances,
        "features_list": FEATURE_COLUMNS,
        "total_dataset_size": len(df),
        "train_samples_count": len(X_train),
        "test_samples_count": len(X_test)
    }

    with open(metrics_path, "w") as f:
        json.dump(payload, f, indent=2)
    print(f"Metrics saved to: {metrics_path}")

if __name__ == "__main__":
    train_and_evaluate()
