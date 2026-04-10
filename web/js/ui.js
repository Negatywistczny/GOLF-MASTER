import { canDictionary } from "./config.js";
import { signalMeta, activeCards, errorRegistry, frameDataCache, terminalBuffer, TERMINAL_MAX_LINES, getCachedFrameHex, setCachedFrame, getSocket } from "./state.js";
import { decoderRouter } from "./decoders/router.js";
import { parseHexToBigInt, formatSignalValue } from "./utils.js";

const __setInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;

function enableInnerHTMLDiffing(el) {
    if (!el || el._diffingEnabled) return;
    let currentValue = "";
    Object.defineProperty(el, 'innerHTML', {
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

export function handleCANFrame(id, data) {
    let card = activeCards[id];

    // Jeśli kafelek nie istnieje - STWÓRZ GO
    if (!card) {
        card = createDynamicCard(id);
        activeCards[id] = card;
    }

    // Zamiast wklejać surowe dane na ekran, wysyłamy ramkę do Routera:
    decodeSpecificFrame(id, data, card);
}

export function createDynamicCard(id) {
    // 1. Sprawdź czy mamy definicję w słowniku
    const def = canDictionary[id] || { name: `NIEZNANY ${id}`, zone: 'nieznane' };

    // 2. Znajdź odpowiedni kontener (szufladę)
    const gridId = `grid-${def.zone}`;
    const container = document.getElementById(gridId) || document.getElementById('grid-nieznane');

    // 3. Zbuduj strukturę HTML kafelka
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `c-${id}`;
    
    // Jeśli ramka jest znana, dajemy jej zieloną obwódkę statusu
    if (canDictionary[id]) {
        card.classList.add('status-active');
    }

    card.innerHTML = `
    <div class="id-label">${id}</div> <h2>${def.name}</h2>
    <span class="val">-- -- --</span>
    <div class="grid"></div>
    `;
    card._valEl = card.querySelector('.val');
    card._gridEl = card.querySelector('.grid');
    enableInnerHTMLDiffing(card._gridEl);
    const nativeQuerySelector = card.querySelector.bind(card);
    card.querySelector = (selector) => {
        if (selector === '.val') return card._valEl;
        if (selector === '.grid') return card._gridEl;
        return nativeQuerySelector(selector);
    };

    // 4. Dodaj kliknięcie (Słownik - Modal)
    card.addEventListener('click', () => openModal(id));

    // 5. Wstaw do DOM
    container.appendChild(card);
    return card;
}

export function logError(src, code, desc) {
    const key = `${src}:${code}`;
    const tableBody = document.getElementById('error-table-body');

    if (errorRegistry[key]) {
        // Błąd już istnieje - zwiększ licznik
        errorRegistry[key].count++;
        errorRegistry[key].row.cells[3].textContent = errorRegistry[key].count;
    } else {
        // Nowy błąd - stwórz wiersz
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

export function logTerminal(msg) {
    const term = document.getElementById('term-stream');
    if (!term) return;

    terminalBuffer.push(msg);
    if (terminalBuffer.length > TERMINAL_MAX_LINES) {
        terminalBuffer.shift();
    }

    const line = document.createElement('div');
    // Pobieramy dokładny czas z milisekundami dla lepszej diagnostyki CAN
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    line.textContent = `[${timeStr}] ${msg}`;
    term.appendChild(line);

    // Przewijaj na dół
    term.scrollTop = term.scrollHeight;

    // Ograniczenie surowego terminala do 300 ostatnich wpisów
    if (term.children.length > TERMINAL_MAX_LINES) {
        term.removeChild(term.firstElementChild);
    }
}

export function updateStatus(text, color) {
    const info = document.getElementById('sim-info');
    if (info) {
        info.textContent = text;
        info.parentElement.style.borderLeftColor = color;
    }
}

export function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('sim-clock').textContent = now.toLocaleTimeString();
    }, 1000);
}

export function setupModal() {
    const modal = document.getElementById('info-modal');
    const close = document.querySelector('.close-btn');
    
    close.onclick = () => modal.classList.remove('show');
    window.onclick = (e) => { if (e.target == modal) modal.classList.remove('show'); };
}

export function openModal(id) {
    const modal = document.getElementById('info-modal');
    const cleanId = id.replace('0x', '');
    const def = canDictionary["0x" + cleanId] || { name: `RAMKA ${id}` };
    const data = frameDataCache["0x" + cleanId] || frameDataCache[id];

    document.getElementById('modal-title').textContent = `[0x${cleanId}] ${def.name}`;
    const body = document.getElementById('modal-body');
    
    if (!data) {
        body.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-dim);">Oczekiwanie na dane...</p>`;
        modal.classList.add('show');
        return;
    }

    // 1. Przygotowujemy dane
    const entries = Object.entries(data);
    const midIndex = Math.ceil(entries.length / 2);
    const leftData = entries.slice(0, midIndex);
    const rightData = entries.slice(midIndex);

    // 2. Funkcja pomocnicza do budowania tabeli
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
            let displayVal = "";

            displayVal = formatSignalValue(meta, value);

            tableHtml += `<tr>
                <td>
                    <span class="m-label">${meta.label}</span>
                    <span class="m-id">${key}</span>
                </td>
                <td class="m-value">${displayVal}</td>
            </tr>`;
        }
        tableHtml += `</tbody></table>`;
        return tableHtml;
    };

    // 3. Wstrzykujemy strukturę grida z dwiema tabelami
    body.innerHTML = `
        <div class="modal-grid-container">
            <div class="modal-col">${buildTableHtml(leftData)}</div>
            <div class="modal-col">${buildTableHtml(rightData)}</div>
        </div>
    `;

    modal.classList.add('show');
}

