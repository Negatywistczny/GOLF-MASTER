import { errorRegistry, terminalBuffer, TERMINAL_MAX_LINES } from "../state/index.js";

function logError(src, code, desc) {
    const key = `${src}:${code}`;
    const tableBody = document.getElementById("error-table-body");

    if (errorRegistry[key]) {
        errorRegistry[key].count++;
        errorRegistry[key].row.cells[3].textContent = errorRegistry[key].count;
    } else {
        const row = tableBody.insertRow(0);
        row.className = `err-row-${src.toLowerCase()}`;
        row.innerHTML = `
            <td>${code}</td>
            <td>${src}</td>
            <td>${desc}</td>
            <td>1</td>
        `;
        errorRegistry[key] = { count: 1, row: row };
    }
}

function logTerminal(msg) {
    const term = document.getElementById("term-stream");
    if (!term) return;

    terminalBuffer.push(msg);
    if (terminalBuffer.length > TERMINAL_MAX_LINES) {
        terminalBuffer.shift();
    }

    const line = document.createElement("div");
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, "0")}`;

    line.textContent = `[${timeStr}] ${msg}`;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;

    if (term.children.length > TERMINAL_MAX_LINES) {
        term.removeChild(term.firstElementChild);
    }
}

function updateStatus(text, color) {
    const info = document.getElementById("sim-info");
    if (info) {
        info.textContent = text;
        info.parentElement.style.borderLeftColor = color;
    }
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById("sim-clock").textContent = now.toLocaleTimeString();
    }, 1000);
}

export { logError, logTerminal, updateStatus, startClock };
