#!/usr/bin/env bash
# OTA upload helper for hardware/esp32.ino (ESP32, huge_app partition).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKETCH="$ROOT/hardware/esp32.ino"
FQBN="${FQBN:-esp32:esp32:esp32:PartitionScheme=huge_app}"
BUILD_DIR="${BUILD_DIR:-/tmp/golf-master-ota-build}"
OTA_PORT="${OTA_PORT:-3232}"
OTA_PASSWORD="${OTA_PASSWORD:-}"
HOSTS=("${OTA_HOSTS[@]:-VAG-Dekoder-OTA.local 192.168.1.51 192.168.1.50}")
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY_SEC="${RETRY_DELAY_SEC:-5}"

log() { printf '[ota] %s\n' "$*"; }
die() { log "ERROR: $*"; exit 1; }

command -v arduino-cli >/dev/null 2>&1 || die "arduino-cli not found in PATH"

log "Compiling $SKETCH (FQBN=$FQBN)..."
arduino-cli compile --fqbn "$FQBN" --build-path "$BUILD_DIR" "$SKETCH"

BIN="$BUILD_DIR/esp32.ino.bin"
[[ -f "$BIN" ]] || die "Binary not found: $BIN"

upload_once() {
    local host="$1"
    local auth_args=()
    if [[ -n "$OTA_PASSWORD" ]]; then
        auth_args=(--auth="$OTA_PASSWORD")
    fi
    log "Uploading to $host:$OTA_PORT ..."
    arduino-cli upload \
        --fqbn "$FQBN" \
        --input-dir "$BUILD_DIR" \
        --port "espota://$host:$OTA_PORT" \
        "${auth_args[@]}"
}

attempt=1
while (( attempt <= MAX_RETRIES )); do
    for host in "${HOSTS[@]}"; do
        if upload_once "$host"; then
            log "OTA success via $host"
            log "After reboot, confirm SYS:FW:BUILD_ID in BLE terminal log."
            exit 0
        fi
        log "Upload failed for $host (attempt $attempt/$MAX_RETRIES)"
    done
    (( attempt++ )) || true
    if (( attempt <= MAX_RETRIES )); then
        log "Retrying in ${RETRY_DELAY_SEC}s..."
        sleep "$RETRY_DELAY_SEC"
    fi
done

die "All OTA hosts failed after $MAX_RETRIES attempts"
