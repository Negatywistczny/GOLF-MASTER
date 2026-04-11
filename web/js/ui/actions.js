import { signalMeta, frameDataCache, getSocket } from "../state/index.js";
import { canDictionary } from "../can/frameRegistry.js";
import { formatSignalValue } from "../shared/canUtils.js";
import { logError, logTerminal, updateStatus } from "./statusLogs.js";

function formatLocalFileTimestamp(date = new Date()) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}`;
}

function generateSnapshot() {
    let csvContent = "ID RAMKI;NAZWA RAMKI;SYGNAŁ (ID);OPIS SYGNAŁU;WARTOŚĆ\n";
    const sortedIds = Object.keys(frameDataCache).sort();

    sortedIds.forEach((id) => {
        const frameName = canDictionary[id] ? canDictionary[id].name : "NIEZNANA RAMKA";
        const frameData = frameDataCache[id];
        const sortedSignals = Object.keys(frameData).sort();

        sortedSignals.forEach((sigKey) => {
            const val = frameData[sigKey];
            const meta = signalMeta[sigKey] || { label: "Brak opisu zdekodowanego", unit: "" };
            const displayVal = formatSignalValue(meta, val);
            const safeLabel = meta.label.replace(/;/g, ",");
            csvContent += `${id};${frameName};${sigKey};${safeLabel};${displayVal}\n`;
        });
    });

    const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = formatLocalFileTimestamp();

    link.setAttribute("href", url);
    link.setAttribute("download", `PQ35_CAN_SNAPSHOT_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    updateStatus("SNAPSHOT ZAPISANY DO PLIKU", "var(--accent)");
}

function requestFullDtcScan() {
    const socket = getSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send("CMD:REQ_FULL_SCAN");
        logTerminal("SYS:JS: Inicjowanie pełnego Auto-Skanu DTC...");
        updateStatus("SKANOWANIE MODUŁÓW (TP 2.0)...", "var(--orange)");
        setDtcScanButtonLoading(true);
    } else {
        logError("JS", "WS_OFFLINE", "Brak połączenia z Pythonem.");
    }
}

function setDtcScanButtonLoading(isLoading) {
    const btnScanAll = document.getElementById("btn-scan-all");
    if (!btnScanAll) return;
    btnScanAll.disabled = !!isLoading;
    btnScanAll.style.opacity = isLoading ? "0.5" : "1";
    btnScanAll.textContent = isLoading ? "⏳ SKANOWANIE..." : "🛠️ SKANUJ DTC";
}

function downloadTerminalLogs() {
    const term = document.getElementById("term-stream");
    if (!term) return;

    let logContent = "=========================================\n";
    logContent += "   GOLF MASTER v50.0 - TERMINAL LOGS\n";
    logContent += `   DATA WYGENEROWANIA: ${new Date().toLocaleString()}\n`;
    logContent += "=========================================\n\n";

    const lines = term.querySelectorAll("div");
    if (lines.length === 0) {
        alert("Terminal jest pusty. Brak logów do zapisu.");
        return;
    }

    lines.forEach((line) => {
        logContent += line.textContent + "\n";
    });

    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const dateStr = formatLocalFileTimestamp();

    link.setAttribute("href", url);
    link.setAttribute("download", `PQ35_TERMINAL_LOG_${dateStr}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    updateStatus("LOGI TERMINALA ZAPISANE DO PLIKU", "var(--green)");
}

export { generateSnapshot, requestFullDtcScan, downloadTerminalLogs, setDtcScanButtonLoading };
