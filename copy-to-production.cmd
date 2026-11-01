@echo off
setlocal
rem Custom Video Player (CYP) - Production Sync Delegator
rem Ensures execution parity with python copy-to-production.py
python "%~dp0copy-to-production.py" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Production synchronization failed with exit code %errorlevel%.
    exit /b %errorlevel%
)
endlocal
