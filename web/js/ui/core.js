import {
    activeCards,
    getCachedFrameHex,
    setCachedFrame,
    markFrameSeen
} from "../state/index.js";
import { canDictionary, decoderRouter } from "../can/frameRegistry.js";
import { parseHexToBigInt } from "../shared/canUtils.js";
import { openModal, notifyModalFrameUpdated } from "./modal.js";

// WebKit: własny deskryptor `innerHTML` jest na HTMLElement, nie na Element.
const _innerHTMLDesc =
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, "innerHTML") ||
    Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
const __setInnerHTML = _innerHTMLDesc?.set;

/** Jednolite 0x… (wielkie A–F), żeby ten sam ID z magistrali nie tworzył kilku wpisów w activeCards. */
function canonicalFrameId(id) {
    const s = String(id).trim();
    if (!s) return s;
    const n = Number.parseInt(s, 16);
    if (Number.isNaN(n)) return s;
    return `0x${n.toString(16).toUpperCase()}`;
}

function normalizeFrameIdToNumber(id) {
    if (typeof id !== "string") return Number.MAX_SAFE_INTEGER;
    const trimmed = id.trim().toLowerCase();
    if (trimmed.startsWith("0x")) {
        const parsedHex = Number.parseInt(trimmed, 16);
        return Number.isNaN(parsedHex) ? Number.MAX_SAFE_INTEGER : parsedHex;
    }
    const parsedDec = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsedDec) ? Number.MAX_SAFE_INTEGER : parsedDec;
}

function insertCardSortedById(container, card, id) {
    const currentIdNum = normalizeFrameIdToNumber(id);
    const existingCards = container.querySelectorAll(".card");

    for (const existingCard of existingCards) {
        const existingId = existingCard.id.startsWith("c-")
            ? existingCard.id.slice(2)
            : existingCard.id;
        const existingIdNum = normalizeFrameIdToNumber(existingId);

        if (currentIdNum < existingIdNum) {
            container.insertBefore(card, existingCard);
            return;
        }
    }

    container.appendChild(card);
}

function enableInnerHTMLDiffing(el) {
    if (!el || el._diffingEnabled) return;
    if (!__setInnerHTML) {
        el._diffingEnabled = true;
        return;
    }
    let currentValue = "";
    Object.defineProperty(el, "innerHTML", {
        configurable: true,
        get() {
            return currentValue;
        },
        set(nextValue) {
            if (nextValue === currentValue) return;
            currentValue = nextValue;
            __setInnerHTML.call(this, nextValue);
        }
    });
    el._diffingEnabled = true;
}

function createDynamicCard(id) {
    const def = canDictionary[id] || { name: `NIEZNANY ${id}`, zone: "nieznane" };
    const gridId = `grid-${def.zone}`;
    const container = document.getElementById(gridId) || document.getElementById("grid-nieznane");

    const card = document.createElement("div");
    card.className = "card";
    card.id = `c-${id}`;

    card.innerHTML = `
    <div class="id-label">${id}</div> <h2>${def.name}</h2>
    <span class="val">-- -- --</span>
    <div class="grid"></div>
    `;
    card._valEl = card.querySelector(".val");
    card._gridEl = card.querySelector(".grid");
    enableInnerHTMLDiffing(card._gridEl);
    const nativeQuerySelector = card.querySelector.bind(card);
    card.querySelector = (selector) => {
        if (selector === ".val") return card._valEl;
        if (selector === ".grid") return card._gridEl;
        return nativeQuerySelector(selector);
    };

    card.addEventListener("click", () => openModal(id));
    insertCardSortedById(container, card, id);
    return card;
}

/** Jedna pełna animacja na raz — kolejne ramki w trakcie nie przerywają (brak resetu keyframes przy szybkim strumieniu). */
function flashCardFrameUpdate(card) {
    if (!card || card._frameFlashActive) return;
    card._frameFlashActive = true;
    card.classList.add("card-frame-flash");
    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(tid);
        card.removeEventListener("animationend", onEnd);
        card.classList.remove("card-frame-flash");
        card._frameFlashActive = false;
    };
    const onEnd = (e) => {
        if (e.target !== card || e.animationName !== "card-frame-flash-kf") return;
        finish();
    };
    const tid = setTimeout(finish, 480);
    card.addEventListener("animationend", onEnd);
}

function decodeSpecificFrame(id, hexData, cardElement) {
    const valElement = cardElement.querySelector(".val");
    markFrameSeen(id);
    if (getCachedFrameHex() !== hexData) {
        setCachedFrame(hexData, parseHexToBigInt(hexData));
    }

    if (valElement && !valElement.hasAttribute("data-decoded")) {
        valElement.textContent = hexData;
        valElement.style.fontSize = "1.2em";
    }
    const decoder = decoderRouter[id];
    if (decoder) decoder(id, hexData, cardElement);
    notifyModalFrameUpdated(id);
}

function handleCANFrame(id, data) {
    const idKey = canonicalFrameId(id);
    let card = activeCards[idKey];
    if (!card) {
        card = createDynamicCard(idKey);
        activeCards[idKey] = card;
    }

    /* Błysk przy każdym odebraniu ramki; kolejne w czasie trwania animacji ją nie przerywają. */
    flashCardFrameUpdate(card);

    decodeSpecificFrame(idKey, data, card);
}

export { handleCANFrame, createDynamicCard, decodeSpecificFrame };
