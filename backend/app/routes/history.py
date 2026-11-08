from fastapi import APIRouter, Depends, Query
from typing import Optional
from ..utils.security import get_current_user_optional
from ..database import db_manager

router = APIRouter(prefix="/history", tags=["Scan History"])

@router.get("/scans")
def get_scan_history(
    limit: int = Query(50, ge=1, le=200),
    risk_level: Optional[str] = None,
    user: dict = Depends(get_current_user_optional)
):
    """
    Returns historical security scans with filtering options.
    """
    scans = db_manager.get_scans(limit=limit)
    if risk_level and risk_level != "All":
        scans = [s for s in scans if s.get("risk_category") == risk_level]
    return scans

