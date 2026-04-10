import { connectWebSocket } from "./ws.js";
import { setupModal, startClock, generateSnapshot, requestFullDtcScan, downloadTerminalLogs } from "./ui.js";

document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    startClock();
    setupModal();

    const btnSnapshot = document.getElementById('btn-snapshot');
    if (btnSnapshot) {
        btnSnapshot.addEventListener('click', generateSnapshot);
    }

    const btnScanAll = document.getElementById('btn-scan-all');
    if (btnScanAll) {
        btnScanAll.addEventListener('click', requestFullDtcScan);
    }

    const btnDownloadLogs = document.getElementById('btn-download-logs');
    if (btnDownloadLogs) {
        btnDownloadLogs.addEventListener('click', downloadTerminalLogs);
    }
});
