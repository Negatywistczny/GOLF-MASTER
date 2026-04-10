import { WS_URL } from "./config.js";
import { setSocket } from "./state.js";
import { handleCANFrame, logError, logTerminal, updateStatus } from "./ui.js";

function parseIncomingData(raw) {
    // 1. Zawsze loguj do terminala
    logTerminal(raw);

    // 2. Obsługa Błędów (ERR:SRC:CODE)
    if (raw.startsWith("ERR:")) {
        const [_, src, code] = raw.split(":");
        logError(src, code, "Wykryto błąd warstwy " + src);
        return;
    }

    // 3. Obsługa Systemu (SYS:SRC:CODE)
    if (raw.startsWith("SYS:")) {
        const [_, src, code] = raw.split(":");
        updateStatus(`${src}: ${code}`, "var(--accent)");
        return;
    }

    // 4. Obsługa Ramek CAN (ID:DATA1 DATA2...)
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
    };

    socket.onmessage = (event) => {
        parseIncomingData(event.data);
        // Odblokowanie przycisku gdy Python zakończy skanowanie
        if (event.data.includes("AUTO-SKAN ZAKOŃCZONY")) {
            const btnScan = document.getElementById('btn-scan-all');
            if (btnScan) {
                btnScan.disabled = false;
                btnScan.style.opacity = "1";
                btnScan.textContent = "🛠️ AUTO-SKAN DTC";
            }
            updateStatus("AUTO-SKAN ZAKOŃCZONY", "var(--green)");
        }
    };

    socket.onclose = () => {
        updateStatus("UTRACO_POŁĄCZENIE Z PYTHONEM", "var(--red)");
        logError("JS", "WS_DISCONNECTED", "Brak połączenia z bridge.py");
        setTimeout(connectWebSocket, 3000); // Autoreconnect
    };

    socket.onerror = () => {
        logError("JS", "WS_ERROR", "Błąd gniazda WebSocket");
    };
}
