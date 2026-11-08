# CyberShield AI – Intelligent Phishing Detection and Web Security Intelligence Platform

![CyberShield AI Banner](https://img.shields.io/badge/Security-AI%20Threat%20Intelligence-00f0ff?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Scikit-Learn](https://img.shields.io/badge/Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 1. Executive Summary

**CyberShield AI** is an advanced, production-grade cybersecurity intelligence platform engineered to detect modern phishing campaigns, deceptive web portals, fraudulent payment gateways, typosquatted brand domains, and web infrastructure misconfigurations. 

Rather than relying on isolated static scans or basic blocklists, CyberShield AI unifies **five distinct defensive security dimensions** into an automated, multi-factor risk assessment engine:

1. **AI/ML Phishing Classification**: 24-dimensional feature extraction with trained ensemble classification (Gradient Boosting & Random Forest) yielding **98.9% test accuracy**.
2. **Website Security Posture**: Passive audit of defensive HTTP security headers (`HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`), cookie security attributes (`Secure`, `HttpOnly`, `SameSite`), server disclosure leaks, and sensitive configuration endpoints.
3. **SSL/TLS Cryptographic Chain Inspection**: X.509 certificate parsing, Certificate Authority (CA) validation, RSA/ECC key size analysis, signature hash algorithms, TLS protocol version checks, and Certificate Transparency (CT) Signed Certificate Timestamp (SCT) log verification.
4. **Domain & DNS Threat Intelligence**: Automated DNS resolution (`A`, `AAAA`, `MX`, `NS`, `TXT`), email authentication spoofing defenses (`SPF`, `DMARC`), reverse DNS (PTR), and threat feed cross-referencing.
5. **Collaborative Threat Intelligence**: Community-driven reporting network with voting consensus and role-based administrator moderation workflows.

---

## 2. Core Motivating Problem & Industry Context

Modern cyber attacks have evolved far beyond crude spam emails:
- **Deceptive Clone Portals**: Fake payment flows, fraudulent recruitment/internship portals targeting students, and university admission credential stealers.
- **Typosquatting & Homoglyphs**: Domains employing character substitutions (e.g. digit `1` for `l`, `0` for `o`), homoglyphs, and subdomains disguising brand names.
- **The "HTTPS Fallacy" & The eMudhra TLS Incident**: Users are often taught that the browser padlock means a site is safe. Attackers now routinely equip phishing websites with valid, free or poorly audited SSL certificates. The **eMudhra Certificate Authority incident** demonstrated that unauthorized intermediate certificates or weak issuance controls can generate authentic-looking certificates for unauthorized domains. CyberShield AI rigorously inspects issuing CAs, validity windows, and Certificate Transparency logs rather than blindly trusting the presence of an SSL padlock.

---

## 3. Platform Architecture

```
                                  +---------------------------------------+
                                  |         React 18 + Vite Frontend      |
                                  | (Dashboard, Scanner, Recharts, Theme) |
                                  +-------------------+-------------------+
                                                      |
                                             REST API | JWT Bearer
                                                      v
                                  +---------------------------------------+
                                  |          FastAPI Backend Core         |
                                  +-------------------+-------------------+
                                                      |
                 +-------------------+----------------+-------------------+-------------------+
                 |                   |                |                   |                   |
                 v                   v                v                   v                   v
      +--------------------+ +---------------+ +--------------+ +-------------------+ +---------------+
      |    ML Predictor    | | SSL Inspector | | Web Security | | Domain & Threat   | | Collaborative |
      | (24 Feat Vectors / | | (X.509/CA/SAN/| | (HSTS/CSP/   | | (DNS/SPF/DMARC/   | | Threat DB     |
      | Gradient Boosting) | | TLS1.3/CT Log)| | Cookies/Dirs)| | SafeBrowsing/URLh)| | (Votes/Admin) |
      +--------------------+ +---------------+ +--------------+ +-------------------+ +---------------+
                 |                   |                |                   |                   |
                 +-------------------+----------------+-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |      Unified Risk Scoring Engine      |
                                  |     (0-100 Weighted Score Matrix)     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     Dual Persistence Data Layer       |
                                  |   (MongoDB + Automatic SQLite Local)  |
                                  +---------------------------------------+
```

---

## 4. Machine Learning Model & Evaluation Benchmarks

The machine learning module extracts **24 engineered structural, lexical, and cryptographic features** from each URL without executing untrusted code:
- Lexical metrics: total URL length, domain length, path depth, character entropy.
- Structural counts: dots, hyphens, `@` symbols, slashes, digit ratio.
- Deception indicators: IP address as hostname, URL shorteners, punycode/IDN homographs.
- Content heuristics: suspicious security keywords (`login`, `verify`, `banking`, `kyc`, `wallet`).
- Typosquatting / brand similarity: Levenshtein distance against 25+ top global brands with leetspeak normalization (`1`->`l`, `0`->`o`, etc.).

### Model Comparison Matrix

The models were evaluated using stratified k-fold splits across **Legitimate**, **Suspicious**, **Phishing**, and **Malicious** classes:

| Model Algorithm | Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score | ROC-AUC (OvR) |
|---|---|---|---|---|---|
| **Gradient Boosting (Production)** | **98.89%** | **98.94%** | **98.89%** | **0.9888** | **1.0000** |
| **Random Forest** | 93.33% | 93.83% | 93.33% | 0.9331 | 0.9979 |
| **Logistic Regression** | 85.56% | 86.35% | 85.56% | 0.8550 | 0.9875 |

*Confusion matrices and full feature importance charts are viewable interactively in the **ML Benchmarks** dashboard tab.*

---

## 5. Intelligent Multi-Factor Risk Scoring Engine

CyberShield AI calculates a unified, transparent risk score from **0 to 100** by weighting 5 independent dimensions:

$$\text{Risk Score} = 0.35 \times S_{\text{AI}} + 0.25 \times S_{\text{Intel}} + 0.20 \times S_{\text{SSL}} + 0.10 \times S_{\text{Web}} + 0.10 \times S_{\text{DNS}}$$

### Severity Categorization:
- **0 – 20: Low Risk** (Structurally clean, audited CA, compliant security posture).
- **21 – 40: Moderate Risk** (Minor header omissions, sub-optimal cookie flags).
- **41 – 60: Elevated Risk** (Suspicious TLD, excessive subdomains, missing SPF/DMARC).
- **61 – 80: High Risk** (High AI phishing probability, typosquatting brand detected, expired cert).
- **81 – 100: Critical Risk** (Direct malware payload, confirmed threat feed blocklist match).

---

## 6. Security By Design & SSRF Safeguards

The scanner adheres to strict defensive security practices:
- **SSRF Defense**: Automatically resolves hostnames and blocks private/reserved IP networks (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopbacks (`127.0.0.0/8`, `::1`), link-local metadata addresses (`169.254.169.254`), and cloud instance metadata endpoints.
- **Passive & Safe**: Employs passive headers and safe `HEAD` requests. Does not exploit vulnerabilities, inject payloads, or execute untrusted scripts.
- **Enforced Timeouts & Limits**: 10-second socket timeouts and 5-hop redirect limits prevent resource exhaustion and infinite redirection loops.
- **Role-Based Access Control (RBAC)**: Secure bcrypt password hashing and cryptographic JWT tokens enforce separation of privileges across **Regular User**, **Security Analyst**, and **Administrator** accounts.

---

## 7. Project Structure

```
Heckmatrix/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI initialization & SPA static mounting
│   │   ├── config.py                # Environment configuration
│   │   ├── database.py              # Dual Mongo / SQLite driver manager
│   │   ├── models/                  # Data models
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── auth.py              # User authentication & JWT
│   │   │   ├── scanner.py           # Unified multi-engine scanner & stats
│   │   │   ├── ssl_inspector.py     # Deep SSL/TLS certificate inspection
│   │   │   ├── security_assessment.py # Passive web header & cookie audit
│   │   │   ├── threat_intelligence.py # DNS & multi-source threat lookup
│   │   │   ├── community_reports.py # Crowdsourced reporting & voting
│   │   │   ├── history.py           # Historical scan logs
│   │   │   └── admin.py             # Moderation & system status
│   │   ├── services/
│   │   │   ├── url_analyzer.py      # Unified scan orchestrator
│   │   │   ├── ssl_inspector.py     # Cryptography & X.509 analyzer
│   │   │   ├── website_security.py  # Passive HTTP headers & cookie checks
│   │   │   ├── domain_analyzer.py   # DNS resolver & SPF/DMARC auditor
│   │   │   ├── threat_intelligence.py # Safe Browsing, VirusTotal, URLhaus
│   │   │   ├── risk_scoring.py      # Multi-factor 0-100 score engine
│   │   │   └── report_generator.py  # ASCII / PDF technical audit exporter
│   │   ├── ml/
│   │   │   ├── feature_extractor.py # 24 engineered features & typosquatting
│   │   │   ├── train_model.py       # Model training & benchmark generator
│   │   │   ├── predict.py           # Runtime inference & explainability
│   │   │   ├── model.joblib         # Saved Gradient Boosting classifier
│   │   │   └── metrics.json         # Persisted benchmark metrics
│   │   └── utils/
│   │       ├── security.py          # Bcrypt hashing & JWT verification
│   │       └── validators.py        # SSRF mitigation & URL sanitization
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py                       # Backend startup runner
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI components (RiskGauge, Badges, Modals)
│   │   ├── pages/                   # Dashboard, URLScanner, SSL, Community, etc.
│   │   ├── services/api.js          # Unified API client
│   │   ├── context/AuthContext.jsx  # Authentication state provider
│   │   ├── layouts/MainLayout.jsx   # Cyber-styled responsive navigation layout
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── tests/
│   └── test_platform.py             # Comprehensive automated test suite
└── README.md
```

---

## 8. Installation & Execution Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm
- MongoDB (Optional: automatically uses zero-config embedded SQLite store if MongoDB is offline)

### Step 1: Clone Repository & Setup Environment
Open **Windows PowerShell** or terminal:

```powershell
# Navigate to workspace
cd d:\Projects\Heckmatrix

# Copy environment variables template
Copy-Item backend\.env.example backend\.env
```

### Step 2: Install Backend Dependencies
```powershell
python -m pip install -r backend/requirements.txt
```

### Step 3: Run Automated Test Suite
Verify that all unit tests, feature extraction vectors, SSRF guards, and ML prediction pipelines pass:
```powershell
python -m unittest tests/test_platform.py -v
```

### Step 4: Install Frontend Dependencies & Build
```powershell
cd frontend
npm install
npm run build
cd ..
```

### Step 5: Start the CyberShield Platform
You can run the complete full-stack platform using the backend runner (which automatically serves the compiled frontend and API):

```powershell
# Start unified full-stack server on port 8000
python backend/run.py
```

Or run frontend in Vite development mode with hot reloading:
```powershell
# Terminal 1: Backend
python backend/run.py

# Terminal 2: Frontend Dev Server
cd frontend
npm run dev
```

Open your browser at:
- **Web Platform**: `http://localhost:8000` (or `http://localhost:5173` in dev mode)
- **Interactive Swagger API Docs**: `http://localhost:8000/docs`
- **ReDoc API Documentation**: `http://localhost:8000/redoc`

---

## 9. Pre-Configured Demo Accounts

For instant testing and evaluation, the database automatically seeds with administrative and analyst credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@cybershield.ai` | `CyberShield@2026` | Full platform access, report moderation, system status |
| **Security Analyst** | `analyst@cybershield.ai` | `Analyst@2026` | Community report review, status verification |
| **Regular User** | *Register any email* | *User password* | URL scanning, personal history, report submission |

---

## 10. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account with role |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/v1/scanner/scan` | Initiate full multi-module security scan |
| `GET` | `/api/v1/scanner/stats` | Retrieve aggregated dashboard threat metrics |
| `GET` | `/api/v1/scanner/scan/{id}` | Retrieve individual scan result |
| `GET` | `/api/v1/scanner/scan/{id}/report` | Export technical audit report (.txt) |
| `GET` | `/api/v1/scanner/model-metrics` | Retrieve ML evaluation benchmarks |
| `POST` | `/api/v1/ssl/inspect` | Dedicated SSL/TLS certificate inspector |
| `POST` | `/api/v1/assessment/audit` | Dedicated website security headers audit |
| `POST` | `/api/v1/threat-intel/lookup` | Dedicated threat feeds and DNS query |
| `GET` | `/api/v1/community/reports` | List community-reported threat submissions |
| `POST` | `/api/v1/community/reports` | Submit new suspicious website report |
| `POST` | `/api/v1/community/reports/{id}/vote`| Upvote or downvote community report |
| `PATCH`| `/api/v1/admin/reports/{id}/status` | Moderate report verification status |
| `GET` | `/api/v1/admin/system-status` | Internal architecture & persistence health |
| `GET` | `/api/v1/health` | Health check probe |

---

## 11. Testing & Sample Verification Scenarios

| Test Target | Target Type | Expected AI Classification | Expected Risk Score | Key Identifying Features |
|---|---|---|---|---|
| `https://www.google.com` | Legitimate | **Legitimate** | 0 – 15 (Low Risk) | Clean domain, valid HSTS/CSP, audited Google CA |
| `http://paypa1-security-verification.com/webscr` | Phishing Clone | **Phishing / Malicious** | 80 – 95 (Critical Risk) | Typosquatting PayPal (digit `1`), sensitive keyword `webscr` |
| `http://192.168.1.100/payload.exe` | Malware C2 | **Malicious** | 85 – 100 (Critical Risk) | Bare IP address, executable extension `.exe` |
| `http://internship-offer-google.xyz/apply` | Fraudulent Portal | **Suspicious / Phishing** | 70 – 90 (High Risk) | Cheap `.xyz` TLD, brand impersonation |

---

## 12. License & Academic Attribution

Developed for major academic demonstration, university evaluation, and cybersecurity intelligence operations. Released under the **MIT License**.

