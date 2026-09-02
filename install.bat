@echo off
setlocal
title Student Lead Generator - Installer
color 0B

echo.
echo  ================================================
echo   Student Lead Generator - Installer
echo   Nagpur IT Courses
echo  ================================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found!
    echo  Please install Python 3.10 or higher from:
    echo  https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
echo  [OK] Python found

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found!
    echo  Please install Node.js 18 or higher from:
    echo  https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo  [OK] Node.js found

echo.
echo  [Step 1/4] Creating Python virtual environment...
cd /d "%~dp0backend"
python -m venv venv
if errorlevel 1 (
    echo  [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)
echo  [OK] Virtual environment created

echo.
echo  [Step 2/4] Installing Python packages (this may take 1-2 minutes)...
call venv\Scripts\activate.bat
pip install --only-binary :all: fastapi uvicorn[standard] beautifulsoup4 requests httpx python-multipart pydantic lxml aiohttp
if errorlevel 1 (
    echo  [WARNING] Some packages needed compilation. Trying full install...
    pip install fastapi uvicorn[standard] beautifulsoup4 requests httpx python-multipart pydantic lxml aiohttp
)
echo  [OK] Python packages installed

echo.
echo  [Step 3/4] Installing Node.js packages (this may take 1-2 minutes)...
cd /d "%~dp0frontend"
npm install
if errorlevel 1 (
    echo  [ERROR] Failed to install Node.js packages.
    pause
    exit /b 1
)
echo  [OK] Node.js packages installed

echo.
echo  [Step 4/4] Testing backend...
cd /d "%~dp0backend"
call venv\Scripts\python -c "import fastapi, uvicorn, bs4, requests; print('[OK] All imports work')"

echo.
echo  ================================================
echo   Installation COMPLETE!
echo  
echo   Now double-click start.bat to launch the app
echo  ================================================
echo.
pause
endlocal
