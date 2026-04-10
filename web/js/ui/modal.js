import { signalMeta, frameDataCache } from "../state/index.js";
import { canDictionary } from "../can/frameRegistry.js";
import { formatSignalValue } from "../shared/canUtils.js";
import { getResolvedModalValueClass, normalizeModalFrameId } from "./modalColors/modalColorRules.js";

let activeModalFrameIdNorm = null;
let activeModalFrameIdRaw = null;

function setupModal() {
    const modal = document.getElementById("info-modal");
    const close = document.querySelector(".close-btn");

    const dismiss = () => {
        modal.classList.remove("show");
        activeModalFrameIdNorm = null;
        activeModalFrameIdRaw = null;
    };

    close.onclick = dismiss;
    window.onclick = (e) => {
        if (e.target == modal) dismiss();
    };
}

function buildModalTablesHtml(id, data) {
    const entries = Object.entries(data);
    const midIndex = Math.ceil(entries.length / 2);
    const leftData = entries.slice(0, midIndex);
    const rightData = entries.slice(midIndex);

    const buildTableHtml = (dataChunk) => {
        let tableHtml = `<table class="m-table">
            <thead>
                <tr>
                    <th>PARAMETR</th>
                    <th style="text-align:right">WARTOŚĆ</th>
                </tr>
            </thead>
            <tbody>`;

        for (const [key, value] of dataChunk) {
            const meta = signalMeta[key] || { label: key, unit: "" };
            const displayVal = formatSignalValue(meta, value);
            const valueClass = getResolvedModalValueClass(id, key, value, displayVal, meta);

            tableHtml += `<tr>
                <td>
                    <span class="m-label">${meta.label}</span>
                    <span class="m-id">${key}</span>
                </td>
                <td class="m-value ${valueClass}">${displayVal}</td>
            </tr>`;
        }
        tableHtml += `</tbody></table>`;
        return tableHtml;
    };

    return `
        <div class="modal-grid-container">
            <div class="modal-col">${buildTableHtml(leftData)}</div>
            <div class="modal-col">${buildTableHtml(rightData)}</div>
        </div>
    `;
}

function renderModalContent(id) {
    const cleanId = id.replace("0x", "");
    const def = canDictionary["0x" + cleanId] || { name: `RAMKA ${id}` };
    const data = frameDataCache["0x" + cleanId] || frameDataCache[id];

    document.getElementById("modal-title").textContent = `[0x${cleanId}] ${def.name}`;
    const body = document.getElementById("modal-body");

    if (!data) {
        body.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-dim);">Oczekiwanie na dane...</p>`;
        return;
    }

    body.innerHTML = buildModalTablesHtml(id, data);
}

function openModal(id) {
    const modal = document.getElementById("info-modal");
    activeModalFrameIdNorm = normalizeModalFrameId(id);
    activeModalFrameIdRaw = id;
    renderModalContent(id);
    modal.classList.add("show");
}

function notifyModalFrameUpdated(frameId) {
    const modal = document.getElementById("info-modal");
    if (!modal?.classList.contains("show") || activeModalFrameIdNorm == null) return;
    if (normalizeModalFrameId(frameId) !== activeModalFrameIdNorm) return;
    renderModalContent(activeModalFrameIdRaw);
}

export { setupModal, openModal, notifyModalFrameUpdated };
