import { setSocket } from "../../state/index.js";
import {
    handleCANFrame,
    logError,
    logSystem,
    clearMessage,
    logTerminal,
    updateStatus,
    handleDtcScanEvent,
    setDtcScanButtonLoading
} from "../../ui/index.js";

const WS_URL = "ws://localhost:8765";
const MESSAGE_TTL_MS = {
    SYS_DEFAULT: 5000,
    ERR_DEFAULT: 15000,
    ERR_CAN_HANG: 60000,
    ERR_HW: 30000,
    ERR_SERIAL_LOST: null,
    ERR_WS_DISCONNECTED: null
};

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
    if (src === "PY" && code === "SERIAL_LOST") return MESSAGE_TTL_MS.ERR_SERIAL_LOST;
    if (src === "JS" && code === "WS_DISCONNECTED") return MESSAGE_TTL_MS.ERR_WS_DISCONNECTED;
    return MESSAGE_TTL_MS.ERR_DEFAULT;
}

function parseIncomingData(raw) {
    if (raw.startsWith("{")) {
        try {
            const event = JSON.parse(raw);
            if (event.type === "dtc_scan") {
                handleDtcScanEvent(event.event, event.payload || {});
                if (event.event === "start") {
                    setDtcScanButtonLoading(true);
                    updateStatus("SKAN DTC: START", "var(--orange)");
                } else if (event.event === "complete") {
                    setDtcScanButtonLoading(false);
                    updateStatus("AUTO-SKAN ZAKOŃCZONY", "var(--green)");
                } else if (event.event === "error") {
                    setDtcScanButtonLoading(false);
                    updateStatus("BŁĄD SKANU DTC", "var(--red)");
                }
                return;
            }
        } catch (_err) {
            // Fallback do klasycznego parsera tekstowego.
        }
    }

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

export function connectWebSocket() {
    const socket = new WebSocket(WS_URL);
    setSocket(socket);

    socket.onopen = () => {
        updateStatus("POŁĄCZONO Z PYTHONEM", "var(--green)");
        logTerminal("SYS:JS:WS_CONNECTED");
        logSystem("JS", "WS_CONNECTED", "Połączono z bridge.py", { ttlMs: MESSAGE_TTL_MS.SYS_DEFAULT });
        clearMessage("JS", "WS_DISCONNECTED");
        clearMessage("JS", "WS_ERROR");
        clearMessage("PY", "SERIAL_LOST");
    };

    socket.onmessage = (event) => {
        parseIncomingData(event.data);
        if (event.data.includes("AUTO-SKAN ZAKOŃCZONY")) {
            setDtcScanButtonLoading(false);
            updateStatus("AUTO-SKAN ZAKOŃCZONY", "var(--green)");
        }
    };

    socket.onclose = () => {
        setDtcScanButtonLoading(false);
        updateStatus("UTRACO_POŁĄCZENIE Z PYTHONEM", "var(--red)");
        logError("JS", "WS_DISCONNECTED", "Brak połączenia z bridge.py", { ttlMs: MESSAGE_TTL_MS.ERR_WS_DISCONNECTED });
        setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = () => {
        logError("JS", "WS_ERROR", "Błąd gniazda WebSocket", { ttlMs: 20000 });
    };
}
