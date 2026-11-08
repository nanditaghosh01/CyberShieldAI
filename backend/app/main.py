import os
import uuid
import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from .config import settings
from .database import db_manager
from .utils.security import hash_password

# Import routers
from .routes.auth import router as auth_router
from .routes.scanner import router as scanner_router
from .routes.ssl_inspector import router as ssl_router
from .routes.security_assessment import router as assessment_router
from .routes.threat_intelligence import router as threat_router
from .routes.community_reports import router as community_router
from .routes.history import router as history_router
from .routes.admin import router as admin_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Unified Cyber Threat Intelligence & AI Phishing Detection Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_initial_data():
    try:
        # 1. Admin user
        admin_email = "admin@cybershield.ai"
        if not db_manager.find_user_by_email(admin_email):
            db_manager.insert_user({
                "id": "admin-seed-id",
                "email": admin_email,
                "username": "SecurityLead",
                "hashed_password": hash_password("CyberShield@2026"),
                "role": "Administrator",
                "created_at": datetime.datetime.utcnow().isoformat()
            })
            print("[CyberShield AI] Default Administrator account seeded: admin@cybershield.ai / CyberShield@2026")

        # 2. Analyst user
        analyst_email = "analyst@cybershield.ai"
        if not db_manager.find_user_by_email(analyst_email):
            db_manager.insert_user({
                "id": "analyst-seed-id",
                "email": analyst_email,
                "username": "ThreatAnalyst",
                "hashed_password": hash_password("Analyst@2026"),
                "role": "Security Analyst",
                "created_at": datetime.datetime.utcnow().isoformat()
            })

        # 3. Sample community reports if empty
        reports = db_manager.get_community_reports(limit=5)
        if not reports:
            sample_reports = [
                {
                    "id": str(uuid.uuid4()),
                    "url": "http://paypa1-security-verification.com/webscr",
                    "threat_category": "Phishing",
                    "description": "Deceptive PayPal clone imitating login interface. Employs character substitution (digit 1 for letter l).",
                    "evidence": "Typosquatting domain; unencrypted HTTP form action pointing to external drop server.",
                    "status": "Verified Malicious",
                    "submitted_by": "CyberGuard99",
                    "submitted_at": datetime.datetime.utcnow().isoformat(),
                    "upvotes": 42,
                    "downvotes": 1,
                    "votes_data": {}
                },
                {
                    "id": str(uuid.uuid4()),
                    "url": "http://internship-offer-google.xyz/apply",
                    "threat_category": "Fake Recruitment",
                    "description": "Fraudulent student recruitment portal soliciting registration fees and national identity card copies.",
                    "evidence": "Brand impersonation on .xyz TLD; registration requests payment via crypto address.",
                    "status": "Verified Malicious",
                    "submitted_by": "UniversityInfoSec",
                    "submitted_at": datetime.datetime.utcnow().isoformat(),
                    "upvotes": 38,
                    "downvotes": 0,
                    "votes_data": {}
                },
                {
                    "id": str(uuid.uuid4()),
                    "url": "http://secure-chase-verify-banking.top/auth",
                    "threat_category": "Fake Payment",
                    "description": "Harvests banking credentials and OTP tokens through fake security checkpoint flow.",
                    "evidence": "Phishing kit targeting Chase bank customers; hosted on disposable .top domain.",
                    "status": "Under Review",
                    "submitted_by": "ThreatHunter",
                    "submitted_at": datetime.datetime.utcnow().isoformat(),
                    "upvotes": 19,
                    "downvotes": 2,
                    "votes_data": {}
                }
            ]
            for sr in sample_reports:
                db_manager.insert_community_report(sr)
    except Exception as e:
        print(f"[Seed Warning]: {e}")

@app.on_event("startup")
def startup_event():
    seed_initial_data()

# Register Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(scanner_router, prefix=settings.API_V1_STR)
app.include_router(ssl_router, prefix=settings.API_V1_STR)
app.include_router(assessment_router, prefix=settings.API_V1_STR)
app.include_router(threat_router, prefix=settings.API_V1_STR)
app.include_router(community_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_manager.get_status()
    }

# Check frontend distribution directory
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
frontend_assets = os.path.join(frontend_dist, "assets")

if os.path.exists(frontend_assets):
    app.mount("/assets", StaticFiles(directory=frontend_assets), name="assets")

@app.get("/")
def serve_root():
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "message": "Welcome to CyberShield AI - Intelligent Phishing Detection and Web Security Intelligence API",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

@app.get("/{full_path:path}")
def serve_fallback_spa(full_path: str):
    # Guard against intercepting API, docs, or schema routes
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
        return JSONResponse(status_code=404, content={"detail": f"Route '{full_path}' not found"})
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return JSONResponse(status_code=404, content={"detail": "Frontend assets not found"})
