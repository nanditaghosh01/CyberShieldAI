import httpx
from urllib.parse import urlparse
from typing import List, Dict, Any

SECURITY_HEADERS_SPECS = {
    "Strict-Transport-Security": {
        "recommended": "max-age=31536000; includeSubDomains; preload",
        "description": "Enforces secure (HTTPS) connections and prevents SSL-stripping man-in-the-middle attacks.",
        "severity_if_missing": "Medium"
    },
    "Content-Security-Policy": {
        "recommended": "default-src 'self' ...",
        "description": "Mitigates Cross-Site Scripting (XSS), clickjacking, and code injection vulnerabilities.",
        "severity_if_missing": "High"
    },
    "X-Frame-Options": {
        "recommended": "DENY or SAMEORIGIN",
        "description": "Protects against UI redress attacks (Clickjacking) by restricting frame embedding.",
        "severity_if_missing": "Medium"
    },
    "X-Content-Type-Options": {
        "recommended": "nosniff",
        "description": "Prevents MIME-sniffing attacks where browsers misinterpret file types as executable script.",
        "severity_if_missing": "Low"
    },
    "Referrer-Policy": {
        "recommended": "strict-origin-when-cross-origin or no-referrer",
        "description": "Controls privacy leakage by restricting referer headers sent across origins.",
        "severity_if_missing": "Low"
    },
    "Permissions-Policy": {
        "recommended": "camera=(), microphone=(), geolocation=()",
        "description": "Explicitly disables risky browser APIs and sensors in subordinate frames.",
        "severity_if_missing": "Low"
    }
}

SAFE_SENSITIVE_FILES_PROBE = [
    "/.env",
    "/.git/HEAD",
    "/config.json",
    "/docker-compose.yml",
    "/phpinfo.php"
]

