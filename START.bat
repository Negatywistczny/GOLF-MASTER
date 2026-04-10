@echo off
setlocal

echo =========================================
echo      GOLF MASTER - LOCAL OFFLINE START
echo =========================================
echo.
echo Wybierz tryb bridge:
echo   [1] Realny bridge (bridge/bridge.py)
echo   [2] Symulacja (bridge/test_simulation.py)
echo.
set /p MODE=Wpisz 1 lub 2 i ENTER:

if "%MODE%"=="2" (
    set "BRIDGE_SCRIPT=bridge/test_simulation.py"
) else (
    set "BRIDGE_SCRIPT=bridge/bridge.py"
)

echo.
echo [1/3] Budowanie offline bundle...
python "%~dp0web\build_offline_bundle.py"
if errorlevel 1 (
    echo Blad: nie udalo sie zbudowac web/script.bundle.js
    pause
    exit /b 1
)

echo [2/3] Uruchamianie: %BRIDGE_SCRIPT%
start "GOLF MASTER Bridge" python "%~dp0%BRIDGE_SCRIPT%"

echo [3/3] Otwieranie UI (file://)
timeout /t 2 /nobreak > NUL
start "" "%~dp0web\index.html"

echo.
echo Gotowe. UI uruchomione lokalnie.
echo Aby zatrzymac bridge, zamknij okno "GOLF MASTER Bridge".
endlocal
