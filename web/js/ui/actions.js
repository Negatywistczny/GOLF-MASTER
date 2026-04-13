import { signalMeta, frameDataCache } from "../state/index.js";
import { canDictionary } from "../can/frameRegistry.js";
import { formatSignalValue } from "../shared/canUtils.js";
import { updateStatus } from "./statusLogs.js";

function isSummaryKey(key) {
    return typeof key === "string" && key.includes("_SUMMARY_");
}

function compareSnapshotSignalKeys(a, b) {
    const aSummary = isSummaryKey(a);
    const bSummary = isSummaryKey(b);
    if (aSummary !== bSummary) return aSummary ? -1 : 1;
    return a.localeCompare(b);
}

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
        const sortedSignals = Object.keys(frameData).sort(compareSnapshotSignalKeys);

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

export { generateSnapshot, downloadTerminalLogs };
