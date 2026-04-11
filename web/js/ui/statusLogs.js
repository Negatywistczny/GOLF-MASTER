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

function rowClassFor(kind, src) {
    if (kind === "SYS") return "msg-row-system";
    if (src.toUpperCase() === "JS") return "msg-row-js";
    if (src.toUpperCase() === "PY") return "msg-row-py";
    return "msg-row-hw";
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

    if (errorRegistry[key]) {
        const existing = errorRegistry[key];
        existing.lastSeenMs = now;
        existing.desc = normalizedDesc || existing.desc;
        if (Object.prototype.hasOwnProperty.call(options, "ttlMs")) {
            existing.ttlMs = ttlMs;
        }
        existing.row.cells[2].textContent = existing.desc;
        tableBody.prepend(existing.row); // Powrót komunikatu = skok na górę.
        setRowState(existing, now);
    } else {
        const row = tableBody.insertRow(0); // Nowe wpisy na górze.
        row.className = rowClassFor(kind, normalizedSrc);
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
