import re
import math
import unicodedata
from urllib.parse import urlparse
import ipaddress

# Known URL Shorteners
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly", "goo.gl",
    "rebrand.ly", "tiny.cc", "cutt.ly", "shorte.st", "bl.ink", "trib.al",
    "lnkd.in", "qr.ae", "adf.ly", "rb.gy", "shorturl.at"
}

# Suspicious TLDs frequently abused in phishing campaigns
SUSPICIOUS_TLDS = {
    "xyz", "top", "work", "club", "buzz", "fit", "gq", "cf", "ml", "ga", "tk",
    "icu", "loan", "click", "rest", "support", "country", "stream", "live", "link"
}

# Suspicious keywords in URL structure
SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "security", "account", "update", "banking",
    "signin", "sign-in", "wallet", "confirm", "confirmation", "password",
    "support", "payment", "billing", "kyc", "authenticate", "auth",
    "recover", "recovery", "suspend", "suspension", "bonus", "reward", "free",
    "credential", "identity", "appleid", "paypal", "netflix", "chase", "wellsfargo"
]

# High-profile targets for typosquatting / impersonation checks
TARGET_BRANDS = [
    "paypal", "google", "apple", "microsoft", "amazon", "netflix", "facebook",
    "instagram", "twitter", "chase", "bankofamerica", "wellsfargo", "binance",
    "coinbase", "steam", "linkedin", "ebay", "dropbox", "adobe", "roblox",
    "telegram", "whatsapp", "citibank", "capitalone", "yahoo", "github"
]

# Common leetspeak / homoglyph character substitutions
HOMOGLYPH_MAP = {
    '1': 'l', '0': 'o', '5': 's', '3': 'e', '4': 'a', '@': 'a', '$': 's', '8': 'b', 'vv': 'w'
}

def normalize_homoglyphs(text: str) -> str:
    """Normalizes typical digit/symbol leet substitutions."""
    result = text.lower()
    for leet, norm in HOMOGLYPH_MAP.items():
        result = result.replace(leet, norm)
    return result

def shannon_entropy(data: str) -> float:
    """Calculates the Shannon entropy of a string."""
    if not data:
        return 0.0
    entropy = 0.0
    length = len(data)
    frequencies = {}
    for char in data:
        frequencies[char] = frequencies.get(char, 0) + 1
    for count in frequencies.values():
        p_x = count / length
        entropy += - p_x * math.log2(p_x)
    return round(entropy, 4)

def levenshtein_ratio(s1: str, s2: str) -> float:
    """Computes normalized similarity ratio between two strings using Levenshtein distance."""
    s1, s2 = s1.lower(), s2.lower()
    if s1 == s2:
        return 1.0
    len1, len2 = len(s1), len(s2)
    if len1 == 0 or len2 == 0:
        return 0.0
    
    matrix = [[0] * (len2 + 1) for _ in range(len1 + 1)]
    for i in range(len1 + 1):
        matrix[i][0] = i
    for j in range(len2 + 1):
        matrix[0][j] = j
        
    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            cost = 0 if s1[i-1] == s2[j-1] else 1
            matrix[i][j] = min(
                matrix[i-1][j] + 1,       # deletion
                matrix[i][j-1] + 1,       # insertion
                matrix[i-1][j-1] + cost   # substitution
            )
            
    dist = matrix[len1][len2]
    max_len = max(len1, len2)
    return round(1.0 - (dist / max_len), 4)

def check_ip_address(hostname: str) -> int:
    """Detects if hostname is a plain IPv4, IPv6, or obfuscated IP format."""
    clean_host = hostname.strip("[]")
    try:
        ipaddress.ip_address(clean_host)
        return 1
    except ValueError:
        pass
    
    # Check for hex/octal encoded IP
    if re.match(r"^0x[0-9a-fA-F]+(\.0x[0-9a-fA-F]+){3}$", clean_host):
        return 1
    if re.match(r"^\d{8,11}$", clean_host):
        return 1
    return 0

