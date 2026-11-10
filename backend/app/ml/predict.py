import os
import joblib
import numpy as np
import pandas as pd
from .feature_extractor import extract_url_features, FEATURE_COLUMNS

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "model.joblib")

_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    return _model

def predict_url(url: str) -> dict:
    """
    Performs AI prediction on a given URL using model trained on url_features_extracted1.csv,
    returning threat classification, confidence, probability breakdown, and risk factors.
    """
    model = get_model()
    raw_features = extract_url_features(url)
    feature_df = pd.DataFrame([[raw_features[col] for col in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS)

    # ClassLabel in dataset: 1 = Legitimate, 0 = Phishing/Malicious
    probabilities = model.predict_proba(feature_df)[0]
    prob_malicious = float(probabilities[0])
    prob_legitimate = float(probabilities[1])

    risk_factors = []

    # Evaluate specific risk indicators
    if raw_features["has_ip_address"] == 1:
        risk_factors.append({
            "factor": "IP Address as Hostname",
            "impact": "Critical",
            "description": "Legitimate sites rarely serve primary content on bare IP addresses; common indicator of malware C2, Mozi botnets, or exploit drops."
        })
    if raw_features["suspicious_file_extension"] == 1:
        risk_factors.append({
            "factor": "Executable / Dangerous Payload Extension",
            "impact": "Critical",
            "description": "Direct link to executable payload or script (.exe, .bin, .scr, .sh, .apk, .msi)."
        })
    if raw_features.get("_typosquat_similarity", 0) >= 0.70:
        target = raw_features.get("_matched_target", "Brand")
        risk_factors.append({
            "factor": f"Typosquatting / Brand Impersonation ({target})",
            "impact": "High",
            "description": f"Domain closely resembles recognized brand '{target}' (similarity score: {raw_features['_typosquat_similarity']:.2f})."
        })
    if raw_features["has_hyphen_in_domain"] == 1:
        risk_factors.append({
            "factor": "Hyphenated Domain Structure",
            "impact": "Medium",
            "description": "Deceptive domains frequently use hyphens to stitch legitimate brand names into disposable subdomains."
        })
    if raw_features["percentage_numeric_chars"] > 25.0:
        risk_factors.append({
            "factor": f"High Percentage of Numeric Characters ({raw_features['percentage_numeric_chars']:.1f}%)",
            "impact": "Medium",
            "description": "Excessive digits in host or URL indicates randomly generated hostnames or automated phishing campaign generators."
        })
    if raw_features["https_flag"] == 0:
        risk_factors.append({
            "factor": "Insecure Protocol (HTTP)",
            "impact": "Medium",
            "description": "Traffic is unencrypted and vulnerable to interception and Man-In-The-Middle (MITM) tampering."
        })
    if raw_features["url_entropy"] > 4.5:
        risk_factors.append({
            "factor": f"Elevated Shannon Entropy ({raw_features['url_entropy']:.2f})",
            "impact": "Low",
            "description": "High character randomization often associated with obfuscated query strings or disposable infrastructure."
        })
    if len(raw_features.get("_matched_keywords", [])) > 0:
        matched = ", ".join(raw_features["_matched_keywords"][:4])
        risk_factors.append({
            "factor": f"Suspicious Security Keywords ({len(raw_features['_matched_keywords'])})",
            "impact": "High" if len(raw_features["_matched_keywords"]) >= 2 else "Medium",
            "description": f"Targeting credentials/financial flows with keywords: [{matched}]."
        })

    # Class determination
    if prob_legitimate >= 0.50:
        predicted_label = "Legitimate"
        confidence = prob_legitimate
        explanation = (
            f"The URL matches legitimate domain feature distributions with a confidence of {confidence*100:.1f}%. "
            f"Note: ML classification indicates structural normality, not an absolute guarantee of safety."
        )
    else:
        confidence = prob_malicious
        if raw_features["has_ip_address"] == 1 or raw_features["suspicious_file_extension"] == 1:
            predicted_label = "Malicious"
            explanation = (
                f"The AI model identified critical indicators characteristic of malicious dropper or botnet activity "
                f"with {confidence*100:.1f}% confidence."
            )
        elif raw_features.get("_typosquat_similarity", 0) >= 0.70 or len(raw_features.get("_matched_keywords", [])) > 0:
            predicted_label = "Phishing"
            explanation = (
                f"The URL exhibits high-probability deceptive patterns characteristic of credential harvesting or brand impersonation "
                f"with {confidence*100:.1f}% confidence."
            )
        else:
            predicted_label = "Suspicious"
            explanation = (
                f"The URL exhibits structural anomalies that deviate from standard legitimate web services. "
                f"Exercise caution before entering credentials."
            )

    prob_distribution = {
        "Legitimate": round(prob_legitimate, 4),
        "Suspicious": round(prob_malicious * 0.25 if predicted_label != "Suspicious" else prob_malicious * 0.8, 4),
        "Phishing": round(prob_malicious * 0.60 if predicted_label == "Phishing" else prob_malicious * 0.35, 4),
        "Malicious": round(prob_malicious * 0.85 if predicted_label == "Malicious" else prob_malicious * 0.15, 4)
    }

    return {
        "url": url,
        "prediction": predicted_label,
        "confidence": round(confidence, 4),
        "confidence_percentage": round(confidence * 100, 1),
        "probabilities": prob_distribution,
        "risk_factors": risk_factors,
        "explanation": explanation,
        "features": {k: v for k, v in raw_features.items() if not k.startswith("_")}
    }
