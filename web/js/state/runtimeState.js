const activeCards = Object.create(null);
const errorRegistry = Object.create(null);
const frameDataCache = Object.create(null);
const terminalBuffer = [];
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

export { activeCards, errorRegistry, frameDataCache, terminalBuffer, TERMINAL_MAX_LINES, getSocket, setSocket, getCachedFrameHex, getCachedFrameBigInt, setCachedFrame };
