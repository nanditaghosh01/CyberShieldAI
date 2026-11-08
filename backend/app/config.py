import os

class Settings:
    PROJECT_NAME: str = "CyberShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cybershield-super-secret-jwt-key-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "cybershield_ai")
    
    # Threat Intelligence API Keys (configurable via .env)
    GOOGLE_SAFE_BROWSING_KEY: str = os.getenv("GOOGLE_SAFE_BROWSING_KEY", "")
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    URLHAUS_API_KEY: str = os.getenv("URLHAUS_API_KEY", "")
    PHISHTANK_API_KEY: str = os.getenv("PHISHTANK_API_KEY", "")
    
    # Scanning Limits & SSRF Protection
    SCAN_TIMEOUT: int = int(os.getenv("SCAN_TIMEOUT", "10"))
    MAX_REDIRECTS: int = int(os.getenv("MAX_REDIRECTS", "5"))
    MAX_RESPONSE_BYTES: int = 1024 * 1024 * 2 # 2 MB limit

settings = Settings()
