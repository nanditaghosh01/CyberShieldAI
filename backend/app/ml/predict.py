import os
import joblib
import numpy as np
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

CLASSES = ["Legitimate", "Suspicious", "Phishing", "Malicious"]

def predict_url(url: str) -> dict:
    """
    Performs AI prediction on a given URL, returning classification,
    confidence score, probability distribution, and key risk indicators.
    """
    model = get_model()
    raw_features = extract_url_features(url)
    feature_vector = np.array([[raw_features[col] for col in FEATURE_COLUMNS]])

    prediction_idx = int(model.predict(feature_vector)[0])
    probabilities = model.predict_proba(feature_vector)[0]

    predicted_label = CLASSES[prediction_idx]
    confidence = float(probabilities[prediction_idx])

    prob_distribution = {
        CLASSES[i]: round(float(probabilities[i]), 4)
        for i in range(len(CLASSES))
    }

    # Identify influential risk factors for explainability
    risk_factors = []
    if raw_features["has_ip"] == 1:
        risk_factors.append({
            "factor": "IP Address as Hostname",
            "impact": "High",
            "description": "Legitimate sites rarely serve primary content on bare IP addresses; common indicator of malware C2 or unlisted phishing drop."
        })
    if raw_features["is_shortened"] == 1:
        risk_factors.append({
            "factor": "URL Shortener Detected",
            "impact": "Medium",
            "description": "Shortened URLs obscure destination targets and are frequently leveraged in phishing lures and SMS smishing."
        })
    if raw_features["has_punycode"] == 1:
        risk_factors.append({
            "factor": "Punycode / Homograph Attack",
            "impact": "High",
            "description": "Punycode (xn--) or non-ASCII characters indicate possible visual deception (IDN homograph spoofing)."
        })
    if raw_features["suspicious_keyword_count"] > 0:
        matched = ", ".join(raw_features["_matched_keywords"][:4])
        risk_factors.append({
            "factor": f"Suspicious Security Keywords ({raw_features['suspicious_keyword_count']})",
            "impact": "High" if raw_features["suspicious_keyword_count"] >= 2 else "Medium",
            "description": f"Targeting credentials/financial flows with keywords: [{matched}]."
        })
    if raw_features["typosquat_similarity"] >= 0.70:
        target = raw_features["_matched_target"]
        risk_factors.append({
            "factor": f"Typosquatting / Brand Impersonation ({target})",
            "impact": "Critical",
            "description": f"Domain closely resembles recognized brand '{target}' (similarity score: {raw_features['typosquat_similarity']:.2f})."
        })
    if raw_features["suspicious_tld"] == 1:
        risk_factors.append({
            "factor": "High-Risk Free/Low-Cost TLD",
            "impact": "Medium",
            "description": "Top-level domain has statistically high correlation with disposable spam and phishing campaigns."
        })
    if raw_features["is_https"] == 0:
        risk_factors.append({
            "factor": "Insecure Protocol (HTTP)",
            "impact": "Medium",
            "description": "Site lacks encrypted transit; traffic is vulnerable to interception and MITM tampering."
        })
    if raw_features["has_sensitive_extension"] == 1:
        risk_factors.append({
            "factor": "Executable / Dangerous File Extension",
            "impact": "Critical",
            "description": "Direct link to executable payload (.exe, .scr, .zip, .apk, .msi)."
        })
    if raw_features["entropy"] > 4.5:
        risk_factors.append({
            "factor": f"High URL Character Entropy ({raw_features['entropy']:.2f})",
            "impact": "Low",
            "description": "Unusually randomized character sequence in host or path."
        })
    if raw_features["count_subdomains"] >= 3:
        risk_factors.append({
            "factor": f"Excessive Subdomains ({raw_features['count_subdomains']})",
            "impact": "Medium",
            "description": "Deep subdomain nesting often used to disguise brand names in lower subdomains."
        })

    # AI narrative explanation
    if predicted_label in ["Phishing", "Malicious"]:
        explanation = (
            f"The AI model identified high-probability deceptive patterns characteristic of {predicted_label.lower()} activity. "
            f"Key indicators include {len(risk_factors)} identified risk attributes with a model confidence of {confidence*100:.1f}%."
        )
    elif predicted_label == "Suspicious":
        explanation = (
            f"The URL exhibits structural anomalies or risk indicators that deviate from standard legitimate web services. "
            f"Exercise caution before entering credentials or executing downloads."
        )
    else:
        explanation = (
            f"The URL conforms to standard legitimate domain structural heuristics. "
            f"Note: ML classification confidence is an indicator of structural normality, not an absolute guarantee of safety."
        )

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

