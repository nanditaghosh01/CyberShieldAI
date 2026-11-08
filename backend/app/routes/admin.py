from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from ..utils.security import require_role
from ..database import db_manager

router = APIRouter(prefix="/admin", tags=["Administrator & Moderation"])

class StatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Pending|Under Review|Verified Malicious|False Positive|Rejected)$")

@router.get("/system-status")
def get_system_status(admin: dict = Depends(require_role("Security Analyst"))):
    """
    Returns internal architecture health, database engine, and threat counts.
    Requires Security Analyst or Administrator role.
    """
    db_status = db_manager.get_status()
    dash_stats = db_manager.get_dashboard_stats()
    reports = db_manager.get_community_reports(limit=500)
    pending_reports = sum(1 for r in reports if r.get("status") == "Pending")

    return {
        "database": db_status,
        "scans": dash_stats,
        "pending_moderation_count": pending_reports,
        "active_admin": admin.get("username")
    }

@router.patch("/reports/{report_id}/status")
def update_report_status(
    report_id: str,
    update: StatusUpdate,
    admin: dict = Depends(require_role("Security Analyst"))
):
    """
    Moderation endpoint: updates threat report status (e.g., Verified Malicious, False Positive).
    """
    success = db_manager.update_community_report_status(report_id, update.status)
    if not success:
        raise HTTPException(status_code=404, detail="Community report not found.")
    return {"message": f"Report status successfully updated to '{update.status}'.", "report_id": report_id}

