const activeCards = Object.create(null);
const errorRegistry = Object.create(null);
const frameDataCache = Object.create(null);
const frameLastSeenMs = Object.create(null);
const terminalBuffer = [];
const dtcScanRegistry = Object.create(null);
const dtcScanState = {
    scanId: null,
    startedAt: null,
    status: "idle",
    moduleTotal: 0,
    moduleDone: 0,
    moduleErrors: 0,
    modulesWithDtc: 0,
    totalDtcs: 0
};
const TERMINAL_MAX_LINES = 3000;

let socket = null;
let __cachedFrameHex = null;
let __cachedFrameBigInt = 0n;

function getSocket() {
    return socket;
}

function setSocket(nextSocket) {
    socket = nextSocket;
}

function getCachedFrameHex() {
    return __cachedFrameHex;
}

function getCachedFrameBigInt() {
    return __cachedFrameBigInt;
}

function setCachedFrame(hex, dataBigInt) {
    __cachedFrameHex = hex;
    __cachedFrameBigInt = dataBigInt;
}

function normalizeFrameIdKey(id) {
    const s = String(id || "").trim();
    if (!s) return s;
    const n = Number.parseInt(s, 16);
    if (Number.isNaN(n)) return s;
    return `0x${n.toString(16).toUpperCase()}`;
}

function markFrameSeen(id, nowMs = Date.now()) {
    const key = normalizeFrameIdKey(id);
    if (!key) return;
    frameLastSeenMs[key] = nowMs;
}

function getFrameLastSeenMs(id) {
    const key = normalizeFrameIdKey(id);
    if (!key) return null;
    const seenMs = frameLastSeenMs[key];
    return typeof seenMs === "number" ? seenMs : null;
}

function isFrameFresh(id, maxAgeMs, nowMs = Date.now()) {
    const seenMs = getFrameLastSeenMs(id);
    if (seenMs === null) return false;
    return nowMs - seenMs <= maxAgeMs;
}

export {
    activeCards,
    errorRegistry,
    frameDataCache,
    frameLastSeenMs,
    terminalBuffer,
    dtcScanRegistry,
    dtcScanState,
    TERMINAL_MAX_LINES,
    getSocket,
    setSocket,
    getCachedFrameHex,
    getCachedFrameBigInt,
    setCachedFrame,
    markFrameSeen,
    getFrameLastSeenMs,
    isFrameFresh
};
