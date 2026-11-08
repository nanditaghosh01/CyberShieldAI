from fastapi import APIRouter
from urllib.parse import urlparse
from ..schemas.scanner import ScanRequest
from ..services.ssl_inspector import inspect_ssl_certificate
from ..utils.validators import normalize_url, validate_public_target

router = APIRouter(prefix="/ssl", tags=["SSL/TLS Inspector"])

@router.post("/inspect")
def inspect_ssl(request: ScanRequest):
    """
    Dedicated SSL/TLS certificate inspection endpoint:
    Checks validity, SANs, CA trust chain, key size, cipher suite, CT logs, and vulnerabilities.
    """
    norm = normalize_url(request.url)
    hostname = norm["hostname"]
    port = norm["port"]

    validate_public_target(hostname)
    return inspect_ssl_certificate(hostname, port)

