@echo off
setlocal
title Student Lead Generator
color 0A

echo.
echo  ================================================
echo   Student Lead Generator - Nagpur IT Courses
echo  ================================================
echo.

:: Check venv exists
if not exist "%~dp0backend\venv\Scripts\activate.bat" (
    echo  [ERROR] Python venv not found!
    echo  Please run install.bat first.
    echo.
    pause
    exit /b 1
)

:: Check node_modules exists
if not exist "%~dp0frontend\node_modules" (
    echo  [ERROR] Node modules not found!
    echo  Please run install.bat first.
    echo.
    pause
    exit /b 1
)

:: Kill any old processes on the ports
echo  Clearing old port usage...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo  [1/3] Starting Backend API server...
start "LeadGen - Backend API" cmd /k "cd /d %~dp0backend && venv\Scripts\activate.bat && venv\Scripts\uvicorn.exe main:app --host 127.0.0.1 --port 8000"

echo  [2/3] Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo  [3/3] Starting Frontend UI...
start "LeadGen - Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo  Waiting for frontend to start (6 seconds)...
timeout /t 6 /nobreak >nul

echo  Opening app in browser...
start "" http://localhost:3000

echo.
echo  ================================================
echo   SUCCESS! App is now open in your browser.
echo.
echo   Browser URL : http://localhost:3000
echo   Backend API : http://localhost:8000
echo.
echo   IMPORTANT: Keep the other 2 terminal windows
echo   open while using the app!
echo  ================================================
echo.
pause
endlocal
