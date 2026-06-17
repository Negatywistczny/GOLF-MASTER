import {
    handleCANFrame,
    logError,
    logSystem,
    clearMessage,
    logTerminal,
    updateStatus
} from "../../ui/index.js";

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

function parseIncomingData(raw) {
    if (!raw) return;
    logTerminal(raw);

    if (raw.startsWith("CLR:")) {
        const { src, code } = parseTagged(raw, "CLR");
        clearMessage(src, code);
        return;
    }

    if (raw.startsWith("ERR:")) {
        const { src, code, details } = parseTagged(raw, "ERR");
        const ttlMs = ttlForError(src, code);
        const desc = details || `Wykryto błąd warstwy ${src}`;
        logError(src, code, desc, { ttlMs });
        return;
    }

    if (raw.startsWith("SYS:")) {
        const { src, code, details } = parseTagged(raw, "SYS");
        const desc = details || `Komunikat systemowy ${src}`;
        logSystem(src, code, desc, { ttlMs: MESSAGE_TTL_MS.SYS_DEFAULT });
        updateStatus(`${src}: ${code}`, "var(--accent)");
        return;
    }

    if (raw.includes(":")) {
        const [idHex, dataHex] = raw.split(":");
        handleCANFrame(idHex, dataHex);
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
    logError("JS", "BT_DISCONNECTED", "BLE UART został rozłączony", {
        ttlMs: MESSAGE_TTL_MS.ERR_BT_DISCONNECTED
    });
}

function onTxNotification(event) {
    const value = event?.target?.value;
    if (!value) return;
    const chunk = textDecoder.decode(value.buffer, { stream: true });
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
        logError("JS", "BT_UNSUPPORTED", "Przeglądarka nie obsługuje Web Bluetooth API");
        updateStatus("BRAK OBSŁUGI BLE W PRZEGLĄDARCE", "var(--red)");
        return false;
    }
    if (isConnecting) return false;

    try {
        isConnecting = true;
        updateConnectButton(false, true);
        await ensureConnected();

        updateStatus("POŁĄCZONO Z BLE UART", "var(--green)");
        logTerminal("SYS:JS:BT_CONNECTED");
        logSystem("JS", "BT_CONNECTED", "Połączono z ESP32 BLE UART", {
            ttlMs: MESSAGE_TTL_MS.SYS_DEFAULT
        });
        clearMessage("JS", "BT_DISCONNECTED");
        clearMessage("JS", "BT_CONNECT_FAIL");
        updateConnectButton(true, false);
        return true;
    } catch (error) {
        logError("JS", "BT_CONNECT_FAIL", error?.message || "Nie udało się połączyć z BLE UART");
        updateStatus("BŁĄD POŁĄCZENIA BLE UART", "var(--red)");
        updateConnectButton(false, false);
        return false;
    } finally {
        isConnecting = false;
    }
}

export function disconnectBleTerminal() {
    if (device?.gatt?.connected) {
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
