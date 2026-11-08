from fastapi import APIRouter
from ..schemas.scanner import ScanRequest
from ..services.threat_intelligence import check_threat_intelligence
from ..services.domain_analyzer import analyze_domain
from ..utils.validators import normalize_url, validate_public_target

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

@router.post("/lookup")
def lookup_threat_intelligence(request: ScanRequest):
    """
    Dedicated threat intelligence lookup:
    Queries known malicious feeds, DNS records, SPF/DMARC email security, and IP data.
    """
    norm = normalize_url(request.url)
    clean_url = norm["url"]
    hostname = norm["hostname"]

    validate_public_target(hostname)

    intel = check_threat_intelligence(clean_url)
    domain_info = analyze_domain(clean_url)

    return {
        "url": clean_url,
        "domain": hostname,
        "threat_intelligence": intel,
        "domain_analysis": domain_info
    }

