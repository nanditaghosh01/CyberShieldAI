import uuid
import datetime
from urllib.parse import urlparse
from ..utils.validators import normalize_url, validate_public_target
from ..ml.predict import predict_url
from .ssl_inspector import inspect_ssl_certificate
from .website_security import assess_website_security
from .domain_analyzer import analyze_domain
from .threat_intelligence import check_threat_intelligence
from .risk_scoring import calculate_unified_risk_score
from ..database import db_manager

def perform_full_security_scan(target_url: str, user_id: str = "anonymous") -> dict:
    """
    Orchestrates the comprehensive multi-module security scan:
    - URL Normalization & SSRF Pre-flight Validation
    - AI Phishing & Malicious URL Classification
    - SSL/TLS Cryptographic Inspection
    - Passive Website Security & Header Posture
    - Domain & DNS Threat Intelligence
    - Unified Multi-Factor Risk Scoring
    - Database Persistence
    """
    normalized = normalize_url(target_url)
    clean_url = normalized["url"]
    hostname = normalized["hostname"]
    port = normalized["port"]

    # SSRF protection verification (throws HTTPException 400 if private/reserved IP)
    validate_public_target(hostname)

    scan_id = str(uuid.uuid4())
    scan_timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Module 1: AI-Powered Phishing Detection
    ai_result = predict_url(clean_url)

    # Module 2: Website Security Assessment (Headers, Cookies, Sensitive paths)
    web_security = assess_website_security(clean_url)

    # Module 3: SSL/TLS Certificate Validation
    ssl_result = inspect_ssl_certificate(hostname, port)

    # Module 4: Domain & Threat Intelligence
    domain_result = analyze_domain(clean_url)
    threat_intel = check_threat_intelligence(clean_url)

    # Module 5: Unified Risk Scoring
    risk_summary = calculate_unified_risk_score(
        ai_result=ai_result,
        threat_intel=threat_intel,
        ssl_result=ssl_result,
        web_security=web_security,
        domain_result=domain_result
    )

    full_scan_record = {
        "id": scan_id,
        "url": clean_url,
        "domain": hostname,
        "scan_timestamp": scan_timestamp,
        "user_id": user_id,
        "risk_score": risk_summary["overall_risk_score"],
        "risk_category": risk_summary["risk_category"],
        "threat_classification": risk_summary["threat_classification"],
        "detection_confidence": risk_summary["detection_confidence"],
        "color_code": risk_summary["color_code"],
        "details": {
            "ai_detection": ai_result,
            "ssl_inspection": ssl_result,
            "website_security": web_security,
            "domain_intelligence": domain_result,
            "threat_intelligence": threat_intel,
            "risk_scoring": risk_summary
        }
    }

    # Persist to database
    try:
        db_manager.insert_scan(full_scan_record)
    except Exception as e:
        print(f"[Scan Persistence Warning]: {e}")

    return full_scan_record

