export { signalMeta } from "./signalMeta.js";
export {
    activeCards,
    errorRegistry,
    frameDataCache,
    terminalBuffer,
    dtcScanRegistry,
    dtcScanState,
    TERMINAL_MAX_LINES,
    frameLastSeenMs,
    getSocket,
    setSocket,
    getCachedFrameHex,
    getCachedFrameBigInt,
    setCachedFrame,
    markFrameSeen,
    getFrameLastSeenMs,
    isFrameFresh
} from "./runtimeState.js";
