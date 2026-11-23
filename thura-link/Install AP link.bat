@echo off
rem Connects AP Main to Thura's Code on this PC. Run it once (and again only to connect afresh).
cd /d "%~dp0"
rem stop a copy that is already running (it would keep the old link code)
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*ap-link.js*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
node ap-link.js setup
if errorlevel 1 (echo. & echo Something went wrong. & pause & exit /b 1)
start "" wscript "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AP link.vbs"
echo.
echo Done. AP link is running and starts by itself with Windows.
pause
