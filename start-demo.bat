@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Please install Node.js 22 LTS and try again.
  pause
  exit /b 1
)
if not exist "node_modules\next" (
  echo Installing project dependencies. Internet required for first setup.
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)
echo.
echo Aura BOED starting. Open http://localhost:3000
call npm run dev
pause
