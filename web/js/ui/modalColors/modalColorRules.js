import { signalMeta } from "../../state/signalMeta.js";
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

    const errorKeywords = ["blad", "error", "fault", "awaria", "usterka", "uszkod"];
    if (errorKeywords.some((keyword) => text.includes(keyword))) return "m-value--error";

    const warningKeywords = ["ostrzez", "warning", "uwaga", "caution"];
    if (warningKeywords.some((keyword) => text.includes(keyword))) return "m-value--warning";

    const infoAbsencePhrases = [
        "brak bled", "brak interwencji", "brak zadania", "brak zezwolenia", "brak redukcji",
        "brak wybudzania", "brak ostrzezenia", "brak zderzenia", "brak zmiany", "brak akcji"
    ];
    if (infoAbsencePhrases.some((phrase) => text.includes(phrase))) return "m-value--info";

    const missingExactValues = new Set(["brak", "--", "---", "n/a", "nd", "unknown"]);
    if (missingExactValues.has(text)) return "m-value--missing";

    const missingKeywords = ["niezn", "niedostep", "brak danych"];
    if (missingKeywords.some((keyword) => text.includes(keyword))) return "m-value--missing";

    const idleKeywords = ["wylacz", "off", "dezaktyw", "nieaktywn", "standby", "sleep"];
    if (idleKeywords.some((keyword) => text.includes(keyword))) return "m-value--idle";

    const enabledKeywords = ["wlacz", "enabled", "on", "aktywn", "active"];
    if (enabledKeywords.some((keyword) => text.includes(keyword))) return "m-value--enabled";

    return "m-value--info";
}

function stateTextForRaw(states, rawValue) {
    if (!states) return null;
    const candidates = [rawValue, String(rawValue)];
    if (typeof rawValue === "number" && Number.isInteger(rawValue)) {
        candidates.push(String(rawValue));
    }
    for (const c of candidates) {
        if (c === undefined || c === null) continue;
        if (Object.prototype.hasOwnProperty.call(states, c)) return states[c];
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

    for (const candidate of candidates) {
        if (candidate === undefined || candidate === null) continue;
        if (!(candidate in signalRules)) continue;
        return signalRules[candidate];
    }
    return null;
}

function getBaseTagFromSignalMeta(signalKey, rawValue) {
    const states = signalMeta[signalKey]?.states;
    const text = stateTextForRaw(states, rawValue);
    if (text == null) return null;
    return getModalValueClass(text).replace("m-value--", "");
}

function tagToClass(tag) {
    return COLOR_CLASS_BY_TAG[tag] || "m-value--info";
}

/**
 * @param {string} frameId - ID ramki (np. `0x151` lub `151`)
 * @param {string} signalKey
 * @param {number|string} rawValue
 * @param {string} displayVal
 * @param {object} [_meta] - rezerwa (np. rozszerzenia bez `states`)
 */
function getResolvedModalValueClass(frameId, signalKey, rawValue, displayVal, _meta) {
    void _meta;
    const overrideTag = getOverrideTag(frameId, signalKey, rawValue, displayVal);
    if (overrideTag) return tagToClass(overrideTag);

    const baseTag = getBaseTagFromSignalMeta(signalKey, rawValue);
    if (baseTag) return tagToClass(baseTag);

    return getModalValueClass(displayVal);
}

export { FRAME_SIGNAL_COLOR_OVERRIDES, getResolvedModalValueClass, normalizeModalFrameId };
