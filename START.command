#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo "     GOLF MASTER - LOCAL OFFLINE START"
echo "========================================="
echo
echo "Tryb aktywny: WEB + BLE UART (bez Python bridge)"

if [[ -x ".venv/bin/python" ]]; then
  PYTHON_BIN=".venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
else
  PYTHON_BIN="python"
fi

echo
echo "[1/2] Budowanie offline bundle..."
"$PYTHON_BIN" "web/bundle_tool.py" build

echo "[2/2] Otwieranie UI (file://)"
sleep 2
open "web/index.html"

echo
echo "Gotowe. UI uruchomione lokalnie."
echo "Kliknij \"POLACZ BT\" w UI i wybierz urzadzenie ESP32 BLE UART."
