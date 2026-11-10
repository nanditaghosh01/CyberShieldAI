from typing import Dict, Any, List

def calculate_unified_risk_score(
    ai_result: dict,
    threat_intel: dict,
    ssl_result: dict,
    web_security: dict,
    domain_result: dict
) -> dict:
    """
    Computes transparent multi-factor risk score (0-100) combining 5 security dimensions:
    - AI Phishing Classification (Weight: 35%)
    - Threat Intelligence Feeds (Weight: 25%)
    - SSL/TLS Cryptographic Posture (Weight: 20%)
    - Website Security & HTTP Headers (Weight: 10%)
    - Domain & DNS Integrity (Weight: 10%)
    """

    # 1. AI Phishing Sub-Score (0-100)
    ai_pred = ai_result.get("prediction", "Legitimate")
    ai_conf = ai_result.get("confidence", 0.5)
    
    if ai_pred == "Malicious":
        ai_score = 95.0 * ai_conf
    elif ai_pred == "Phishing":
        ai_score = 88.0 * ai_conf
    elif ai_pred == "Suspicious":
        ai_score = 55.0 * ai_conf
    else:
        ai_score = 10.0 * (1.0 - ai_conf)

    # 2. Threat Intel Sub-Score (0-100)
    # reputation_score is 100 for clean, 0 for known malicious
    threat_rep = threat_intel.get("reputation_score", 100)
    intel_score = (100.0 - threat_rep)
    if threat_intel.get("is_flagged"):
        intel_score = max(intel_score, 90.0)

    # 3. SSL/TLS Sub-Score (0-100)
    ssl_score = 0.0
    ssl_findings = ssl_result.get("findings", [])
    if ssl_result.get("is_self_signed"):
        ssl_score += 50.0
    if ssl_result.get("is_expired"):
        ssl_score += 65.0
    for finding in ssl_findings:
        sev = finding.get("severity")
        if sev == "Critical":
            ssl_score += 35.0
        elif sev == "High":
            ssl_score += 20.0
        elif sev == "Medium":
            ssl_score += 10.0
    ssl_score = min(ssl_score, 100.0)

    # 4. Web Security Posture Sub-Score (0-100)
    web_score = 0.0
    if not web_security.get("https_enforced"):
        web_score += 40.0
    missing_count = len(web_security.get("missing_headers", []))
    web_score += min(missing_count * 8.0, 45.0)
    for vuln in web_security.get("vulnerabilities", []):
        if vuln.get("severity") == "High":
            web_score += 25.0
    web_score = min(web_score, 100.0)

    # 5. Domain / DNS Integrity Sub-Score (0-100)
    dns_score = 0.0
    dns_findings = domain_result.get("findings", [])
    for f in dns_findings:
        if f.get("severity") == "High":
            dns_score += 40.0
        elif f.get("severity") == "Medium":
            dns_score += 25.0
        elif f.get("severity") == "Low":
            dns_score += 12.0
    dns_score = min(dns_score, 100.0)

    # Weighted Composite Score
    weights = {
        "ai_detection": 0.35,
        "threat_intel": 0.25,
        "ssl_tls": 0.20,
        "web_security": 0.10,
        "domain_dns": 0.10
    }

    raw_overall = (
        ai_score * weights["ai_detection"] +
        intel_score * weights["threat_intel"] +
        ssl_score * weights["ssl_tls"] +
        web_score * weights["web_security"] +
        dns_score * weights["domain_dns"]
    )

    # Hard overrides: Confirmed blacklist match or direct malware binary forces High/Critical
    if threat_intel.get("is_flagged") or ai_pred == "Malicious":
        overall_score = max(raw_overall, 85.0)
    elif ai_pred == "Phishing":
        overall_score = max(raw_overall, 75.0)
    else:
        overall_score = raw_overall

    overall_score = round(min(max(overall_score, 0.0), 100.0), 1)

    # Risk Category mapping (Using custom 5-color palette & harmful red shades)
    if overall_score <= 20.0:
        risk_category = "Low Risk"
        threat_class = "Legitimate"
        color_code = "#a9d8de" # Swatch 3: Ice Blue / Aqua
    elif overall_score <= 40.0:
        risk_category = "Moderate Risk"
        threat_class = "Suspicious" if ai_pred != "Legitimate" else "Legitimate (Hardening Recommended)"
        color_code = "#457b9d" # Swatch 2: Steel Cerulean
    elif overall_score <= 60.0:
        risk_category = "Elevated Risk"
        threat_class = "Suspicious"
        color_code = "#f86b76" # Harmful alert red (light)
    elif overall_score <= 80.0:
        risk_category = "High Risk"
        threat_class = "Phishing" if ai_pred == "Phishing" else "High Threat"
        color_code = "#e83845" # Swatch 5: Harmful Primary Coral Red
    else:
        risk_category = "Critical Risk"
        threat_class = "Malicious"
        color_code = "#a81b26" # Harmful Deep Crimson Red

    # Consolidate Major Findings
    major_findings = []
    for rf in ai_result.get("risk_factors", []):
        major_findings.append({
            "source": "AI URL Engine",
            "title": rf["factor"],
            "severity": rf["impact"],
            "description": rf["description"]
        })
    for f in ssl_findings:
        major_findings.append({
            "source": "SSL/TLS Inspector",
            "title": f["name"],
            "severity": f["severity"],
            "description": f["impact"]
        })
    for v in web_security.get("vulnerabilities", []):
        if v.get("severity") in ["Critical", "High", "Medium"]:
            major_findings.append({
                "source": "Web Posture Assessment",
                "title": v["name"],
                "severity": v["severity"],
                "description": v["explanation"]
            })
    for mf in threat_intel.get("matched_feeds", []):
        major_findings.append({
            "source": "Threat Intelligence",
            "title": f"Flagged by {mf['source']}",
            "severity": "Critical",
            "description": f"Categorized as {mf['category']} with {mf['confidence']} confidence."
        })

    # Recommended Action Items
    recommended_actions = []
    if overall_score >= 61.0:
        recommended_actions.append("Do NOT submit any credentials, personal identity info, or payment card details.")
        recommended_actions.append("Block domain at boundary firewall, DNS sinkhole, and web proxy filters.")
        recommended_actions.append("Report domain to antiphishing authorities (APWG, Google Safe Browsing, CISA).")
    elif overall_score >= 41.0:
        recommended_actions.append("Verify the organization's identity through an independent, verified communication channel.")
        recommended_actions.append("Inspect the full destination domain to verify there is no subtle typosquatting.")
        recommended_actions.append("Enable Multi-Factor Authentication (MFA) with FIDO2/WebAuthn to prevent credential replay.")
    else:
        recommended_actions.append("Domain appears structurally normal and passes active baseline checks.")
        recommended_actions.append("Implement missing HTTP security headers (HSTS, CSP) to achieve optimal security posture.")
        recommended_actions.append("Maintain continuous Certificate Transparency monitoring to detect rogue issuance.")

    return {
        "overall_risk_score": overall_score,
        "risk_category": risk_category,
        "threat_classification": threat_class,
        "detection_confidence": round(ai_conf, 4),
        "color_code": color_code,
        "breakdown": {
            "ai_score": round(ai_score, 1),
            "threat_intel_score": round(intel_score, 1),
            "ssl_score": round(ssl_score, 1),
            "web_security_score": round(web_score, 1),
            "domain_dns_score": round(dns_score, 1),
            "weights": weights
        },
        "major_findings": major_findings,
        "recommended_actions": recommended_actions,
        "disclaimer": "CyberShield AI risk scores represent multi-source threat heuristics and posture assessments; a low score does not constitute an absolute guarantee that a website is free from compromise."
    }

