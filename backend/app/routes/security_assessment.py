from fastapi import APIRouter
from ..schemas.scanner import ScanRequest
from ..services.website_security import assess_website_security
from ..utils.validators import normalize_url, validate_public_target

router = APIRouter(prefix="/assessment", tags=["Security Assessment"])

@router.post("/audit")
def audit_website_security(request: ScanRequest):
    """
    Dedicated passive website security assessment:
    Checks CSP, HSTS, X-Frame-Options, cookies, server disclosures, and sensitive paths.
    """
    norm = normalize_url(request.url)
    clean_url = norm["url"]
    hostname = norm["hostname"]

    validate_public_target(hostname)
    return assess_website_security(clean_url)

