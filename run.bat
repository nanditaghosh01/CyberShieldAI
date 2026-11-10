@echo off
echo Starting CyberShield AI Server...
if exist "D:\Python314\python.exe" (
    "D:\Python314\python.exe" backend/run.py
) else if exist "C:\Python314\python.exe" (
    "C:\Python314\python.exe" backend/run.py
) else (
    python backend/run.py
)