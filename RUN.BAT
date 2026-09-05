@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════╗
echo ║    INTELLIGENT RESOURCE OPTIMIZER       ║
echo ║         Desktop Application             ║
echo ╚══════════════════════════════════════════╝
echo.

echo [1] Checking Python Backend...
if not exist "python-backend\app.py" (
    echo ❌ ERROR: python-backend folder not found!
    pause
    exit /b 1
)

echo [2] Checking Python installation...
python --version > nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python not installed!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo [3] Installing Python dependencies...
cd python-backend
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ⚠️  Warning: Some dependencies may not have installed
)

echo [4] Starting Python Backend (FastAPI)...
start "Python Backend" cmd /k "python app.py"
timeout /t 3 > nul

echo [5] Checking Node.js installation...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [6] Checking Electron UI...
cd ..\electron-ui
if not exist "package.json" (
    echo ❌ ERROR: electron-ui folder not found!
    pause
    exit /b 1
)

echo [7] Installing Electron dependencies...
call npm install --silent
if errorlevel 1 (
    echo ⚠️  Warning: npm install had issues
)

echo [8] Starting Electron Desktop App...
start "Electron UI" cmd /k "npm start"

echo.
echo ╔══════════════════════════════════════════╗
echo ║          SETUP COMPLETE!                ║
echo ╠══════════════════════════════════════════╣
echo ║  Two windows have opened:               ║
echo ║  1. Python Backend (Terminal)           ║
echo ║  2. Electron Desktop App                ║
echo ║                                         ║
echo ║  Wait 5-10 seconds for both to start   ║
echo ║  Then check Electron app for live data  ║
echo ╚══════════════════════════════════════════╝
echo.
echo Press any key to exit this setup script...
pause > nul