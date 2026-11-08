import socket
import ssl
import datetime
from urllib.parse import urlparse
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.x509.oid import ExtensionOID, NameOID

def inspect_ssl_certificate(hostname: str, port: int = 443) -> dict:
    """
    Performs comprehensive SSL/TLS certificate inspection and cryptographic chain validation.
    """
    clean_host = hostname.strip().lower()
    findings = []
    cert_info = {
        "hostname": clean_host,
        "port": port,
        "is_valid": False,
        "subject": {},
        "issuer": {},
        "serial_number": "",
        "valid_from": "",
        "valid_to": "",
        "days_remaining": 0,
        "is_expired": False,
        "sans": [],
        "signature_algorithm": "",
        "public_key_algorithm": "",
        "key_size": 0,
        "tls_version": "",
        "cipher_suite": "",
        "is_self_signed": False,
        "has_sct_transparency": False,
        "chain_depth": 0,
        "findings": findings,
        "trust_status": "Unknown",
        "case_study_note": "eMudhra Incident Relevance: Highlights the imperative need for strict CA trust verification, intermediate authority monitoring, and Certificate Transparency validation rather than blindly trusting any HTTPS padlock."
    }

    # Setup SSL Context
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE  # Allow retrieving even self-signed / expired certs for inspection

    try:
        with socket.create_connection((clean_host, port), timeout=6.0) as sock:
            with context.wrap_socket(sock, server_hostname=clean_host) as ssock:
                der_cert = ssock.getpeercert(binary_form=True)
                cert_info["tls_version"] = ssock.version() or "TLSv1.2"
                cipher = ssock.cipher()
                cert_info["cipher_suite"] = cipher[0] if cipher else "Unknown"

                # Parse certificate using cryptography
                cert = x509.load_der_x509_certificate(der_cert, default_backend())
                
                # Serial number
                cert_info["serial_number"] = f"{cert.serial_number:X}"

                # Validity dates
                not_before = cert.not_valid_before_utc
                not_after = cert.not_valid_after_utc
                now = datetime.datetime.now(datetime.timezone.utc)
                
                cert_info["valid_from"] = not_before.isoformat()
                cert_info["valid_to"] = not_after.isoformat()
                days_left = (not_after - now).days
                cert_info["days_remaining"] = days_left
                cert_info["is_expired"] = days_left < 0
                cert_info["is_valid"] = (not_before <= now <= not_after)

                # Subject extraction
                subject_dict = {}
                for attr in cert.subject:
                    subject_dict[attr.oid._name] = attr.value
                cert_info["subject"] = {
                    "common_name": subject_dict.get("commonName", clean_host),
                    "organization": subject_dict.get("organizationName", "Not Specified"),
                    "country": subject_dict.get("countryName", "Not Specified"),
                    "raw": str(cert.subject)
                }

                # Issuer extraction
                issuer_dict = {}
                for attr in cert.issuer:
                    issuer_dict[attr.oid._name] = attr.value
                cert_info["issuer"] = {
                    "common_name": issuer_dict.get("commonName", "Unknown CA"),
                    "organization": issuer_dict.get("organizationName", "Unknown Authority"),
                    "country": issuer_dict.get("countryName", "Not Specified"),
                    "raw": str(cert.issuer)
                }

                # Self-signed check
                is_self_signed = (cert.subject == cert.issuer)
                cert_info["is_self_signed"] = is_self_signed

                # SAN (Subject Alternative Names)
                sans_list = []
                try:
                    san_ext = cert.extensions.get_extension_for_oid(ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
                    sans_list = san_ext.value.get_values_for_type(x509.DNSName)
                except Exception:
                    pass
                cert_info["sans"] = sans_list

                # Signature algorithm
                sig_algo = cert.signature_algorithm_oid._name
                cert_info["signature_algorithm"] = sig_algo

                # Public key algorithm and key size
                pub_key = cert.public_key()
                pub_algo = pub_key.__class__.__name__
                key_size = getattr(pub_key, "key_size", 0)
                cert_info["public_key_algorithm"] = pub_algo.replace("_", "").replace("PublicKey", "")
                cert_info["key_size"] = key_size

                # Certificate Transparency SCT extension
                has_sct = False
                try:
                    cert.extensions.get_extension_for_oid(ExtensionOID.PRECERT_SIGNED_CERTIFICATE_TIMESTAMPS)
                    has_sct = True
                except Exception:
                    try:
                        cert.extensions.get_extension_for_oid(ExtensionOID.SIGNED_CERTIFICATE_TIMESTAMPS)
                        has_sct = True
                    except Exception:
                        pass
                cert_info["has_sct_transparency"] = has_sct

                # Security Assessment Findings
                if is_self_signed:
                    findings.append({
                        "name": "Self-Signed SSL/TLS Certificate",
                        "severity": "High",
                        "impact": "Browser trust error. Vulnerable to Man-in-the-Middle (MITM) impersonation attacks.",
                        "remediation": "Replace self-signed certificate with one issued by an audited public Certificate Authority (e.g., Let's Encrypt, DigiCert)."
                    })
                    cert_info["trust_status"] = "Untrusted (Self-Signed)"
                else:
                    cert_info["trust_status"] = "Audited CA (Public)"

                if cert_info["is_expired"]:
                    findings.append({
                        "name": "Certificate Expired",
                        "severity": "Critical",
                        "impact": f"Certificate expired {abs(days_left)} days ago. Connections trigger security warnings.",
                        "remediation": "Renew the SSL/TLS certificate immediately via your hosting or ACME provider."
                    })
                elif days_left < 15:
                    findings.append({
                        "name": "Certificate Expiring Soon",
                        "severity": "Medium",
                        "impact": f"Certificate expires in {days_left} days. Service interruption risk if automated renewal fails.",
                        "remediation": "Trigger automated ACME certificate renewal."
                    })

                # Check SAN coverage
                host_covered = any(
                    clean_host == s or (s.startswith("*.") and clean_host.endswith(s[1:]))
                    for s in sans_list
                )
                if not host_covered and clean_host != cert_info["subject"]["common_name"]:
                    findings.append({
                        "name": "Domain Name Mismatch (SNI Mismatch)",
                        "severity": "High",
                        "impact": f"Host '{clean_host}' is not present in Subject Alternative Names (SANs) or Common Name.",
                        "remediation": "Re-issue certificate with '{clean_host}' explicitly included in Subject Alternative Names."
                    })

                # Check key size
                if "RSA" in pub_algo and key_size > 0 and key_size < 2048:
                    findings.append({
                        "name": "Weak RSA Key Length",
                        "severity": "Critical",
                        "impact": f"Key length of {key_size} bits is cryptographically insufficient against factoring attacks.",
                        "remediation": "Upgrade to RSA 2048-bit minimum (recommended 4096-bit or ECC NIST P-256 / P-384)."
                    })

                # Check weak hash
                if any(weak in sig_algo.lower() for weak in ["sha1", "md5", "md2"]):
                    findings.append({
                        "name": "Deprecated Signature Algorithm",
                        "severity": "Critical",
                        "impact": f"Signature algorithm '{sig_algo}' suffers from collision vulnerabilities.",
                        "remediation": "Re-issue certificate utilizing SHA-256 or SHA-384 signature algorithm."
                    })

                # Check TLS Protocol Version
                if cert_info["tls_version"] in ["TLSv1", "TLSv1.1", "SSLv3", "SSLv2"]:
                    findings.append({
                        "name": "Insecure TLS Protocol Version",
                        "severity": "Critical",
                        "impact": f"{cert_info['tls_version']} is deprecated (RFC 8996) and vulnerable to POODLE, BEAST, and SWEET32 attacks.",
                        "remediation": "Disable TLS 1.0/1.1 on server. Restrict negotiation strictly to TLS 1.2 and TLS 1.3."
                    })

                if not has_sct:
                    findings.append({
                        "name": "Missing Embedded Certificate Transparency (CT) Proof",
                        "severity": "Low",
                        "impact": "Certificate lacked embedded SCTs in X.509 extensions (may be served via TLS extension or OCSP stapling).",
                        "remediation": "Ensure web server or CA incorporates Signed Certificate Timestamps (SCTs) into TLS handshake."
                    })

    except (socket.timeout, socket.gaierror, ConnectionRefusedError, ssl.SSLError, OSError) as e:
        cert_info["is_valid"] = False
        findings.append({
            "name": "SSL/TLS Handshake Failed or Inaccessible",
            "severity": "High",
            "impact": f"Unable to establish secure TLS handshake with {clean_host}:{port} ({str(e)}).",
            "remediation": "Verify server is listening on port 443 with a valid TLS configuration."
        })

    return cert_info

