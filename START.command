#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo "     GOLF MASTER - LOCAL OFFLINE START"
echo "========================================="
echo
echo "Wybierz tryb bridge:"
echo "  [1] Realny bridge (bridge/bridge.py)"
echo "  [2] Symulacja (bridge/test_simulation.py)"
echo
read -r -p "Wpisz 1 lub 2 i ENTER: " MODE

if [[ "$MODE" == "2" ]]; then
  BRIDGE_SCRIPT="bridge/test_simulation.py"
else
  BRIDGE_SCRIPT="bridge/bridge.py"
fi

if [[ -x ".venv/bin/python" ]]; then
  PYTHON_BIN=".venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
else
  PYTHON_BIN="python"
fi

echo
echo "[1/3] Budowanie offline bundle..."
"$PYTHON_BIN" "web/bundle_tool.py" build

echo "[2/3] Uruchamianie: $BRIDGE_SCRIPT"
"$PYTHON_BIN" "$BRIDGE_SCRIPT" > /tmp/golf-master-bridge.log 2>&1 &
BRIDGE_PID=$!
echo "PID bridge: $BRIDGE_PID"

echo "[3/3] Otwieranie UI (file://)"
sleep 2
open "web/index.html"

echo
echo "Gotowe. UI uruchomione lokalnie."
echo "Aby zatrzymac bridge: kill $BRIDGE_PID"
echo "Log bridge: /tmp/golf-master-bridge.log"
