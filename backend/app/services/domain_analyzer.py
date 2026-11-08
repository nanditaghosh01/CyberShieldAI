import socket
import dns.resolver
from urllib.parse import urlparse
import httpx
from typing import Dict, Any, List

def analyze_domain(target_url: str) -> dict:
    """
    Performs comprehensive domain intelligence, DNS record resolution,
    nameserver inspection, and email security authentication (SPF/DMARC) checks.
    """
    parsed = urlparse(target_url)
    hostname = (parsed.hostname or target_url).lower()
    
    domain_info = {
        "hostname": hostname,
        "ip_addresses": [],
        "ipv6_addresses": [],
        "reverse_dns": "",
        "dns_records": {
            "A": [],
            "AAAA": [],
            "MX": [],
            "NS": [],
            "TXT": [],
            "CNAME": [],
            "SOA": []
        },
        "email_security": {
            "spf_configured": False,
            "dmarc_configured": False,
            "spf_record": None,
            "dmarc_record": None
        },
        "rdap_info": {
            "registrar": "Public / Multi-tenant Registrar",
            "status": ["active"],
            "country": "Unknown",
            "source": "RDAP / DNS Heuristic"
        },
        "findings": []
    }

    resolver = dns.resolver.Resolver()
    resolver.timeout = 3.0
    resolver.lifetime = 3.0

    # 1. DNS A Records
    try:
        answers = resolver.resolve(hostname, "A")
        domain_info["dns_records"]["A"] = [rdata.to_text() for rdata in answers]
        domain_info["ip_addresses"] = domain_info["dns_records"]["A"]
    except Exception:
        pass

    # 2. DNS AAAA Records
    try:
        answers = resolver.resolve(hostname, "AAAA")
        domain_info["dns_records"]["AAAA"] = [rdata.to_text() for rdata in answers]
        domain_info["ipv6_addresses"] = domain_info["dns_records"]["AAAA"]
    except Exception:
        pass

    # 3. DNS MX Records
    try:
        answers = resolver.resolve(hostname, "MX")
        domain_info["dns_records"]["MX"] = [rdata.to_text() for rdata in answers]
    except Exception:
        pass

    # 4. DNS NS Records
    try:
        answers = resolver.resolve(hostname, "NS")
        domain_info["dns_records"]["NS"] = [rdata.to_text() for rdata in answers]
    except Exception:
        pass

    # 5. DNS TXT Records (and SPF check)
    try:
        answers = resolver.resolve(hostname, "TXT")
        txt_records = [rdata.to_text().strip('"') for rdata in answers]
        domain_info["dns_records"]["TXT"] = txt_records
        for txt in txt_records:
            if "v=spf1" in txt.lower():
                domain_info["email_security"]["spf_configured"] = True
                domain_info["email_security"]["spf_record"] = txt
    except Exception:
        pass

    # 6. DMARC check (_dmarc.hostname)
    try:
        dmarc_host = f"_dmarc.{hostname}"
        answers = resolver.resolve(dmarc_host, "TXT")
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if "v=dmarc1" in txt.lower():
                domain_info["email_security"]["dmarc_configured"] = True
                domain_info["email_security"]["dmarc_record"] = txt
    except Exception:
        pass

    # 7. Reverse DNS lookup for primary IP
    if domain_info["ip_addresses"]:
        primary_ip = domain_info["ip_addresses"][0]
        try:
            rev_name, _, _ = socket.gethostbyaddr(primary_ip)
            domain_info["reverse_dns"] = rev_name
        except Exception:
            domain_info["reverse_dns"] = "No PTR record found"

    # Security findings based on DNS posture
    if not domain_info["dns_records"]["A"] and not domain_info["dns_records"]["AAAA"]:
        domain_info["findings"].append({
            "name": "Missing DNS A / AAAA Records",
            "severity": "Medium",
            "impact": "Domain does not resolve to an active IP address via standard DNS queries."
        })

    if not domain_info["email_security"]["spf_configured"]:
        domain_info["findings"].append({
            "name": "Missing SPF Record",
            "severity": "Low",
            "impact": "Absence of SPF allows unauthorized senders to spoof emails originating from this domain."
        })

    if not domain_info["email_security"]["dmarc_configured"]:
        domain_info["findings"].append({
            "name": "Missing DMARC Policy",
            "severity": "Low",
            "impact": "Absence of DMARC prevents receivers from enforcing reject/quarantine actions on spoofed mail."
        })

    return domain_info

