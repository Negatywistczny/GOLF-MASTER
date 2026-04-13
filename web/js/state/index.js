export { signalMeta } from "./signalMeta.js";
export {
    activeCards,
    errorRegistry,
    frameDataCache,
    terminalBuffer,
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
