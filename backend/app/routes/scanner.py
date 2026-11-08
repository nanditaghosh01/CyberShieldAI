import os
import json
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import PlainTextResponse
from ..schemas.scanner import ScanRequest
from ..services.url_analyzer import perform_full_security_scan
from ..services.report_generator import generate_text_security_report
from ..utils.security import get_current_user_optional
from ..database import db_manager

router = APIRouter(prefix="/scanner", tags=["Scanner"])

@router.post("/scan")
def scan_url(request: ScanRequest, user: dict = Depends(get_current_user_optional)):
    """
    Initiates full multi-engine security scan: AI phishing detection,
    SSL/TLS inspection, web security posture, and domain reputation.
    """
    user_id = user.get("id", "anonymous")
    result = perform_full_security_scan(request.url, user_id=user_id)
    return result

@router.get("/stats")
def get_stats():
    """
    Returns aggregated dashboard metrics and threat distributions.
    """
    return db_manager.get_dashboard_stats()

@router.get("/scan/{scan_id}")
def get_scan(scan_id: str):
    scan = db_manager.get_scan_by_id(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan result not found.")
    return scan

@router.get("/scan/{scan_id}/report")
def get_scan_report(scan_id: str):
    scan = db_manager.get_scan_by_id(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan result not found.")
    report_text = generate_text_security_report(scan)
    return PlainTextResponse(report_text, media_type="text/plain")

@router.get("/model-metrics")
def get_model_metrics():
    """
    Returns scikit-learn model evaluation benchmarks (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix).
    """
    metrics_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Model evaluation metrics file not found.")

