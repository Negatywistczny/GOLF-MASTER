import { errorRegistry, terminalBuffer, TERMINAL_MAX_LINES } from "../state/index.js";

const REGISTRY_TICK_MS = 1000;
let registryTickerStarted = false;

function buildKey(src, code) {
    return `${src}:${code}`;
}

function formatAge(ms) {
    if (ms < 1000) return "teraz";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s temu`;
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return remain === 0 ? `${minutes}m temu` : `${minutes}m ${remain}s temu`;
}

function rowClassFor(kind, toneOrSrc, options = {}) {
    if (options.rowClass) return options.rowClass;
    const tone = options.tone || toneOrSrc;
    if (tone === "error") return "msg-row-error";
    if (tone === "warn") return "msg-row-warn";
    if (tone === "info") return "msg-row-info";
    if (kind === "SYS") return "msg-row-system";
    return "msg-row-error";
}

function terminalClassForLine(msg) {
    if (msg.startsWith("ERR:")) return "term-line-err";
    if (msg.startsWith("SYS:OTA:") || msg.startsWith("SYS:HW:LIGHT_SLEEP") || msg.startsWith("SYS:CAN:IDLE")) {
        return "term-line-warn";
    }
    if (msg.startsWith("SYS:FW:") || msg.startsWith("SYS:HW:TWAI:RUNNING") || msg.startsWith("SYS:CAN:WAKE")) {
        return "term-line-info";
    }
    if (msg.startsWith("SYS:")) return "term-line-sys";
    return "";
}

function setRowState(entry, now) {
    const ageMs = now - entry.lastSeenMs;
    const isStale = Number.isFinite(entry.ttlMs) && entry.ttlMs >= 0 && ageMs > entry.ttlMs;
    entry.row.classList.toggle("msg-stale", isStale);
    entry.row.cells[3].textContent = isStale ? `nieaktywne: ${formatAge(ageMs)}` : formatAge(ageMs);
}

function upsertMessage(kind, src, code, desc, options = {}) {
    const tableBody = document.getElementById("error-table-body");
    if (!tableBody) return;
    const now = Date.now();
    const normalizedSrc = String(src || "UNK").toUpperCase();
    const normalizedCode = String(code || "UNKNOWN");
    const normalizedDesc = String(desc || "");
    const key = buildKey(normalizedSrc, normalizedCode);
    const ttlMs = Object.prototype.hasOwnProperty.call(options, "ttlMs")
        ? options.ttlMs
        : (kind === "SYS" ? 5000 : 15000);
    const tone = options.tone || (kind === "SYS" ? "system" : "error");

    if (errorRegistry[key]) {
        const existing = errorRegistry[key];
        existing.lastSeenMs = now;
        existing.desc = normalizedDesc || existing.desc;
        existing.tone = tone;
        if (Object.prototype.hasOwnProperty.call(options, "ttlMs")) {
            existing.ttlMs = ttlMs;
        }
        existing.row.cells[2].textContent = existing.desc;
        existing.row.className = rowClassFor(kind, tone, { ...options, tone });
        tableBody.prepend(existing.row); // Powrót komunikatu = skok na górę.
        setRowState(existing, now);
    } else {
        const row = tableBody.insertRow(0); // Nowe wpisy na górze.
        row.className = rowClassFor(kind, tone, { ...options, tone });
        row.innerHTML = `
            <td>${normalizedCode}</td>
            <td>${normalizedSrc}</td>
            <td>${normalizedDesc}</td>
            <td>teraz</td>
        `;
        const entry = {
            kind,
            src: normalizedSrc,
            code: normalizedCode,
            desc: normalizedDesc,
            tone,
            row,
            lastSeenMs: now,
            ttlMs
        };
        errorRegistry[key] = entry;
        setRowState(entry, now);
    }
}

function logError(src, code, desc, options = {}) {
    upsertMessage("ERR", src, code, desc, options);
}

function logSystem(src, code, desc, options = {}) {
    upsertMessage("SYS", src, code, desc, options);
}

function clearMessage(src, code) {
    const key = buildKey(src, code);
    const entry = errorRegistry[key];
    if (!entry) return;
    // Umożliwia ręczne wygaszenie komunikatów bez określonego TTL.
    entry.ttlMs = 0;
    entry.lastSeenMs = Date.now() - 2000;
    setRowState(entry, Date.now());
}

function refreshRegistryAges() {
    const now = Date.now();
    for (const key in errorRegistry) {
        setRowState(errorRegistry[key], now);
    }
}

function startMessageRegistryTicker() {
    if (registryTickerStarted) return;
    registryTickerStarted = true;
    setInterval(refreshRegistryAges, REGISTRY_TICK_MS);
}

function logTerminal(msg) {
    const term = document.getElementById("term-stream");
    if (!term) return;

    terminalBuffer.push(msg);
    if (terminalBuffer.length > TERMINAL_MAX_LINES) {
        terminalBuffer.shift();
    }

    const line = document.createElement("div");
    const toneClass = terminalClassForLine(msg);
    if (toneClass) line.className = toneClass;
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, "0")}`;

    line.textContent = `[${timeStr}] ${msg}`;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;

    if (term.children.length > TERMINAL_MAX_LINES) {
        term.removeChild(term.firstElementChild);
    }
}

function updateStatus(text, color) {
    const info = document.getElementById("sim-info");
    if (info) {
        info.textContent = text;
        info.parentElement.style.borderLeftColor = color;
    }
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById("sim-clock").textContent = now.toLocaleTimeString();
    }, 1000);
}

export { logError, logSystem, clearMessage, startMessageRegistryTicker, logTerminal, updateStatus, startClock };
