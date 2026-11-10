import re
import math
from urllib.parse import urlparse
import ipaddress

FEATURE_COLUMNS = [
    "url_length",
    "has_ip_address",
    "dot_count",
    "https_flag",
    "url_entropy",
    "token_count",
    "subdomain_count",
    "query_param_count",
    "tld_length",
    "path_length",
    "has_hyphen_in_domain",
    "number_of_digits",
    "tld_popularity",
    "suspicious_file_extension",
    "domain_name_length",
    "percentage_numeric_chars"
]

POPULAR_TLDS = {"com", "org", "net", "edu", "gov", "io", "co", "uk", "in", "de", "ca", "au", "jp", "fr"}

SUSPICIOUS_EXTENSIONS = {
    ".exe", ".bin", ".scr", ".sh", ".au3", ".m", ".apk", ".zip", ".msi", ".dll",
    ".bat", ".ps1", ".vbs", ".jar", ".iso", ".dmg", ".vmp.exe"
}

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "security", "account", "update", "banking",
    "signin", "sign-in", "wallet", "confirm", "confirmation", "password",
    "support", "payment", "billing", "kyc", "authenticate", "auth",
    "recover", "recovery", "suspend", "suspension", "bonus", "reward", "free",
    "credential", "identity", "appleid", "paypal", "netflix", "chase", "wellsfargo"
]

TARGET_BRANDS = [
    "paypal", "google", "apple", "microsoft", "amazon", "netflix", "facebook",
    "instagram", "twitter", "chase", "bankofamerica", "wellsfargo", "binance",
    "coinbase", "steam", "linkedin", "ebay", "dropbox", "adobe", "roblox",
    "telegram", "whatsapp", "citibank", "capitalone", "yahoo", "github"
]

HOMOGLYPH_MAP = {
    '1': 'l', '0': 'o', '5': 's', '3': 'e', '4': 'a', '@': 'a', '$': 's', '8': 'b'
}

def normalize_homoglyphs(text: str) -> str:
    result = text.lower()
    for leet, norm in HOMOGLYPH_MAP.items():
        result = result.replace(leet, norm)
    return result

def shannon_entropy(data: str) -> float:
    if not data:
        return 0.0
    length = len(data)
    frequencies = {}
    for char in data:
        frequencies[char] = frequencies.get(char, 0) + 1
    entropy = sum(- (count / length) * math.log2(count / length) for count in frequencies.values())
    return round(entropy, 9)

def levenshtein_ratio(s1: str, s2: str) -> float:
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
                matrix[i-1][j] + 1,
                matrix[i][j-1] + 1,
                matrix[i-1][j-1] + cost
            )
            
    dist = matrix[len1][len2]
    max_len = max(len1, len2)
    return round(1.0 - (dist / max_len), 4)

def check_ip_address(host: str) -> int:
    clean_host = host.split(':')[0].strip("[]")
    try:
        ipaddress.ip_address(clean_host)
        return 1
    except ValueError:
        pass
    if re.match(r"^0x[0-9a-fA-F]+(\.0x[0-9a-fA-F]+){3}$", clean_host):
        return 1
    if re.match(r"^\d{8,11}$", clean_host):
        return 1
    return 0

