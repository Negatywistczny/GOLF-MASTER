import {
    handleCANFrame,
    logError,
    logSystem,
    clearMessage,
    logTerminal,
    updateStatus
} from "../../ui/index.js";
import {
    catalogEntryFor,
    resolveFirmwareMessageKey
} from "../messageCatalog.js";

const BLE_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const BLE_RX_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const BLE_TX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

const MESSAGE_TTL_MS = {
    SYS_DEFAULT: 5000,
    ERR_DEFAULT: 15000,
    ERR_CAN_HANG: 60000,
    ERR_HW: 30000,
    ERR_BT_DISCONNECTED: null
};

const CONNECT_BUTTON_ID = "btn-bt-connect";
const textDecoder = new TextDecoder("utf-8");
const CAN_LINE_RE = /^0x[0-9A-F]+:([0-9A-F]{2}(?: [0-9A-F]{2})*)?$/i;

let device = null;
let server = null;
let rxCharacteristic = null;
let txCharacteristic = null;
let lineBuffer = "";
let isConnecting = false;

function parseTagged(raw, prefix) {
    const parts = raw.split(":");
    const src = parts[1] || "UNK";
    const code = parts[2] || "UNKNOWN";
    const details = parts.slice(3).join(":").trim();
    return { src, code, details, kind: prefix };
}

function ttlForError(src, code) {
    if (src === "CAN" && code === "HANG") return MESSAGE_TTL_MS.ERR_CAN_HANG;
    if (src === "HW") return MESSAGE_TTL_MS.ERR_HW;
    if (src === "JS" && code === "BT_DISCONNECTED") return MESSAGE_TTL_MS.ERR_BT_DISCONNECTED;
    return MESSAGE_TTL_MS.ERR_DEFAULT;
}

function toneForCatalogEntry(entry, kind) {
    if (entry?.tone) return entry.tone;
    return kind === "ERR" ? "error" : "system";
}

function buildDescription(entry, details, fallback) {
    if (!entry) return details || fallback;
    if (details && entry.key !== "FW:BUILD_ID") {
        return `${entry.desc} — ${details}`;
    }
    if (details && entry.key === "FW:BUILD_ID") {
        return `${entry.desc}: ${details}`;
    }
    return entry.desc || fallback;
}

function handleFirmwareMessage(kind, raw) {
    const parts = raw.split(":");
    const { key, details } = resolveFirmwareMessageKey(parts.slice(1));
    const entry = catalogEntryFor(key);
    const tone = toneForCatalogEntry(entry, kind);
    const src = key.includes(":") ? key.split(":")[0] : parts[1] || "UNK";
    const code = key.includes(":") ? key.split(":").slice(1).join(":") : key;
    const desc = buildDescription(
        entry ? { ...entry, key } : null,
        details,
        kind === "ERR" ? `Wykryto błąd: ${key}` : `Komunikat: ${key}`
    );
    const ttlMs = entry?.ttlMs !== undefined
        ? entry.ttlMs
        : (kind === "ERR" ? ttlForError(src, code) : MESSAGE_TTL_MS.SYS_DEFAULT);

    if (kind === "ERR") {
        logError(src, code, desc, { ttlMs, tone });
    } else {
        logSystem(src, code, desc, { ttlMs, tone });
    }

    updateStatus(`${key}${details ? ` (${details})` : ""}`, tone === "error" ? "var(--red)" : "var(--accent)");
}

function isValidCanLine(raw) {
    if (!CAN_LINE_RE.test(raw)) return false;
    return (raw.match(/0x[0-9A-F]+/gi) || []).length === 1;
}

function isRecognizedLine(raw) {
    if (raw.startsWith("SYS:") || raw.startsWith("ERR:") || raw.startsWith("CLR:")) {
        return true;
    }
    return isValidCanLine(raw);
}

function parseIncomingData(raw) {
    if (!raw || !isRecognizedLine(raw)) return;
    logTerminal(raw);

    if (raw.startsWith("CLR:")) {
        const { src, code } = parseTagged(raw, "CLR");
        clearMessage(src, code);
        return;
    }

    if (raw.startsWith("ERR:")) {
        handleFirmwareMessage("ERR", raw);
        return;
    }

    if (raw.startsWith("SYS:")) {
        handleFirmwareMessage("SYS", raw);
        return;
    }

    if (isValidCanLine(raw)) {
        const colonIdx = raw.indexOf(":");
        handleCANFrame(raw.slice(0, colonIdx), raw.slice(colonIdx + 1));
    }
}

function updateConnectButton(connected, busy = false) {
    const button = document.getElementById(CONNECT_BUTTON_ID);
    if (!button) return;
    button.disabled = busy;
    if (busy) {
        button.textContent = "ŁĄCZENIE BT...";
        button.classList.remove("btn-bt-connected");
        return;
    }
    if (connected) {
        button.textContent = "🔌 ROZŁĄCZ BT";
        button.classList.add("btn-bt-connected");
    } else {
        button.textContent = "🔌 POŁĄCZ BT";
        button.classList.remove("btn-bt-connected");
    }
}

function cleanupConnectionState() {
    if (txCharacteristic) {
        txCharacteristic.removeEventListener("characteristicvaluechanged", onTxNotification);
    }
    server = null;
    rxCharacteristic = null;
    txCharacteristic = null;
    lineBuffer = "";
}

