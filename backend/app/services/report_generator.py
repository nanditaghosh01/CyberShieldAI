import datetime

def generate_text_security_report(scan_data: dict) -> str:
    """
    Generates a detailed, professional ASCII / Markdown security audit report.
    """
    url = scan_data.get("url", "")
    domain = scan_data.get("domain", "")
    timestamp = scan_data.get("scan_timestamp", datetime.datetime.now(datetime.timezone.utc).isoformat())
    risk_score = scan_data.get("risk_score", 0.0)
    risk_category = scan_data.get("risk_category", "Unknown")
    threat_class = scan_data.get("threat_classification", "Unknown")
    
    details = scan_data.get("details", {})
    ai = details.get("ai_detection", {})
    ssl = details.get("ssl_inspection", {})
    web = details.get("website_security", {})
    risk = details.get("risk_scoring", {})

    report = f"""================================================================================
CYBERSHIELD AI – INTELLIGENT SECURITY AUDIT REPORT
Generated: {timestamp}
Scan ID: {scan_data.get("id")}
================================================================================

1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
Target URL:              {url}
Target Domain:           {domain}
Overall Risk Score:      {risk_score} / 100
Risk Category:           {risk_category}
Threat Classification:   {threat_class}
AI Model Confidence:     {scan_data.get("detection_confidence", 0.0) * 100:.1f}%

2. MULTI-FACTOR RISK BREAKDOWN
--------------------------------------------------------------------------------
- AI Phishing & Malicious URL Engine:  {risk.get("breakdown", {}).get("ai_score", 0)} / 100
- Threat Intelligence Feeds:          {risk.get("breakdown", {}).get("threat_intel_score", 0)} / 100
- SSL/TLS Cryptographic Posture:      {risk.get("breakdown", {}).get("ssl_score", 0)} / 100
- Website Security & Headers:         {risk.get("breakdown", {}).get("web_security_score", 0)} / 100
- Domain & DNS Integrity:             {risk.get("breakdown", {}).get("domain_dns_score", 0)} / 100

3. AI PHISHING ANALYSIS
--------------------------------------------------------------------------------
Prediction:              {ai.get("prediction", "N/A")}
Explanation:             {ai.get("explanation", "N/A")}

Identified Structural Risk Indicators:
"""
    for rf in ai.get("risk_factors", []):
        report += f"  [*] [{rf.get('impact')}] {rf.get('factor')}: {rf.get('description')}\n"

    report += f"""
4. SSL/TLS CERTIFICATE & CRYPTOGRAPHIC EVALUATION
--------------------------------------------------------------------------------
Valid Certificate:       {ssl.get("is_valid", False)}
Issuer Common Name:      {ssl.get("issuer", {}).get("common_name", "N/A")}
Issuer Organization:     {ssl.get("issuer", {}).get("organization", "N/A")}
Validity Window:         {ssl.get("valid_from", "N/A")} to {ssl.get("valid_to", "N/A")}
Days Remaining:          {ssl.get("days_remaining", 0)}
Self-Signed Status:      {ssl.get("is_self_signed", False)}
TLS Version:             {ssl.get("tls_version", "N/A")}
Cipher Suite:            {ssl.get("cipher_suite", "N/A")}
Public Key:              {ssl.get("public_key_algorithm", "N/A")} ({ssl.get("key_size", 0)} bits)
CT Logs (SCT):           {ssl.get("has_sct_transparency", False)}

Findings:
"""
    for f in ssl.get("findings", []):
        report += f"  [-] [{f.get('severity')}] {f.get('name')}: {f.get('impact')}\n"

    report += f"""
5. WEB SECURITY POSTURE & VULNERABILITIES
--------------------------------------------------------------------------------
HTTPS Enforced:          {web.get("https_enforced", False)}
Overall Grade:           {web.get("posture_grade", "N/A")}
Missing Headers:         {', '.join(web.get("missing_headers", [])) or 'None'}

Key Security Findings:
"""
    for v in web.get("vulnerabilities", []):
        report += f"  [-] [{v.get('severity')}] {v.get('name')}\n"
        report += f"      Impact:      {v.get('impact')}\n"
        report += f"      Remediation: {v.get('remediation')}\n"

    report += f"""
6. RECOMMENDED ACTIONS
--------------------------------------------------------------------------------
"""
    for action in risk.get("recommended_actions", []):
        report += f"  [>] {action}\n"

    report += f"""
================================================================================
DISCLAIMER:
{risk.get("disclaimer", "Passive security analysis. Not an absolute guarantee.")}
================================================================================
"""
    return report