def extract_url_features(url: str) -> dict:
    url_clean = url.strip()
    if not re.match(r'^[a-zA-Z]+://', url_clean):
        url_full = 'http://' + url_clean
    else:
        url_full = url_clean

    parsed = urlparse(url_full)
    netloc = parsed.netloc.split('@')[-1]
    raw_host = (parsed.hostname or "").lower()
    host_no_port = netloc.split(':')[0].lower()
    path = parsed.path or "/"
    query = parsed.query or ""

    # 1. URL length
    url_length = len(url_full)

    # 2. IP address
    has_ip = check_ip_address(host_no_port)

    # 3. Dot count
    dot_count = url_full.count('.')

    # 4. HTTPS flag
    https_flag = 1 if url_full.startswith("https://") else 0

    # 5. Shannon Entropy
    url_entropy = shannon_entropy(url_full)

    # 6. Token count
    tokens = [t for t in re.split(r'[:/._\-?=&]', url_full) if t]
    token_count = max(len(tokens), 1)

    # Netloc parts for domain / TLD / subdomains
    netloc_parts = netloc.split('.')
    if has_ip:
        subdomain_count = max(0, len(netloc_parts) - 2)
        domain_name = netloc_parts[-2] if len(netloc_parts) >= 2 else netloc_parts[0]
        tld = netloc_parts[-1] if len(netloc_parts) >= 2 else ""
    else:
        host_parts = host_no_port.split('.')
        tld = host_parts[-1] if len(host_parts) >= 2 else ""
        domain_name = host_parts[-2] if len(host_parts) >= 2 else host_parts[0]
        subdomain_count = len(host_parts) - 2 if len(host_parts) > 2 else 0

    # 8. Query param count
    if query:
        query_param_count = len([q for q in re.split(r'&|&amp;', query) if q])
    else:
        query_param_count = 1

    # 9. TLD length
    tld_length = len(tld)

    # 10. Path length
    path_length = len(path)

    # 11. Has hyphen in domain
    has_hyphen = 1 if '-' in host_no_port else 0

    # 12. Number of digits
    number_of_digits = sum(c.isdigit() for c in url_full)

    # 13. TLD popularity
    clean_tld = tld.split(':')[0].lower()
    tld_popularity = 1 if clean_tld in POPULAR_TLDS else 0

    # 14. Suspicious file extension
    path_lower = path.lower()
    suspicious_ext = 1 if any(path_lower.endswith(ext) for ext in SUSPICIOUS_EXTENSIONS) else 0

    # 15. Domain name length
    domain_name_length = len(domain_name)

    # 16. Percentage numeric chars
    percentage_numeric_chars = round((number_of_digits / url_length) * 100, 8) if url_length > 0 else 0.0

    # Auxiliary metadata for UI explainability & risk scoring
    url_lower = url_full.lower()
    keyword_matches = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
    
    # Typosquatting / brand similarity
    max_similarity = 0.0
    matched_target = None
    domain_tokens = [t for t in re.split(r'[-_]', domain_name) if t] + [domain_name]

    for target in TARGET_BRANDS:
        if target in host_no_port and host_no_port not in [f"{target}.com", f"www.{target}.com"]:
            sim = 0.95
            if sim > max_similarity:
                max_similarity = sim
                matched_target = target
            continue

        for token in domain_tokens:
            sim_raw = levenshtein_ratio(token, target)
            norm_token = normalize_homoglyphs(token)
            sim_norm = levenshtein_ratio(norm_token, target)
            best_token_sim = max(sim_raw, sim_norm)

            if best_token_sim > max_similarity:
                max_similarity = best_token_sim
                matched_target = target

    if max_similarity >= 0.70 and host_no_port in [f"{matched_target}.com", f"www.{matched_target}.com"]:
        max_similarity = 0.0
        matched_target = None

    return {
        "url_length": url_length,
        "has_ip_address": has_ip,
        "dot_count": dot_count,
        "https_flag": https_flag,
        "url_entropy": url_entropy,
        "token_count": token_count,
        "subdomain_count": subdomain_count,
        "query_param_count": query_param_count,
        "tld_length": tld_length,
        "path_length": path_length,
        "has_hyphen_in_domain": has_hyphen,
        "number_of_digits": number_of_digits,
        "tld_popularity": tld_popularity,
        "suspicious_file_extension": suspicious_ext,
        "domain_name_length": domain_name_length,
        "percentage_numeric_chars": percentage_numeric_chars,
        # Metadata
        "_hostname": host_no_port,
        "_matched_target": matched_target,
        "_matched_keywords": keyword_matches,
        "_typosquat_similarity": max_similarity
    }