function onDeviceDisconnected() {
    cleanupConnectionState();
    updateConnectButton(false, false);
    updateStatus("UTRACONO POŁĄCZENIE BLE UART", "var(--red)");
    logTerminal("ERR:JS:BT_DISCONNECTED");
    logError("JS", "BT_DISCONNECTED", "BLE UART został rozłączony", {
        ttlMs: MESSAGE_TTL_MS.ERR_BT_DISCONNECTED,
        tone: "error"
    });
}

function onTxNotification(event) {
    const value = event?.target?.value;
    if (!value) return;
    const chunk = textDecoder.decode(value, { stream: true });
    lineBuffer += chunk;

    const lines = lineBuffer.split(/\r?\n/);
    lineBuffer = lines.pop() || "";
    lines.forEach((line) => parseIncomingData(line.trim()));
}

async function ensureConnected() {
    if (!device) {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [BLE_SERVICE_UUID] }],
            optionalServices: [BLE_SERVICE_UUID]
        });
        device.addEventListener("gattserverdisconnected", onDeviceDisconnected);
    }

    server = await device.gatt.connect();
    const service = await server.getPrimaryService(BLE_SERVICE_UUID);
    rxCharacteristic = await service.getCharacteristic(BLE_RX_UUID);
    txCharacteristic = await service.getCharacteristic(BLE_TX_UUID);
    await txCharacteristic.startNotifications();
    txCharacteristic.addEventListener("characteristicvaluechanged", onTxNotification);
}

export async function connectBleTerminal() {
    if (!navigator.bluetooth) {
        logTerminal("ERR:JS:BT_UNSUPPORTED");
        logError("JS", "BT_UNSUPPORTED", "Przeglądarka nie obsługuje Web Bluetooth API", { tone: "error" });
        updateStatus("BRAK OBSŁUGI BLE W PRZEGLĄDARCE", "var(--red)");
        return false;
    }
    if (isConnecting) return false;

    try {
        isConnecting = true;
        updateConnectButton(false, true);
        updateStatus("ŁĄCZENIE Z BLE UART...", "var(--accent)");
        logTerminal("SYS:JS:BT_CONNECT_START");
        logSystem("JS", "BT_CONNECT_START", "Rozpoczynam łączenie z ESP32 BLE UART", {
            ttlMs: MESSAGE_TTL_MS.SYS_DEFAULT,
            tone: "info"
        });
        clearMessage("JS", "BT_CONNECT_FAIL");
        await ensureConnected();

        updateStatus("POŁĄCZONO Z BLE UART", "var(--green)");
        logTerminal("SYS:JS:BT_CONNECTED");
        logSystem("JS", "BT_CONNECTED", "Połączono z ESP32 BLE UART", {
            ttlMs: MESSAGE_TTL_MS.SYS_DEFAULT,
            tone: "info"
        });
        clearMessage("JS", "BT_DISCONNECTED");
        clearMessage("JS", "BT_CONNECT_FAIL");
        updateConnectButton(true, false);
        return true;
    } catch (error) {
        if (error?.name === "NotFoundError") {
            logTerminal("SYS:JS:BT_CONNECT_CANCELLED");
            logSystem("JS", "BT_CONNECT_CANCELLED", "Anulowano wybór urządzenia BLE UART", {
                ttlMs: MESSAGE_TTL_MS.SYS_DEFAULT,
                tone: "warn"
            });
            updateStatus("ANULOWANO WYBÓR URZĄDZENIA BLE", "var(--orange)");
            updateConnectButton(false, false);
            return false;
        }
        logTerminal("ERR:JS:BT_CONNECT_FAIL");
        logError("JS", "BT_CONNECT_FAIL", error?.message || "Nie udało się połączyć z BLE UART", { tone: "error" });
        updateStatus("BŁĄD POŁĄCZENIA BLE UART", "var(--red)");
        updateConnectButton(false, false);
        return false;
    } finally {
        isConnecting = false;
    }
}

export function disconnectBleTerminal() {
    if (device?.gatt?.connected) {
        logTerminal("SYS:JS:BT_DISCONNECT");
        logSystem("JS", "BT_DISCONNECT", "Ręczne rozłączenie BLE UART", {
            ttlMs: MESSAGE_TTL_MS.SYS_DEFAULT,
            tone: "info"
        });
        updateStatus("ROZŁĄCZANIE BLE UART...", "var(--orange)");
        device.gatt.disconnect();
    } else {
        cleanupConnectionState();
        updateConnectButton(false, false);
    }
}

export async function sendBtCommand(command) {
    if (!rxCharacteristic) {
        const connected = await connectBleTerminal();
        if (!connected || !rxCharacteristic) return false;
    }
    const payload = `${String(command || "").trim()}\n`;
    await rxCharacteristic.writeValue(new TextEncoder().encode(payload));
    return true;
}

export function initBtTerminalControls() {
    updateConnectButton(false, false);
    const button = document.getElementById(CONNECT_BUTTON_ID);
    if (!button) return;

    button.addEventListener("click", async () => {
        if (device?.gatt?.connected) {
            disconnectBleTerminal();
            return;
        }
        await connectBleTerminal();
    });
}
