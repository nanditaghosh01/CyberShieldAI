# CyberShield AI – Intelligent Phishing Detection and Web Security Intelligence Platform

![CyberShield AI Banner](https://img.shields.io/badge/Security-AI%20Threat%20Intelligence-457b9d?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-1d3557?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React%2018-0b1523?style=for-the-badge&logo=react&logoColor=a9d8de)
![Scikit-Learn](https://img.shields.io/badge/Scikit_Learn-182b45?style=for-the-badge&logo=scikit-learn&logoColor=f3fbf0)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-274366?style=for-the-badge&logo=tailwind-css&logoColor=a9d8de)
![License](https://img.shields.io/badge/License-MIT-457b9d?style=for-the-badge)

---

## 1. Executive Summary

**CyberShield AI** is an intelligent, full-stack cybersecurity platform designed to detect phishing websites, deceptive portals, fraudulent payment gateways, typosquatted brand domains, and web infrastructure misconfigurations.

Rather than relying on isolated static scans or basic blocklists, CyberShield AI unifies **five distinct defensive security dimensions** into an automated, multi-factor risk assessment engine:

1. **AI/ML Phishing Classification**: Machine learning models trained on **101,218 real-world URL feature vectors** from `url_features_extracted1.csv`, delivering high-accuracy multi-class categorization (*Legitimate*, *Suspicious*, *Phishing*, *Malicious*).
2. **Website Security Posture**: Passive audit of defensive HTTP security headers (`HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`), cookie security attributes (`Secure`, `HttpOnly`, `SameSite`), server disclosure leaks, and sensitive configuration endpoints.
3. **SSL/TLS Cryptographic Chain Inspection**: Deep X.509 certificate parsing, Certificate Authority (CA) validation, RSA/ECC key size analysis, signature hash algorithms, TLS protocol version checks, and Certificate Transparency (CT) Signed Certificate Timestamp (SCT) log verification.
4. **Domain & DNS Threat Intelligence**: Automated DNS resolution (`A`, `AAAA`, `MX`, `NS`, `TXT`), email authentication spoofing defenses (`SPF`, `DMARC`), reverse DNS (PTR), and threat feed cross-referencing (Google Safe Browsing, VirusTotal, URLhaus).
5. **Collaborative Threat Intelligence**: Community-driven reporting network with voting consensus, dispute mechanisms, and role-based moderation workflows.

---

## 2. Core Motivating Problem & Industry Context

Modern cyber attacks have evolved far beyond crude spam emails:
- **Deceptive Clone Portals**: Fake payment flows, fraudulent recruitment/internship portals targeting students, and university admission credential stealers.
- **Typosquatting & Homoglyphs**: Domains employing character substitutions (e.g. digit `1` for `l`, `0` for `o`), homoglyphs, and subdomains disguising brand names.
- **The "HTTPS Fallacy" & The eMudhra TLS Incident**: Users are often taught that the browser padlock means a site is safe. Attackers now routinely equip phishing websites with valid, free or poorly audited SSL certificates. The **eMudhra Certificate Authority incident** demonstrated that unauthorized intermediate certificates or weak issuance controls can generate authentic-looking certificates for unauthorized domains. CyberShield AI rigorously inspects issuing CAs, validity windows, and Certificate Transparency logs rather than blindly trusting the presence of an SSL padlock.

---

## 3. Human-Touch UI & Thoughtful Design System

The platform is designed with a modern, human-first SaaS user interface that replaces robotic AI cliches (such as pulsating neon glows, electric drop shadows, and dense machine jargon) with clear, approachable design:

- **Strict 5-Color Human Palette**:
  - **Prussian Navy** (`#1d3557` base, `#0b1523` background, `#122035` cards, `#274366` borders)
  - **Steel Cerulean** (`#457b9d` icons, secondary buttons, and active tabs)
  - **Soft Ice Blue / Aqua** (`#a9d8de` primary accents, highlighted metrics, clean state indicators)
  - **Crisp Honeydew White** (`#f3fbf0` typography and high-contrast text)
  - **Primary Coral Red & Danger Palette** (`#e83845`, `#f86b76`, `#28070a`, `#ffd0d4` reserved for threats, phishing flags, and security warnings)
- **Plain-Language Safety Verdicts**: Every scan opens with a clear verdict card stating plainly whether a link is safe or dangerous in terms anyone can understand.
- **Feature Translation Dictionaries**: Translates raw machine learning telemetry (`ratio_digits_url`, `nb_hyphens`, `url_entropy`) into human terms (*"Digit Ratio"*, *"Hyphens in Domain (Spoofing indicator)"*, *"Random Character Entropy"*).
- **Educational Explanations**: Includes interactive guides on why **CSP**, **HSTS**, and **cookie flags** matter to everyday visitors in preventing password theft and Wi-Fi snooping.

---

## 4. Full Responsiveness: Mobile, Tablet & PC

CyberShield AI is engineered to deliver a seamless experience across all screen sizes:

- 📱 **Mobile Phones (iOS & Android, 320px – 767px)**:
  - Responsive **off-canvas slide-out navigation drawer** with a darkened backdrop blur overlay (`bg-black/60`).
  - Hamburger menu button in the top navigation bar with auto-close upon selecting any view.
  - Compact **2-column metric cards grid** to prevent endless vertical scrolling.
  - Touch-friendly horizontal tab swiping across deep-dive analysis categories.
  - Protected table scrolling (`overflow-x-auto min-w-[550px]`) so headers and columns never squash or overlap.
  - Viewport-safe scanning modal with scroll containment (`max-h-[90vh]`).
- 📟 **Tablets (iPads & Android Tablets, 768px – 1023px)**:
  - Balanced **3-column** metric cards grid.
  - Side-by-side visual charts with touch-optimized tooltip interactions.
  - Responsive table views and touch-friendly button targets (minimum 44px height).
- 💻 **PCs & Desktop Monitors (≥ 1024px)**:
  - Permanent docked sidebar navigation with quick access to all security modules.
  - Full **5-column** horizontal metrics dashboard.
  - Extensive side-by-side multi-factor breakdown and comparative benchmark matrices.

---

## 5. Machine Learning Model & Evaluation Benchmarks

The machine learning module is trained and evaluated on **101,218 URL feature vectors** from `url_features_extracted1.csv`. It extracts structural, lexical, and cryptographic features from each URL without executing untrusted code:

- **Lexical metrics**: Total URL length, domain length, path depth, character entropy.
- **Structural counts**: Dots, hyphens, `@` symbols, slashes, digit ratio.
- **Deception indicators**: IP address as hostname, URL shorteners, punycode/IDN homographs.
- **Content heuristics**: Suspicious security keywords (`login`, `verify`, `banking`, `kyc`, `wallet`).
- **Typosquatting & Brand similarity**: Levenshtein distance against 25+ top global brands with leetspeak normalization (`1` $\rightarrow$ `l`, `0` $\rightarrow$ `o`).

### Evaluated Model Algorithms:
- **Random Forest (Production Engine)**: High generalization, robust against overfitting on complex multi-class data.
- **Gradient Boosting**: Optimized decision splits on rare-event phishing indicators.
- **Logistic Regression**: Linear baseline benchmark.

*Full confusion matrices, precision, recall, F1-scores, and ROC-AUC curves are interactively viewable in the **Model Accuracy** dashboard tab.*

---

## 6. Multi-Factor Risk Scoring Engine

CyberShield AI calculates a unified, transparent risk score from **0 to 100** by weighting 5 independent dimensions:

$$\text{Risk Score} = 0.35 \times S_{\text{AI}} + 0.25 \times S_{\text{Intel}} + 0.20 \times S_{\text{SSL}} + 0.10 \times S_{\text{Web}} + 0.10 \times S_{\text{DNS}}$$

### Severity Categorization:
- **0 – 20: Low Risk** (Structurally clean, audited CA, compliant security posture).
- **21 – 40: Moderate Risk** (Minor header omissions, sub-optimal cookie flags).
- **41 – 60: Elevated Risk** (Suspicious TLD, excessive subdomains, missing SPF/DMARC).
- **61 – 80: High Risk** (High AI phishing probability, typosquatted brand detected, expired cert).
- **81 – 100: Critical Risk** (Direct malware payload, confirmed threat feed blocklist match).

---

## 7. Security By Design & SSRF Safeguards

The scanner adheres to strict defensive security practices:
- **SSRF Defense**: Automatically resolves hostnames and blocks private/reserved IP networks (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopbacks (`127.0.0.0/8`, `::1`), link-local metadata addresses (`169.254.169.254`), and cloud instance metadata endpoints.
- **Passive & Safe**: Employs passive headers and safe requests. Does not exploit vulnerabilities, inject payloads, or execute untrusted scripts.
- **Enforced Timeouts & Limits**: 10-second socket timeouts and 5-hop redirect limits prevent resource exhaustion and infinite redirection loops.
- **Role-Based Access Control (RBAC)**: Secure bcrypt password hashing and cryptographic JWT tokens enforce separation of privileges across **Regular User**, **Security Analyst**, and **Administrator** accounts.

---

## 8. Project Structure

```
Heckmatrix/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI initialization & SPA static mounting
│   │   ├── config.py                  # Environment configuration (.env)
│   │   ├── database.py                # Dual Mongo / SQLite driver with Vercel /tmp fallback
│   │   ├── models/                    # Data models
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── auth.py                # User authentication & JWT
│   │   │   ├── scanner.py             # Unified multi-engine scanner & stats
│   │   │   ├── ssl_inspector.py       # Deep SSL/TLS certificate inspection
│   │   │   ├── security_assessment.py # Passive web header & cookie audit
│   │   │   ├── threat_intelligence.py # DNS & multi-source threat lookup
│   │   │   ├── community_reports.py   # Crowdsourced reporting & voting
│   │   │   ├── history.py             # Historical scan logs
│   │   │   └── admin.py               # Moderation & system status
│   │   ├── services/
│   │   │   ├── url_analyzer.py        # Unified scan orchestrator
│   │   │   ├── ssl_inspector.py       # Cryptography & X.509 analyzer
│   │   │   ├── website_security.py    # Passive HTTP headers & cookie checks
│   │   │   ├── domain_analyzer.py     # DNS resolver & SPF/DMARC auditor
│   │   │   ├── threat_intelligence.py # Safe Browsing, VirusTotal, URLhaus
│   │   │   ├── risk_scoring.py        # Multi-factor 0-100 score engine
│   │   │   └── report_generator.py    # Technical audit report exporter
│   │   ├── ml/
│   │   │   ├── feature_extractor.py   # Engineered feature extractor & typosquatting
│   │   │   ├── train_model.py         # Model training on url_features_extracted1.csv
│   │   │   ├── predict.py             # Runtime inference & explainability
│   │   │   ├── model.joblib           # Saved trained classifier
│   │   │   └── metrics.json           # Persisted benchmark metrics
│   │   └── utils/
│   │       ├── security.py            # Bcrypt hashing & JWT verification
│   │       └── validators.py          # SSRF mitigation & URL sanitization
│   ├── main.py                        # Vercel FastAPI entrypoint
│   ├── index.py                       # Vercel ASGI fallback entrypoint
│   ├── requirements.txt               # Backend Python dependencies
│   └── run.py                         # Local backend startup script
├── frontend/
│   ├── src/
│   │   ├── components/                # Responsive UI components (Navbar, Sidebar, RiskGauge)
│   │   ├── pages/                     # Dashboard, URLScanner, SSL, Community, etc.
│   │   ├── services/api.js            # Unified API client
│   │   ├── context/AuthContext.jsx    # Authentication state provider
│   │   ├── layouts/MainLayout.jsx     # Responsive layout with mobile drawer
│   │   ├── App.jsx
│   │   └── index.css                  # Custom styling & scrollbar styles
│   ├── package.json                   # Linux-safe build script using direct node invoker
│   ├── vite.config.js                 # Vite bundler configuration & local API proxy
│   └── tailwind.config.js             # 5-color palette configuration
├── tests/
│   └── test_platform.py               # Automated test suite
├── vercel.json                        # Vercel multi-service monorepo configuration
├── url_features_extracted1.csv        # 101,218 sample training dataset
├── run.bat                            # Windows Command Prompt 1-click launcher
├── run.ps1                            # Windows PowerShell 1-click launcher
├── package.json                       # Root script forwarder
└── README.md
```

---

## 9. Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm
- MongoDB (Optional: automatically falls back to an embedded local SQLite database if MongoDB is not running)

### One-Click Execution (Windows)
Run the entire platform with a single command from your project root:

**PowerShell:**
```powershell
.\run.ps1
```

**Command Prompt:**
```cmd
run.bat
```

**Or via npm from the root:**
```bash
npm start
```

Open your browser at:
- 🌐 **Web Application**: `http://localhost:8000`
- 📑 **Interactive Swagger API Docs**: `http://localhost:8000/docs`
- 📖 **ReDoc API Documentation**: `http://localhost:8000/redoc`

### Frontend Live Development Mode (Vite Hot-Reload)
```powershell
npm run dev
```
*(Runs Vite on `http://localhost:5173` with automatic API proxying to port 8000)*

---

## 10. Running Automated Tests

Verify that all unit tests, feature extraction vectors, SSRF guards, and ML prediction pipelines pass cleanly:

```powershell
& "D:\Python314\python.exe" tests/test_platform.py
```
*(or `python tests/test_platform.py`)*

---

## 11. Deploying on Vercel (Multi-Service Project)

CyberShield AI is configured as a **Vercel Multi-Service Project** using [`vercel.json`](file:///d:/Projects/Heckmatrix/vercel.json):

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure CyberShield AI deployment"
   git push
   ```
2. **Import on Vercel**:
   - In Vercel, select your repository.
   - Vercel automatically detects the preset as **Services** (`backend` on `/api` and `frontend` on `/`).
3. **Environment Variables (Optional)**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`). If left empty, CyberShield AI automatically falls back to an embedded SQLite store in `/tmp`.
   - `SECRET_KEY`: A secure random string for signing JWT tokens.
   - `GOOGLE_SAFE_BROWSING_KEY`, `VIRUSTOTAL_API_KEY`: External threat feed API keys (optional).
4. **Click Deploy**:
   Vercel builds both services in parallel and deploys them under a single unified domain.

---

## 12. Pre-Configured Demo Accounts

For instant testing and evaluation, the database automatically seeds with administrative and analyst credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@cybershield.ai` | `CyberShield@2026` | Full platform access, report moderation, system status |
| **Security Analyst** | `analyst@cybershield.ai` | `Analyst@2026` | Community report review, status verification |
| **Regular User** | *Register any email* | *User password* | URL scanning, personal history, report submission |

---

## 13. REST API Reference

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

## 14. License

Released under the **MIT License**.
