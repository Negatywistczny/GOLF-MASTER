@echo off
setlocal

echo =========================================
echo      GOLF MASTER - LOCAL OFFLINE START
echo =========================================
echo.
echo Tryb aktywny: WEB + BLE UART

set "PYTHON_BIN="
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_BIN=%~dp0.venv\Scripts\python.exe"
) else (
    where /Q py
    if not errorlevel 1 (
        set "PYTHON_BIN=py -3"
    ) else (
        where /Q python
        if not errorlevel 1 (
            set "PYTHON_BIN=python"
        ) else (
            where /Q python3
            if not errorlevel 1 (
                set "PYTHON_BIN=python3"
            )
        )
    )
)

if "%PYTHON_BIN%"=="" (
    echo Blad: nie znaleziono interpretera Python ^(py/python/python3^).
    pause
    exit /b 1
)

echo.
echo [1/2] Budowanie offline bundle...
%PYTHON_BIN% "%~dp0web\bundle_tool.py" build
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