export function generateSnapshot() {
    // Nagłówek pliku CSV (średniki dla łatwego otwierania w polskim Excelu)
    let csvContent = "ID RAMKI;NAZWA RAMKI;SYGNAŁ (ID);OPIS SYGNAŁU;WARTOŚĆ\n";

    // 1. Pobranie wszystkich odebranych ramek i posortowanie ich alfabetycznie po ID
    const sortedIds = Object.keys(frameDataCache).sort();

    sortedIds.forEach(id => {
        // Zabezpieczenie brakujących nazw
        const frameName = canDictionary[id] ? canDictionary[id].name : "NIEZNANA RAMKA";
        const frameData = frameDataCache[id];

        // 2. Sortowanie sygnałów wewnątrz danej ramki (alfabetycznie)
        const sortedSignals = Object.keys(frameData).sort();

        sortedSignals.forEach(sigKey => {
            const val = frameData[sigKey];
            const meta = signalMeta[sigKey] || { label: "Brak opisu zdekodowanego", unit: "" };
            
            let displayVal = val;
            
            // Formatowanie wartości (translacja na stany lub doklejanie jednostek)
            displayVal = formatSignalValue(meta, val);

            // Dodanie wiersza do pliku (zabezpieczenie przecinków/średników w opisach)
            const safeLabel = meta.label.replace(/;/g, ",");
            csvContent += `${id};${frameName};${sigKey};${safeLabel};${displayVal}\n`;
        });
    });

    // 3. Tworzenie obiektu Blob i pobieranie pliku
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' }); // \ufeff to BOM dla polskich znaków w Excelu
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Generowanie nazwy pliku z datą i czasem
    const now = new Date();
    const dateStr = now.toISOString().slice(0,19).replace(/T/g,"_").replace(/:/g,"-");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `PQ35_CAN_SNAPSHOT_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Opcjonalne: Powiadomienie w UI
    updateStatus("SNAPSHOT ZAPISANY DO PLIKU", "var(--accent)");
}

export function requestFullDtcScan() {
    const socket = getSocket();
    const btnScanAll = document.getElementById('btn-scan-all');
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send("CMD:REQ_FULL_SCAN");
        
        logTerminal("SYS:JS: Inicjowanie pełnego Auto-Skanu DTC...");
        updateStatus("SKANOWANIE MODUŁÓW (TP 2.0)...", "var(--orange)");
        
        if (btnScanAll) {
            btnScanAll.disabled = true;
            btnScanAll.style.opacity = "0.5";
            btnScanAll.textContent = "⏳ SKANOWANIE...";
        }
    } else {
        logError("JS", "WS_OFFLINE", "Brak połączenia z Pythonem.");
    }
}

export function downloadTerminalLogs() {
    const term = document.getElementById('term-stream');
    if (!term) return;

    // 1. Zbudowanie nagłówka pliku z logami
    let logContent = "=========================================\n";
    logContent += "   GOLF MASTER v50.0 - TERMINAL LOGS\n";
    logContent += `   DATA WYGENEROWANIA: ${new Date().toLocaleString()}\n`;
    logContent += "=========================================\n\n";

    // 2. Zbieranie linii tekstowych z DOM
    const lines = term.querySelectorAll('div');
    if (lines.length === 0) {
        alert("Terminal jest pusty. Brak logów do zapisu.");
        return;
    }

    lines.forEach(line => {
        logContent += line.textContent + "\n";
    });

    // 3. Generowanie pliku TXT i wymuszenie pobierania
    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const now = new Date();
    const dateStr = now.toISOString().slice(0,19).replace(/T/g,"_").replace(/:/g,"-");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `PQ35_TERMINAL_LOG_${dateStr}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    updateStatus("LOGI TERMINALA ZAPISANE DO PLIKU", "var(--green)");
}

export function decodeSpecificFrame(id, hexData, cardElement) {
    const valElement = cardElement.querySelector('.val');
    // Pre-cache dla wszystkich odczytów bitowych w ramach jednej ramki
    if (getCachedFrameHex() !== hexData) {
        setCachedFrame(hexData, parseHexToBigInt(hexData));
    }
    
    // Zawsze domyślnie pokazujemy surowe dane, chyba że kafelek ma atrybut 'data-decoded'
    if (valElement && !valElement.hasAttribute('data-decoded')) {
        valElement.textContent = hexData;
        valElement.style.fontSize = "1.2em"; 
    }
    const decoder = decoderRouter[id];
    if (decoder) decoder(id, hexData, cardElement);
}

