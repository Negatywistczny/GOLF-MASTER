@echo off
setlocal

echo =========================================
echo      GOLF MASTER - LOCAL OFFLINE START
echo =========================================
echo.
echo Tryb aktywny: WEB + BLE UART (bez Python bridge)

echo.
echo [1/2] Budowanie offline bundle...
python "%~dp0web\bundle_tool.py" build
if errorlevel 1 (
    echo Blad: nie udalo sie zbudowac web/script.bundle.js
    pause
    exit /b 1
)

echo [2/2] Otwieranie UI (file://)
timeout /t 2 /nobreak > NUL
start "" "%~dp0web\index.html"

echo.
echo Gotowe. UI uruchomione lokalnie.
echo Kliknij "POLACZ BT" w UI i wybierz urzadzenie ESP32 BLE UART.
endlocal
