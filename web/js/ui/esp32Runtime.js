const RUNTIME_CARD_ID = "esp32-runtime-card";

const runtimeState = {
    twaiState: "—",
    busSleepHint: "—",
    lastCanActivityMs: 0,
    buildId: "—",
    relays: { acc: "—", ill: "—", back: "—" }
};

let runtimeTickerStarted = false;

function formatAge(ms) {
    if (!ms || ms <= 0) return "brak ramek";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return remain === 0 ? `${minutes}m` : `${minutes}m ${remain}s`;
}

function relayClass(state) {
    if (state === "ON") return "active-green";
    if (state === "OFF") return "";
    return "";
}

function renderRuntimePanel() {
    const card = document.getElementById(RUNTIME_CARD_ID);
    if (!card) return;

    const grid = card.querySelector(".grid");
    if (!grid) return;

    const ageMs = runtimeState.lastCanActivityMs
        ? Date.now() - runtimeState.lastCanActivityMs
        : 0;

    grid.innerHTML = `
        <div class="ind active-blue full-width">TWAI: ${runtimeState.twaiState}</div>
        <div class="ind full-width">BUS: ${runtimeState.busSleepHint}</div>
        <div class="ind full-width">CAN: ${formatAge(ageMs)} temu</div>
        <div class="ind ${relayClass(runtimeState.relays.acc)}">ACC ${runtimeState.relays.acc}</div>
        <div class="ind ${relayClass(runtimeState.relays.ill)}">ILL ${runtimeState.relays.ill}</div>
        <div class="ind ${relayClass(runtimeState.relays.back)}">BACK ${runtimeState.relays.back}</div>
        <div class="ind full-width">BUILD: ${runtimeState.buildId}</div>
    `;
}

function markCanActivity() {
    runtimeState.lastCanActivityMs = Date.now();
    if (runtimeState.busSleepHint === "LIGHT_SLEEP" || runtimeState.busSleepHint === "IDLE") {
        runtimeState.busSleepHint = "AKTYWNA";
    }
    renderRuntimePanel();
}

function updateRelayFromCan(id, hexData) {
    const parts = String(hexData || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return;

    const b0 = parseInt(parts[0], 16);
    if (Number.isNaN(b0)) return;

    if (id === "0x2C3" && (b0 & 0x02) !== 0) {
        runtimeState.relays.acc = "ON";
    } else if (id === "0x635") {
        const displayPercent = b0 & 0x7f;
        const displayFault = (b0 & 0x80) !== 0;
        runtimeState.relays.ill = (!displayFault && displayPercent > 0) ? "ON" : "OFF";
    } else if (id === "0x531" && (b0 & 0x20) !== 0) {
        runtimeState.relays.back = "ON";
    }
    renderRuntimePanel();
}

function updateEsp32RuntimeFromMessage(kind, messageKey, details) {
    switch (messageKey) {
        case "HW:TWAI:RECOVERING":
            runtimeState.twaiState = "RECOVERING";
            break;
        case "HW:TWAI:RUNNING":
            runtimeState.twaiState = "RUNNING";
            break;
        case "HW:TWAI:BUS_OFF":
            runtimeState.twaiState = "BUS_OFF";
            break;
        case "CAN:WAKE_START":
            runtimeState.busSleepHint = "WAKE_ACTIVE";
            break;
        case "CAN:WAKE_END":
            runtimeState.busSleepHint = "WAKE_END";
            break;
        case "CAN:SLEEP_IND":
            runtimeState.busSleepHint = "SLEEP_IND";
            break;
        case "CAN:IDLE_SHUTDOWN":
            runtimeState.busSleepHint = "IDLE";
            runtimeState.relays = { acc: "OFF", ill: "OFF", back: "OFF" };
            break;
        case "HW:LIGHT_SLEEP_ENTER":
            runtimeState.busSleepHint = "LIGHT_SLEEP";
            runtimeState.relays = { acc: "OFF", ill: "OFF", back: "OFF" };
            break;
        case "HW:LIGHT_SLEEP_WAKE":
            runtimeState.busSleepHint = "AWAKE";
            runtimeState.lastCanActivityMs = Date.now();
            break;
        case "RELAY_ILL:OFF_BY_CAN_IDLE":
            runtimeState.relays.ill = "OFF";
            break;
        case "RELAYS:FORCED_OFF_BY_SILENCE":
            runtimeState.relays = { acc: "OFF", ill: "OFF", back: "OFF" };
            break;
        case "FW:BUILD_ID":
            runtimeState.buildId = details || "—";
            break;
        case "CAN:NM_MODE_AUTO":
            runtimeState.busSleepHint = runtimeState.busSleepHint === "—" ? "NM_AUTO" : runtimeState.busSleepHint;
            break;
        default:
            if (kind === "ERR" && messageKey.startsWith("HW:TWAI:")) {
                runtimeState.twaiState = details || messageKey.split(":").pop();
            }
            break;
    }
    renderRuntimePanel();
}

function startRuntimeTicker() {
    if (runtimeTickerStarted) return;
    runtimeTickerStarted = true;
    setInterval(renderRuntimePanel, 1000);
}

export function initEsp32RuntimePanel() {
    const container = document.getElementById("grid-system");
    if (!container || document.getElementById(RUNTIME_CARD_ID)) return;

    const card = document.createElement("div");
    card.className = "card runtime-card";
    card.id = RUNTIME_CARD_ID;
    card.innerHTML = `
        <div class="id-label">ESP32</div>
        <h2>ESP32 RUNTIME</h2>
        <span class="val hidden-val" data-decoded="true">—</span>
        <div class="grid"></div>
    `;
    container.prepend(card);
    renderRuntimePanel();
    startRuntimeTicker();
}

export { markCanActivity, updateRelayFromCan, updateEsp32RuntimeFromMessage };
