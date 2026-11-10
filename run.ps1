Write-Host "Starting CyberShield AI Server on http://localhost:8000..." -ForegroundColor Cyan

if (Test-Path "D:\Python314\python.exe") {
    & "D:\Python314\python.exe" backend/run.py
} elseif (Test-Path "C:\Python314\python.exe") {
    & "C:\Python314\python.exe" backend/run.py
} else {
    python backend/run.py
}