def extract_url_features(url: str) -> dict:
    """
    Extracts comprehensive engineered security features from a URL for ML classification.
    """
    url_clean = url.strip()
    if not re.match(r'^[a-zA-Z]+://', url_clean):
        url_full = 'http://' + url_clean
    else:
        url_full = url_clean

    try:
        parsed = urlparse(url_full)
    except Exception:
        parsed = urlparse('http://' + url_clean)

    hostname = (parsed.hostname or "").lower()
    path = parsed.path or ""
    query = parsed.query or ""
    scheme = (parsed.scheme or "").lower()

    # Domain & TLD extraction
    domain_parts = hostname.split('.')
    tld = domain_parts[-1] if len(domain_parts) > 1 else ""
    subdomains = domain_parts[:-2] if len(domain_parts) > 2 else []

    # 1. Length metrics
    url_len = len(url_full)
    host_len = len(hostname)
    path_len = len(path)

    # 2. Character counts
    dots = url_full.count('.')
    hyphens = url_full.count('-')
    ats = url_full.count('@')
    questions = url_full.count('?')
    equals = url_full.count('=')
    percents = url_full.count('%')
    slashes = url_full.count('/')
    digits = sum(c.isdigit() for c in url_full)
    digit_ratio = round(digits / url_len, 4) if url_len > 0 else 0.0

    # 3. Subdomain count
    subdomain_count = len(subdomains)

    # 4. Host checks
    has_ip = check_ip_address(hostname)
    is_short = 1 if hostname in URL_SHORTENERS else 0
    has_puny = 1 if "xn--" in hostname or any(ord(c) > 127 for c in hostname) else 0

    # 5. Suspicious keywords in whole URL
    url_lower = url_full.lower()
    keyword_matches = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
    suspicious_keyword_count = len(keyword_matches)

    # 6. HTTPS indicator
    is_https = 1 if scheme == "https" else 0

    # 7. Suspicious TLD
    is_suspicious_tld = 1 if tld in SUSPICIOUS_TLDS else 0

    # 8. Typosquatting / Impersonation similarity check
    max_similarity = 0.0
    matched_target = None
    main_domain = domain_parts[-2] if len(domain_parts) >= 2 else hostname
    
    # Split domain into tokens (e.g. "paypa1-security-verification" -> ["paypa1", "security", "verification"])
    domain_tokens = [t for t in re.split(r'[-_]', main_domain) if t] + [main_domain]

    for target in TARGET_BRANDS:
        # Check direct brand substring
        if target in hostname and hostname not in [f"{target}.com", f"www.{target}.com"]:
            sim = 0.95
            if sim > max_similarity:
                max_similarity = sim
                matched_target = target
            continue

        # Check tokens against target
        for token in domain_tokens:
            sim_raw = levenshtein_ratio(token, target)
            norm_token = normalize_homoglyphs(token)
            sim_norm = levenshtein_ratio(norm_token, target)
            best_token_sim = max(sim_raw, sim_norm)

            if best_token_sim > max_similarity:
                max_similarity = best_token_sim
                matched_target = target

    # Only flag as typosquat if not the exact legitimate brand domain
    if max_similarity >= 0.70:
        if hostname in [f"{matched_target}.com", f"www.{matched_target}.com"]:
            max_similarity = 0.0
            matched_target = None

    # 9. Shannon Entropy
    entropy = shannon_entropy(url_full)

    # 10. Path depth and double slashes
    path_segments = [s for s in path.split('/') if s]
    path_depth = len(path_segments)
    has_double_slash_redirect = 1 if '//' in path else 0

    # 11. Sensitive extension
    sensitive_exts = {".exe", ".scr", ".zip", ".iso", ".apk", ".bin", ".msi", ".dmg", ".ps1", ".bat"}
    has_sensitive_ext = 1 if any(path.lower().endswith(ext) for ext in sensitive_exts) else 0

    return {
        "url_length": url_len,
        "domain_length": host_len,
        "path_length": path_len,
        "count_dots": dots,
        "count_hyphens": hyphens,
        "count_at": ats,
        "count_question": questions,
        "count_equal": equals,
        "count_percent": percents,
        "count_slash": slashes,
        "count_digits": digits,
        "digit_ratio": digit_ratio,
        "count_subdomains": subdomain_count,
        "has_ip": has_ip,
        "is_shortened": is_short,
        "has_punycode": has_puny,
        "suspicious_keyword_count": suspicious_keyword_count,
        "is_https": is_https,
        "suspicious_tld": is_suspicious_tld,
        "typosquat_similarity": max_similarity,
        "entropy": entropy,
        "path_depth": path_depth,
        "has_double_slash_redirect": has_double_slash_redirect,
        "has_sensitive_extension": has_sensitive_ext,
        # Metadata helpers for explanation
        "_hostname": hostname,
        "_matched_target": matched_target,
        "_matched_keywords": keyword_matches
    }

FEATURE_COLUMNS = [
    "url_length",
    "domain_length",
    "path_length",
    "count_dots",
    "count_hyphens",
    "count_at",
    "count_question",
    "count_equal",
    "count_percent",
    "count_slash",
    "count_digits",
    "digit_ratio",
    "count_subdomains",
    "has_ip",
    "is_shortened",
    "has_punycode",
    "suspicious_keyword_count",
    "is_https",
    "suspicious_tld",
    "typosquat_similarity",
    "entropy",
    "path_depth",
    "has_double_slash_redirect",
    "has_sensitive_extension"
]
