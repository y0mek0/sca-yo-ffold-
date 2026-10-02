@echo off
setlocal
chcp 65001 >nul
set "TRACEMARK_REPO=C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty"
set "FORCE_COLOR=1"
if not exist "%~dp0node_modules\electron" (
  echo Installing demo shell dependencies...
  call npm install --no-fund --no-audit
  if errorlevel 1 pause & exit /b 1
)
start "TRACEMARK CONTROL ROOM" /D "%~dp0" cmd /c "set TRACEMARK_REPO=%TRACEMARK_REPO%&& npm start"
endlocal
