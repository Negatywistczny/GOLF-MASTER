import { FRAME_SIGNAL_COLOR_OVERRIDES } from "./modalColorOverrides.js";

const COLOR_CLASS_BY_TAG = Object.freeze({
    missing: "m-value--missing",
    error: "m-value--error",
    enabled: "m-value--enabled",
    info: "m-value--info",
    warning: "m-value--warning",
    idle: "m-value--idle"
});

/** Jednolity format ID ramki jak w `modalColorOverrides` (np. `0x151`). */
function normalizeModalFrameId(frameId) {
    const s = String(frameId ?? "").trim().toLowerCase();
    if (!s) return "";
    if (s.startsWith("0x")) return s;
    const n = Number.parseInt(s, 16);
    if (!Number.isNaN(n)) return `0x${n.toString(16)}`;
    return s;
}

function normalizeStatusText(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function getModalValueClass(displayVal) {
    const text = normalizeStatusText(displayVal);

    const idleOkPhrases = [
        "brak zderzenia", "brak dachowania", "brak bled", "brak interwencji", "brak zadania", "brak zezwolenia",
        "brak redukcji", "brak wybudzania", "brak ostrzezenia", "brak zmiany", "brak akcji"
    ];
    if (idleOkPhrases.some((phrase) => text.includes(phrase))) return "m-value--idle";

    if (text === "brak") return "m-value--idle";

    const errorKeywords = ["blad", "error", "fault", "awaria", "usterka", "uszkod", "wykryto", "zderzen", "dachowani"];
    if (errorKeywords.some((keyword) => text.includes(keyword))) return "m-value--error";

    const warningKeywords = ["ostrzez", "warning", "uwaga", "caution", "przekroczono"];
    if (warningKeywords.some((keyword) => text.includes(keyword))) return "m-value--warning";

    const missingExactValues = new Set(["--", "---", "n/a", "nd", "unknown"]);
    if (missingExactValues.has(text)) return "m-value--missing";

    const missingKeywords = ["niezn", "niedostep", "brak danych"];
    if (missingKeywords.some((keyword) => text.includes(keyword))) return "m-value--missing";

    const idleKeywords = ["wylacz", "off", "dezaktyw", "nieaktywn", "standby", "sleep"];
    if (idleKeywords.some((keyword) => text.includes(keyword))) return "m-value--idle";

    const enabledKeywords = ["wlacz", "enabled", "on", "aktywn", "active"];
    if (enabledKeywords.some((keyword) => text.includes(keyword))) return "m-value--enabled";

    return "m-value--info";
}

function stateTagForRaw(stateTags, rawValue) {
    if (!stateTags) return null;
    const candidates = [rawValue, String(rawValue)];
    if (typeof rawValue === "number" && Number.isInteger(rawValue)) {
        candidates.push(String(rawValue));
    }
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
        candidates.push(Math.round(rawValue * 100));
        candidates.push(String(Math.round(rawValue * 100)));
        candidates.push(Math.round(rawValue * 100) / 100);
        candidates.push(Math.round(rawValue * 10) / 10);
    }
    for (const c of candidates) {
        if (c === undefined || c === null) continue;
        if (Object.prototype.hasOwnProperty.call(stateTags, c)) return stateTags[c];
    }
    return null;
}

function getOverrideTag(frameId, signalKey, rawValue, displayVal) {
    const canonId = normalizeModalFrameId(frameId);
    const frameRules = FRAME_SIGNAL_COLOR_OVERRIDES[canonId];
    if (!frameRules) return null;
    const signalRules = frameRules[signalKey];
    if (!signalRules) return null;

    const normalizedDisplay = normalizeStatusText(displayVal);
    const candidates = [rawValue, String(rawValue), displayVal, normalizedDisplay];
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
        candidates.push(Math.round(rawValue * 100));
        candidates.push(String(Math.round(rawValue * 100)));
    }

    for (const candidate of candidates) {
        if (candidate === undefined || candidate === null) continue;
        if (!(candidate in signalRules)) continue;
        return signalRules[candidate];
    }
    return null;
}

function tagToClass(tag) {
    return COLOR_CLASS_BY_TAG[tag] || "m-value--info";
}

/**
 * @param {string} frameId - ID ramki (np. `0x151` lub `151`)
 * @param {string} signalKey
 * @param {number|string} rawValue
 * @param {string} displayVal
 * @param {object} [meta] - m.in. opcjonalne `stateTags` (mapa surowej wartości → tag jak w override)
 */
function getResolvedModalValueClass(frameId, signalKey, rawValue, displayVal, meta) {
    const overrideTag = getOverrideTag(frameId, signalKey, rawValue, displayVal);
    if (overrideTag) return tagToClass(overrideTag);

    const metaTag = stateTagForRaw(meta?.stateTags, rawValue);
    if (metaTag) return tagToClass(metaTag);

    return getModalValueClass(displayVal);
}

export { FRAME_SIGNAL_COLOR_OVERRIDES, getResolvedModalValueClass, normalizeModalFrameId };
