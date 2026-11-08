from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class ScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048, description="Target website URL to scan")

class CommunityReportCreate(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)
    threat_category: str = Field(..., description="Phishing, Fake Payment, Fake Recruitment, Malware, Impersonation, Scam")
    description: str = Field(..., min_length=10, max_length=2000)
    evidence: Optional[str] = ""

class VoteRequest(BaseModel):
    vote_type: str = Field(..., pattern="^(up|down)$")

