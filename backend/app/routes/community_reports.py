import uuid
import datetime
from fastapi import APIRouter, HTTPException, Depends, Request
from ..schemas.scanner import CommunityReportCreate, VoteRequest
from ..utils.security import get_current_user_optional
from ..database import db_manager

router = APIRouter(prefix="/community", tags=["Community Threat Intelligence"])

@router.get("/reports")
def list_reports(status: str = None, limit: int = 50):
    """
    Retrieves community-submitted threat reports.
    """
    return db_manager.get_community_reports(limit=limit, status=status)

@router.post("/reports")
def submit_report(report_in: CommunityReportCreate, user: dict = Depends(get_current_user_optional)):
    """
    Submits a new threat report for community validation.
    """
    report_id = str(uuid.uuid4())
    submitted_at = datetime.datetime.utcnow().isoformat()
    submitted_by = user.get("username", "Anonymous Contributor")

    report_record = {
        "id": report_id,
        "url": report_in.url.strip(),
        "threat_category": report_in.threat_category,
        "description": report_in.description.strip(),
        "evidence": report_in.evidence.strip() if report_in.evidence else "",
        "status": "Pending",
        "submitted_by": submitted_by,
        "submitted_at": submitted_at,
        "upvotes": 0,
        "downvotes": 0,
        "votes_data": {}
    }

    db_manager.insert_community_report(report_record)
    return report_record

@router.post("/reports/{report_id}/vote")
def vote_report(report_id: str, vote: VoteRequest, request: Request):
    """
    Submits an upvote or downvote for community verification.
    """
    report = db_manager.get_community_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Community report not found.")

    client_ip = request.client.host if request.client else "unknown_voter"
    updated = db_manager.vote_community_report(report_id, vote.vote_type, client_ip)
    return updated

@router.get("/reports/{report_id}")
def get_report(report_id: str):
    report = db_manager.get_community_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Community report not found.")
    return report

