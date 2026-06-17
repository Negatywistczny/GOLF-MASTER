import { initBtTerminalControls } from "./transport/btTerminal.js";
import {
    setupModal,
    startClock,
    startMessageRegistryTicker,
    generateSnapshot,
    downloadTerminalLogs,
    initEsp32RuntimePanel
} from "../ui/index.js";

document.addEventListener("DOMContentLoaded", () => {
    initEsp32RuntimePanel();
    initBtTerminalControls();
    startClock();
    startMessageRegistryTicker();
    setupModal();

    const btnSnapshot = document.getElementById("btn-snapshot");
    if (btnSnapshot) {
        btnSnapshot.addEventListener("click", generateSnapshot);
    }

    const btnDownloadLogs = document.getElementById("btn-download-logs");
    if (btnDownloadLogs) {
        btnDownloadLogs.addEventListener("click", downloadTerminalLogs);
    }
});
