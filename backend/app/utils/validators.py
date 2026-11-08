import re
import socket
import ipaddress
from urllib.parse import urlparse
from fastapi import HTTPException

# Reserved / Private IP Networks (SSRF mitigation)
PRIVATE_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # RFC 1918 Private
    ipaddress.ip_network("172.16.0.0/12"),    # RFC 1918 Private
    ipaddress.ip_network("192.168.0.0/16"),   # RFC 1918 Private
    ipaddress.ip_network("169.254.0.0/16"),   # Link-Local / AWS/GCP/Azure Metadata
    ipaddress.ip_network("0.0.0.0/8"),        # Current network
    ipaddress.ip_network("100.64.0.0/10"),    # Carrier-grade NAT
    ipaddress.ip_network("198.18.0.0/15"),    # Benchmark testing
    ipaddress.ip_network("224.0.0.0/4"),      # Multicast
    ipaddress.ip_network("240.0.0.0/4"),      # Reserved
    ipaddress.ip_network("::1/128"),          # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),         # IPv6 Unique Local
    ipaddress.ip_network("fe80::/10"),        # IPv6 Link-Local
]

BLOCKED_HOSTNAMES = {
    "localhost", "127.0.0.1", "::1", "metadata.google.internal",
    "instance-data", "169.254.169.254", "0.0.0.0"
}

def normalize_url(raw_url: str) -> dict:
    """
    Cleans and parses a target URL, ensuring valid scheme and extracting host.
    """
    if not raw_url:
        raise HTTPException(status_code=400, detail="Target URL cannot be empty.")
    
    clean_url = raw_url.strip()
    # Add scheme if missing
    if not re.match(r'^[a-zA-Z]+://', clean_url):
        clean_url = "https://" + clean_url

    parsed = urlparse(clean_url)
    if not parsed.hostname:
        raise HTTPException(status_code=400, detail=f"Invalid URL structure: Unable to extract valid hostname from '{raw_url}'.")

    scheme = parsed.scheme.lower()
    if scheme not in ["http", "https"]:
        raise HTTPException(status_code=400, detail="Only HTTP and HTTPS protocols are supported for security scanning.")

    return {
        "url": clean_url,
        "scheme": scheme,
        "hostname": parsed.hostname.lower(),
        "port": parsed.port or (443 if scheme == "https" else 80),
        "path": parsed.path or "/",
        "query": parsed.query or ""
    }

def validate_public_target(hostname: str) -> str:
    """
    Validates that the target hostname does not resolve to an internal, private,
    or link-local address (Server-Side Request Forgery protection).
    Returns the resolved public IP.
    """
    clean_host = hostname.strip().lower()
    if clean_host in BLOCKED_HOSTNAMES:
        raise HTTPException(
            status_code=400,
            detail=f"Security Policy Violation (SSRF): Hostname '{clean_host}' resolves to restricted internal infrastructure."
        )

    # Check direct IP string
    try:
        ip_obj = ipaddress.ip_address(clean_host)
        for net in PRIVATE_NETWORKS:
            if ip_obj in net:
                raise HTTPException(
                    status_code=400,
                    detail=f"Security Policy Violation (SSRF): Target IP '{clean_host}' is in reserved/private address range {net}."
                )
        return str(ip_obj)
    except ValueError:
        pass # Hostname is a domain name, proceed to DNS resolution

    try:
        addr_info = socket.getaddrinfo(clean_host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        resolved_ips = [ai[4][0] for ai in addr_info]
    except socket.gaierror:
        # Domain cannot be resolved via DNS
        return ""

    for ip_str in resolved_ips:
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            for net in PRIVATE_NETWORKS:
                if ip_obj in net:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Security Policy Violation (SSRF): Hostname '{clean_host}' resolves to private IP '{ip_str}' in range {net}."
                    )
        except ValueError:
            continue

    return resolved_ips[0] if resolved_ips else ""

