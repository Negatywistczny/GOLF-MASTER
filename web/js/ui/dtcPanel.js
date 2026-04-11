import { dtcScanRegistry, dtcScanState } from "../state/index.js";

function _statusLabel(status) {
    if (status === "ok") return "DTC WYKRYTE";
    if (status === "clean") return "CZYSTY";
    if (status === "comm_error") return "BRAK KOMUNIKACJI";
    return status || "N/A";
}

function _statusClass(status) {
    if (status === "ok") return "dtc-status-warning";
    if (status === "clean") return "dtc-status-ok";
    if (status === "comm_error") return "dtc-status-error";
    return "dtc-status-idle";
}

function _setSummary(text) {
    const el = document.getElementById("dtc-scan-summary");
    if (el) {
        el.textContent = text;
    }
}

function _renderRows() {
    const tbody = document.getElementById("dtc-scan-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const rows = Object.values(dtcScanRegistry).sort((a, b) => a.index - b.index);
    for (const row of rows) {
        const tr = document.createElement("tr");
        const details = row.errors && row.errors.length
            ? row.errors.map((e) => `${e.protocol}:${e.code}`).join(", ")
            : (row.dtcCount > 0 ? row.dtcs.map((d) => d.code).slice(0, 3).join(", ") : "—");

        tr.innerHTML = `
            <td>${row.module.addr}</td>
            <td>${row.module.name}</td>
            <td>${row.protocol || "N/A"}</td>
            <td class="${_statusClass(row.status)}">${_statusLabel(row.status)}</td>
            <td>${row.dtcCount ?? 0}</td>
            <td title="${details}">${details}</td>
        `;
        tbody.appendChild(tr);
    }
}

function _updateSummaryFromState() {
    _setSummary(
        `Scan: ${dtcScanState.status.toUpperCase()} | Moduły: ${dtcScanState.moduleDone}/${dtcScanState.moduleTotal} | ` +
        `DTC moduły: ${dtcScanState.modulesWithDtc} | DTC łącznie: ${dtcScanState.totalDtcs} | Błędy komunikacji: ${dtcScanState.moduleErrors}`
    );
}

function handleDtcScanEvent(event, payload) {
    if (event === "start") {
        Object.keys(dtcScanRegistry).forEach((k) => delete dtcScanRegistry[k]);
        dtcScanState.scanId = payload.scanId || null;
        dtcScanState.startedAt = payload.startedAt || Date.now();
        dtcScanState.status = "running";
        dtcScanState.moduleTotal = payload.moduleTotal || 0;
        dtcScanState.moduleDone = 0;
        dtcScanState.moduleErrors = 0;
        dtcScanState.modulesWithDtc = 0;
        dtcScanState.totalDtcs = 0;
        _updateSummaryFromState();
        _renderRows();
        return;
    }

    if (event === "progress") {
        if (typeof payload.index === "number") {
            _setSummary(`Scan: RUNNING | Moduł ${payload.index}/${payload.total} | ${payload.module.name} (${payload.protocol})`);
        }
        return;
    }

    if (event === "module_result") {
        const key = payload.module?.addr || `row_${payload.index}`;
        dtcScanRegistry[key] = payload;
        dtcScanState.moduleDone += 1;
        if (payload.status === "comm_error") dtcScanState.moduleErrors += 1;
        if ((payload.dtcCount || 0) > 0) dtcScanState.modulesWithDtc += 1;
        dtcScanState.totalDtcs += payload.dtcCount || 0;
        _updateSummaryFromState();
        _renderRows();
        return;
    }

    if (event === "complete") {
        dtcScanState.status = "done";
        dtcScanState.moduleErrors = payload.moduleErrors || 0;
        dtcScanState.modulesWithDtc = payload.modulesWithDtc || 0;
        dtcScanState.totalDtcs = payload.totalDtcs || 0;
        _updateSummaryFromState();
        return;
    }

    if (event === "error") {
        dtcScanState.status = "error";
        _setSummary(`Scan: ERROR | ${payload.errorCode || "scan_error"} | ${payload.message || "Brak szczegółów"}`);
    }
}

export { handleDtcScanEvent };
