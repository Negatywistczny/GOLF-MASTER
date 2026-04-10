import {
    activeCards,
    getCachedFrameHex,
    setCachedFrame
} from "../state/runtimeState.js";
import { canDictionary, decoderRouter } from "../can/frameRegistry.js";
import { parseHexToBigInt } from "../shared/canUtils.js";
import { openModal } from "./modal.js";

const __setInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML").set;

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

function decodeSpecificFrame(id, hexData, cardElement) {
    const valElement = cardElement.querySelector(".val");
    if (getCachedFrameHex() !== hexData) {
        setCachedFrame(hexData, parseHexToBigInt(hexData));
    }

    if (valElement && !valElement.hasAttribute("data-decoded")) {
        valElement.textContent = hexData;
        valElement.style.fontSize = "1.2em";
    }
    const decoder = decoderRouter[id];
    if (decoder) decoder(id, hexData, cardElement);
}

function handleCANFrame(id, data) {
    let card = activeCards[id];
    if (!card) {
        card = createDynamicCard(id);
        activeCards[id] = card;
    }

    decodeSpecificFrame(id, data, card);
}

export { handleCANFrame, createDynamicCard, decodeSpecificFrame };