def assess_website_security(target_url: str) -> dict:
    """
    Performs passive, safe web security assessment checking headers, cookies,
    server disclosure, HTTPS enforcement, and exposed configuration files.
    """
    parsed = urlparse(target_url)
    hostname = parsed.hostname or target_url
    scheme = parsed.scheme or "https"
    base_url = f"{scheme}://{hostname}"

    headers_found = {}
    missing_headers = []
    vulnerabilities = []
    cookie_analysis = []
    server_disclosures = []
    exposed_files = []
    https_enforced = (scheme == "https")

    try:
        client_kwargs = {
            "timeout": 5.0,
            "follow_redirects": True,
            "verify": False  # allow inspecting even untrusted sites
        }
        with httpx.Client(**client_kwargs) as client:
            # 1. Main HTTP/HTTPS probe
            response = client.get(target_url, headers={"User-Agent": "CyberShield-AI-SecurityScanner/1.0"})
            
            # Record status and final URL
            final_url = str(response.url)
            if final_url.startswith("https://"):
                https_enforced = True

            # Analyze headers
            resp_headers = {k.lower(): v for k, v in response.headers.items()}

            for header_name, spec in SECURITY_HEADERS_SPECS.items():
                low_name = header_name.lower()
                if low_name in resp_headers:
                    val = resp_headers[low_name]
                    headers_found[header_name] = {
                        "present": True,
                        "value": val,
                        "description": spec["description"]
                    }
                else:
                    headers_found[header_name] = {
                        "present": False,
                        "value": None,
                        "description": spec["description"]
                    }
                    missing_headers.append(header_name)
                    vulnerabilities.append({
                        "name": f"Missing Security Header: {header_name}",
                        "severity": spec["severity_if_missing"],
                        "explanation": f"The HTTP response does not include the '{header_name}' header.",
                        "impact": spec["description"],
                        "remediation": f"Configure web server to return '{header_name}: {spec['recommended']}'."
                    })

            # Check server disclosure
            if "server" in resp_headers:
                srv_val = resp_headers["server"]
                server_disclosures.append(f"Server: {srv_val}")
                vulnerabilities.append({
                    "name": "Server Information Disclosure",
                    "severity": "Low",
                    "explanation": f"Server header banner reveals underlying software: '{srv_val}'.",
                    "impact": "Aids threat actors in fingerprinting specific software versions for known CVE exploits.",
                    "remediation": "Configure web server (e.g. ServerTokens Prod in Apache, server_tokens off in Nginx) to suppress version details."
                })

            if "x-powered-by" in resp_headers:
                pwr_val = resp_headers["x-powered-by"]
                server_disclosures.append(f"X-Powered-By: {pwr_val}")
                vulnerabilities.append({
                    "name": "X-Powered-By Header Information Leak",
                    "severity": "Low",
                    "explanation": f"Header reveals backend technology framework: '{pwr_val}'.",
                    "impact": "Exposes stack components (PHP, Express, ASP.NET) to reconnaissance.",
                    "remediation": "Disable the X-Powered-By header in application framework configurations."
                })

            # Check cookies
            for cookie in client.cookies.jar:
                is_secure = cookie.secure
                is_httponly = cookie.has_nonstandard_attr("httponly") or "httponly" in getattr(cookie, "_rest", {})
                samesite = getattr(cookie, "samesite", "None")

                cookie_analysis.append({
                    "name": cookie.name,
                    "domain": cookie.domain,
                    "secure": is_secure,
                    "httponly": is_httponly,
                    "samesite": samesite
                })

                if not is_secure and scheme == "https":
                    vulnerabilities.append({
                        "name": f"Cookie '{cookie.name}' Missing 'Secure' Flag",
                        "severity": "Medium",
                        "explanation": "Cookie can be transmitted over unencrypted HTTP channels.",
                        "impact": "Exposes session identifier to network sniffing / interception.",
                        "remediation": "Set the 'Secure' attribute on all sensitive session cookies."
                    })

                if not is_httponly:
                    vulnerabilities.append({
                        "name": f"Cookie '{cookie.name}' Missing 'HttpOnly' Flag",
                        "severity": "Medium",
                        "explanation": "Cookie is accessible via client-side JavaScript document.cookie API.",
                        "impact": "If an XSS vulnerability exists, attackers can directly harvest session tokens.",
                        "remediation": "Set 'HttpOnly' flag on all session cookies."
                    })

            # Check passive safe sensitive files probe
            for sensitive_path in SAFE_SENSITIVE_FILES_PROBE:
                probe_url = f"{base_url}{sensitive_path}"
                try:
                    head_res = client.head(probe_url, timeout=2.5)
                    # If 200 OK and content-length > 0 or has body
                    if head_res.status_code == 200:
                        content_type = head_res.headers.get("content-type", "").lower()
                        # Verify it's not a generic SPA index.html fallback
                        if "text/html" not in content_type or sensitive_path == "/phpinfo.php":
                            exposed_files.append({
                                "path": sensitive_path,
                                "status_code": 200,
                                "content_type": content_type
                            })
                            vulnerabilities.append({
                                "name": f"Potentially Exposed Sensitive Path ({sensitive_path})",
                                "severity": "High",
                                "explanation": f"Safe probe returned HTTP 200 OK for '{sensitive_path}'.",
                                "impact": "Potential exposure of environment secrets, repository metadata, or configuration files.",
                                "remediation": f"Block public access to '{sensitive_path}' and hidden dotfiles in web server rules."
                            })
                except Exception:
                    pass

    except Exception as e:
        vulnerabilities.append({
            "name": "HTTP Security Probe Notice",
            "severity": "Info",
            "explanation": f"Passive HTTP probe encountered network limitation ({str(e)}).",
            "impact": "Some header and cookie checks could not be actively retrieved from current environment.",
            "remediation": "Ensure server is reachable and accepting inbound HTTP/S requests."
        })

    # Calculate overall security posture grade
    high_vulns = sum(1 for v in vulnerabilities if v["severity"] in ["Critical", "High"])
    med_vulns = sum(1 for v in vulnerabilities if v["severity"] == "Medium")
    low_vulns = sum(1 for v in vulnerabilities if v["severity"] == "Low")

    if high_vulns > 0:
        posture_grade = "D (Poor)"
    elif med_vulns >= 3:
        posture_grade = "C (Fair)"
    elif med_vulns > 0:
        posture_grade = "B (Good)"
    else:
        posture_grade = "A (Strong)"

    return {
        "url": target_url,
        "https_enforced": https_enforced,
        "headers_analyzed": headers_found,
        "missing_headers": missing_headers,
        "cookie_analysis": cookie_analysis,
        "server_disclosures": server_disclosures,
        "exposed_files": exposed_files,
        "vulnerabilities": vulnerabilities,
        "posture_grade": posture_grade,
        "stats": {
            "total_vulnerabilities": len(vulnerabilities),
            "high": high_vulns,
            "medium": med_vulns,
            "low": low_vulns
        }
    }

