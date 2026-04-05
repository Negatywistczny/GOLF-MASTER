/* =========================================
   GOLF MASTER v50.0 - SMART ENGINE (JS)
   ========================================= */

// --- KONFIGURACJA I ZMIENNE ---
const WS_URL = "ws://localhost:8765";
let socket = null;

// Słownik znanych ramek CAN (PQ35)
const canDictionary = {
    "0x151": { name: "AIRBAG (mAirbag_1)", zone: "system" },
    "0x291": { name: "ZAMEK / KOMFORT (mZKE_1)", zone: "komfort" },
    "0x2C1": { name: "MANETKI (mLSM_1)", zone: "komfort" },
    "0x2C3": { name: "STACYJKA (mZAS_Status)", zone: "naped" },
    "0x351": { name: "GATEWAY (mGateway_1)", zone: "system" },
    "0x359": { name: "HAMULCE / BIEGI (mGW_Bremse)", zone: "naped" },
    "0x35B": { name: "SILNIK (mGW_Motor)", zone: "naped" },
    "0x3C3": { name: "KĄT SKRĘTU (mLenkwinkel)", zone: "naped" },
    "0x3E1": { name: "CLIMATRONIC 1 (mClima_1)", zone: "komfort" },
    "0x3E3": { name: "CLIMATRONIC 2 (mClima_2)", zone: "komfort" },
    "0x42B": { name: "SLEEP / WAKE (mNM_Gateway)", zone: "system" },
    "0x470": { name: "DRZWI / ŚWIATŁA (mBSG_Kombi)", zone: "komfort" },
    "0x527": { name: "TEMP. ZEWN. (mGW_Kombi)", zone: "media" },
    "0x551": { name: "UKŁ. KIEROWNICZY", zone: "naped" },
    "0x555": { name: "TURBO / OLEJ (mMotor7)", zone: "naped" },
    "0x557": { name: "BŁĘDY MODUŁÓW (mKD_Error)", zone: "system" },
    "0x571": { name: "ZASILANIE / AKU (mBSG_2)", zone: "naped" },
    "0x575": { name: "STATUS ŚWIATEŁ (mBSG_3)", zone: "komfort" },
    "0x60E": { name: "JEDNOSTKI (mEinheiten)", zone: "media" },
    "0x621": { name: "PALIWO / RĘCZNY (mKombi_K1)", zone: "naped" },
    "0x62F": { name: "WYŚWIETLACZ MFA (mDisplay_1)", zone: "media" },
    "0x635": { name: "ŚCIEMNIANIE DESKI (mDimmung)", zone: "komfort" },
    "0x651": { name: "FLAGI SYSTEMU (mSysteminfo)", zone: "system" },
    "0x653": { name: "REGION / JĘZYK (mGateway_3)", zone: "media" },
    "0x655": { name: "LISTA MODUŁÓW (mVerbauliste)", zone: "system" },
    "0x65D": { name: "CZAS / PRZEBIEG (mDiagnose_1)", zone: "media" },
    "0x65F": { name: "VIN POJAZDU (mFzg_Ident)", zone: "system" }
};

// Pamięć kafelków: { "0x470": DOMElement }
const activeCards = {};
// Rejestr błędów: { "PY:SERIAL_LOST": { count: 5, row: DOMElement } }
const errorRegistry = {};
// Pamięć szczegółowych danych dla okna Modal:
const frameDataCache = {};

// --- INICJALIZACJA ---
document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    startClock();
    setupModal();
});

// --- POŁĄCZENIE Z PYTHONEM ---
function connectWebSocket() {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
        updateStatus("POŁĄCZONO Z PYTHONEM", "var(--green)");
        logTerminal("SYS:JS:WS_CONNECTED");
    };

    socket.onmessage = (event) => {
        parseIncomingData(event.data);
    };

    socket.onclose = () => {
        updateStatus("UTRACO_POŁĄCZENIE Z PYTHONEM", "var(--red)");
        logError("JS", "WS_DISCONNECTED", "Brak połączenia z bridge.py");
        setTimeout(connectWebSocket, 3000); // Autoreconnect
    };

    socket.onerror = (err) => {
        logError("JS", "WS_ERROR", "Błąd gniazda WebSocket");
    };
}

// --- GŁÓWNY PARSER DANYCH ---
function parseIncomingData(raw) {
    // 1. Zawsze loguj do terminala
    logTerminal(raw);

    // 2. Obsługa Błędów (ERR:SRC:CODE)
    if (raw.startsWith("ERR:")) {
        const [_, src, code] = raw.split(":");
        logError(src, code, "Wykryto błąd warstwy " + src);
        return;
    }

    // 3. Obsługa Systemu (SYS:SRC:CODE)
    if (raw.startsWith("SYS:")) {
        const [_, src, code] = raw.split(":");
        updateStatus(`${src}: ${code}`, "var(--accent)");
        return;
    }

    // 4. Obsługa Ramek CAN (ID:DATA1 DATA2...)
    if (raw.includes(":")) {
        const [idHex, dataHex] = raw.split(":");
        handleCANFrame(idHex, dataHex);
    }
}

// --- ZARZĄDZANIE KAFELKAMI (FABRYKA) ---
function handleCANFrame(id, data) {
    let card = activeCards[id];

    // Jeśli kafelek nie istnieje - STWÓRZ GO
    if (!card) {
        card = createDynamicCard(id);
        activeCards[id] = card;
    }

    // Zamiast wklejać surowe dane na ekran, wysyłamy ramkę do Routera:
    decodeSpecificFrame(id, data, card);
}

function createDynamicCard(id) {
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

    // 4. Dodaj kliknięcie (Słownik - Modal)
    card.addEventListener('click', () => openModal(id));

    // 5. Wstaw do DOM
    container.appendChild(card);
    return card;
}

// --- REJESTR BŁĘDÓW ---
function logError(src, code, desc) {
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

// --- TERMINAL ---
function logTerminal(msg) {
    const term = document.getElementById('term-stream');
    if (!term) return;

    const line = document.createElement('div');
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    term.appendChild(line);

    // Przewijaj na dół
    term.scrollTop = term.scrollHeight;

    // Usuwaj stare linie (limit 100)
    if (term.childNodes.length > 100) {
        term.removeChild(term.firstChild);
    }
}

// --- POMOCNICZE ---
function updateStatus(text, color) {
    const info = document.getElementById('sim-info');
    if (info) {
        info.textContent = text;
        info.parentElement.style.borderLeftColor = color;
    }
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('sim-clock').textContent = now.toLocaleTimeString();
    }, 1000);
}

// --- MODAL ---
function setupModal() {
    const modal = document.getElementById('info-modal');
    const close = document.querySelector('.close-btn');
    
    close.onclick = () => modal.classList.remove('show');
    window.onclick = (e) => { if (e.target == modal) modal.classList.remove('show'); };
}

function openModal(id) {
    const modal = document.getElementById('info-modal');
    const def = canDictionary[id] || { name: `NIEZNANY ${id}` };
    
    document.getElementById('modal-title').textContent = `[${id}] ${def.name}`;
    
    let bodyHtml = ``;
    
    // Sprawdzamy, czy mamy pełne dane w pamięci cache
    if (frameDataCache[id]) {
        bodyHtml += `<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="border-bottom: 2px solid var(--accent); color: var(--accent);">
                    <th style="text-align: left; padding: 5px;">Sygnał</th>
                    <th style="text-align: right; padding: 5px;">Wartość</th>
                </tr>
            </thead>
            <tbody>`;
            
        // Pętla tworząca wiersze w tabeli dla każdego zdekodowanego bitu
        for (const [key, value] of Object.entries(frameDataCache[id])) {
            bodyHtml += `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 5px; color: var(--text-dim);">${key}</td>
                    <td style="text-align: right; padding: 5px; font-weight: bold;">${value}</td>
                </tr>`;
        }
        bodyHtml += `</tbody></table>`;
    } else {
        bodyHtml = `
            <p>Brak szczegółowych danych do wyświetlenia.</p>
            <p>Status: Ramka nie została jeszcze w pełni zdekodowana (Tryb podglądu).</p>
        `;
    }
    
    document.getElementById('modal-body').innerHTML = bodyHtml;
    modal.classList.add('show');
}

// =========================================
// GOLF MASTER - SILNIK DEKODUJĄCY CAN
// =========================================

/**
 * Główna funkcja wyciągająca sygnał z ramki CAN (Format Intel / Little-Endian)
 */
function extractCANSignal(hexString, startBit, length, multiplier = 1, offset = 0, isSigned = false) {
    // 1. Zamiana "01 02 0A" na tablicę liczb [1, 2, 10]
    const bytes = hexString.trim().split(' ').map(x => BigInt('0x' + x));
    
    // 2. Budowanie jednej liczby 64-bitowej (Format Intel)
    let dataBigInt = 0n;
    for (let i = 0; i < bytes.length; i++) {
        dataBigInt |= (bytes[i] << BigInt(i * 8));
    }

    // 3. Wycinanie odpowiednich bitów za pomocą maski
    const mask = (1n << BigInt(length)) - 1n;
    let rawValue = Number((dataBigInt >> BigInt(startBit)) & mask);

    // 4. Obsługa liczb ujemnych (Uzupełnienie do dwóch)
    if (isSigned) {
        const signBit = 1 << (length - 1);
        if (rawValue & signBit) {
            rawValue -= (1 << length);
        }
    }

    // 5. Aplikacja matematyki
    return (rawValue * multiplier) + offset;
}

// --- ROUTER RAMEK ---
function decodeSpecificFrame(id, hexData, cardElement) {
    const valElement = cardElement.querySelector('.val');
    
    // Zawsze domyślnie pokazujemy surowe dane, chyba że kafelek ma atrybut 'data-decoded'
    if (valElement && !valElement.hasAttribute('data-decoded')) {
        valElement.textContent = hexData;
        valElement.style.fontSize = "1.2em"; 
    }

    // --- MIEJSCE NA TWOJE DEKODERY ---
    switch(id) {
        case "0x151": decodeAirbagData(id, hexData, cardElement); break;
        case "0x291": decodeZKEData(id, hexData, cardElement); break;
        case "0x2C1": decodeManetkiData(id, hexData, cardElement); break;
        case "0x2C3": decodeZASData(id, hexData, cardElement); break;
        case "0x351": decodeGateway1Data(id, hexData, cardElement); break;
        case "0x359": decodeBremseGetriebeData(id, hexData, cardElement); break;
        case "0x35B": decodeMotorData(id, hexData, cardElement); break;
        case "0x3C3": decodeLenkwinkelData(id, hexData, cardElement); break;
        case "0x3E1": decodeClima1Data(id, hexData, cardElement); break;
        case "0x3E3": decodeClima2Data(id, hexData, cardElement); break;
        case "0x42B": decodeNMGatewayIData(id, hexData, cardElement); break;
        case "0x470": decodeBSGKombiData(id, hexData, cardElement); break;
        case "0x527": decodeGWKombiData(id, hexData, cardElement); break;
        case "0x555": decodeMotor7Data(id, hexData, cardElement); break;
        case "0x557": decodeKDErrorData(id, hexData, cardElement); break;
        case "0x571": decodeBSG2Data(id, hexData, cardElement); break;
        case "0x575": decodeBSG3Data(id, hexData, cardElement); break;
        case "0x60E": decodeEinheitenData(id, hexData, cardElement); break;
        case "0x621": decodeKombiK1Data(id, hexData, cardElement); break;
        case "0x62F": decodeDisplay1Data(id, hexData, cardElement); break;
        case "0x635": decodeDimmungData(id, hexData, cardElement); break;
        case "0x651": decodeSysteminfo1Data(id, hexData, cardElement); break;
        case "0x653": decodeGateway3Data(id, hexData, cardElement); break;
        case "0x655": decodeSollverbauData(id, hexData, cardElement); break;
        case "0x65D": decodeDiagnose1Data(id, hexData, cardElement); break;
        case "0x65F": decodeFzgIdentData(id, hexData, cardElement); break;
    }
}

// =========================================
// DEKODERY POSZCZEGÓLNYCH RAMEK
// =========================================

// Dekoder dla 0x151 (mAirbag_1)
function decodeAirbagData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI
    const fullData = {
        "AB1_FrontCrash": extractCANSignal(hexData, 0, 1),
        "AB1_HeckCrash": extractCANSignal(hexData, 1, 1),
        "AB1_Crash_FT": extractCANSignal(hexData, 2, 1),
        "AB1_Crash_BT": extractCANSignal(hexData, 3, 1),
        "AB1_Rollover": extractCANSignal(hexData, 4, 1),
        "AB1_CrashStaerke": extractCANSignal(hexData, 5, 3),
        "AB1_AirbagLampe_ein": extractCANSignal(hexData, 8, 1),
        "AB1_Airbag_deaktiviert": extractCANSignal(hexData, 9, 1),
        "AB1_Beif_Airbag_deaktiviert": extractCANSignal(hexData, 10, 1),
        "AB1_Systemfehler": extractCANSignal(hexData, 11, 1),
        "AB1_Fa_Gurt": extractCANSignal(hexData, 12, 2),
        "AB1_Bf_Gurt": extractCANSignal(hexData, 14, 2),
        "AB1_Diagnose": extractCANSignal(hexData, 16, 1),
        "AB1_Stellglied": extractCANSignal(hexData, 17, 1),
        "AB1_BF_Anschnall": extractCANSignal(hexData, 18, 1),
        "AB1_KD_Fehler": extractCANSignal(hexData, 19, 1),
        "AB1_MessageZaehler": extractCANSignal(hexData, 20, 4),
        "AB1_Pruefsumme": extractCANSignal(hexData, 24, 8)
    };

    // Zapisz do pamięci dla naszego okna Modal (Skaner Szczegółowy)
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // Pasy kierowcy (Z dokumentacji: 3 = zapięte, 2 = odpięte)
    if (fullData.AB1_Fa_Gurt === 3) {
        html += `<div class="ind active-green">PAS KIEROWCY</div>`;
    } else if (fullData.AB1_Fa_Gurt === 2) {
        html += `<div class="ind active-error">PAS KIEROWCY</div>`;
    } else {
        html += `<div class="ind">PAS KIEROWCY (B/D)</div>`;
    }

    // Pasy pasażera (Z dokumentacji: 3 = zapięte, 2 = odpięte)
    if (fullData.AB1_Bf_Gurt === 3) {
        html += `<div class="ind active-green">PAS PASAŻERA</div>`;
    } else if (fullData.AB1_Bf_Gurt === 2) {
        html += `<div class="ind active-error">PAS PASAŻERA</div>`;
    } else {
        html += `<div class="ind">PAS PASAŻERA (B/D)</div>`;
    }

    // Status systemu Airbag (uwzględniamy błąd systemu, lampkę i usterki serwisowe)
    if (fullData.AB1_AirbagLampe_ein === 1 || fullData.AB1_Systemfehler === 1 || fullData.AB1_KD_Fehler === 1) {
        html += `<div class="ind active-error full-width">BŁĄD SYSTEMU AIRBAG</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        html += `<div class="ind active-green full-width">SYSTEM AIRBAG OK</div>`;
        cardElement.style.borderColor = "var(--green)";
    }

    // Alarm zderzeniowy (jeśli jakakolwiek siła zderzenia jest > 0)
    if (fullData.AB1_CrashStaerke > 0 || fullData.AB1_FrontCrash === 1 || fullData.AB1_Rollover === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite;">WYPADEK / CRASH DETECTED!</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x291 (mZKE_1 - Zamek Centralny i Komfort)
function decodeZKEData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI
    const fullData = {
        "ZK1_Funkschl_Nr": extractCANSignal(hexData, 0, 3),
        "ZK1_433_MHz": extractCANSignal(hexData, 3, 1),
        "ZK1_Taste_HDF": extractCANSignal(hexData, 4, 1),
        "ZK1_Taste_Panik": extractCANSignal(hexData, 5, 1),
        "ZK1_Taste_Auf": extractCANSignal(hexData, 6, 1),
        "ZK1_Taste_Zu": extractCANSignal(hexData, 7, 1),
        "ZK1_FT_verriegeln": extractCANSignal(hexData, 8, 1),
        "ZK1_FT_entriegeln": extractCANSignal(hexData, 9, 1),
        "ZK1_BT_verriegeln": extractCANSignal(hexData, 10, 1),
        "ZK1_BT_entriegeln": extractCANSignal(hexData, 11, 1),
        "ZK1_HL_verriegeln": extractCANSignal(hexData, 12, 1),
        "ZK1_HL_entriegeln": extractCANSignal(hexData, 13, 1),
        "ZK1_HR_verriegeln": extractCANSignal(hexData, 14, 1),
        "ZK1_HR_entriegeln": extractCANSignal(hexData, 15, 1),
        "ZK1_Zent_safen": extractCANSignal(hexData, 16, 1),
        "ZK1_Zent_entsafen": extractCANSignal(hexData, 17, 1),
        "ZK1_HD_verriegeln": extractCANSignal(hexData, 18, 1),
        "ZK1_HD_entriegeln": extractCANSignal(hexData, 19, 1),
        "ZK1_HD_oeffnen": extractCANSignal(hexData, 20, 1),
        "ZK1_HD_schliessen": extractCANSignal(hexData, 21, 1),
        "ZK1_LED_Steuerung": extractCANSignal(hexData, 22, 1),
        "ZK1_LED_Uebernahme": extractCANSignal(hexData, 23, 1),
        "ZK1_Dongle_Nr": extractCANSignal(hexData, 24, 3),
        "ZK1_Dongle_Freq": extractCANSignal(hexData, 27, 2),
        "ZK1_Verdeck_auf": extractCANSignal(hexData, 29, 1),
        "ZK1_Verdeck_zu": extractCANSignal(hexData, 30, 1),
        "ZK1_LeaveHome_aktiv": extractCANSignal(hexData, 31, 1),
        "ZK1_HL_Tuer_offen": extractCANSignal(hexData, 36, 1),
        "ZK1_HR_Tuer_offen": extractCANSignal(hexData, 37, 1),
        "ZK1_SL_Anf": extractCANSignal(hexData, 38, 1),
        "ZK1_SR_Anf": extractCANSignal(hexData, 39, 1)
    };

    // Zapisz do pamięci dla okna Modal (Skaner Szczegółowy)
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Akcje Pilota (z uwzględnieniem przycisku Panic, jeśli auto z USA) ---
    if (fullData.ZK1_Taste_Auf === 1) {
        html += `<div class="ind active-green full-width">PILOT: OTWÓRZ (KLUCZ #${fullData.ZK1_Funkschl_Nr})</div>`;
        cardElement.style.borderColor = "var(--green)";
    } else if (fullData.ZK1_Taste_Zu === 1) {
        html += `<div class="ind active-error full-width">PILOT: ZAMKNIJ (KLUCZ #${fullData.ZK1_Funkschl_Nr})</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else if (fullData.ZK1_Taste_HDF === 1) {
        html += `<div class="ind active-lock full-width">PILOT: BAGAŻNIK (KLUCZ #${fullData.ZK1_Funkschl_Nr})</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else if (fullData.ZK1_Taste_Panik === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite;">PILOT: PANIC!</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        html += `<div class="ind full-width">PILOT: BRAK AKCJI</div>`;
        cardElement.style.borderColor = "var(--border-color)"; 
    }

    // --- Status Leaving Home ---
    if (fullData.ZK1_LeaveHome_aktiv === 1) {
        html += `<div class="ind active">LEAVING HOME</div>`;
    } else {
        html += `<div class="ind">LEAVING HOME</div>`;
    }

    // --- Status Drzwi / Ryglowania ---
    if (fullData.ZK1_HL_Tuer_offen === 1 || fullData.ZK1_HR_Tuer_offen === 1) {
        let side = "";
        if (fullData.ZK1_HL_Tuer_offen) side += "L ";
        if (fullData.ZK1_HR_Tuer_offen) side += "P ";
        html += `<div class="ind active-error">DRZWI TYŁ OTWARTE: ${side}</div>`;
    } else {
        // Jeśli tył jest zamknięty, sprawdźmy chociaż ogólny status zaryglowania (SAFE)
        let rygiel = (fullData.ZK1_Zent_safen === 1) ? "ZARYGLOWANE (SAFE)" : "ZAMKNIĘTE";
        html += `<div class="ind">${rygiel}</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x2C1 (mLSM_1 - Manetki i Kolumna Kierownicy)
function decodeManetkiData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (39 sygnałów!)
    const fullData = {
        "LS1_Blk_links": extractCANSignal(hexData, 0, 1),
        "LS1_Blk_rechts": extractCANSignal(hexData, 1, 1),
        "LS1_Lichthupe": extractCANSignal(hexData, 2, 1),
        "LS1_Fernlicht": extractCANSignal(hexData, 3, 1),
        "LS1_Parklicht_links": extractCANSignal(hexData, 5, 1),
        "LS1_Parklicht_rechts": extractCANSignal(hexData, 6, 1),
        "LS1_Signalhorn": extractCANSignal(hexData, 7, 1),
        "LS1_Tipwischen": extractCANSignal(hexData, 8, 1),
        "LS1_Intervall": extractCANSignal(hexData, 9, 1),
        "LS1_WischenStufe_1": extractCANSignal(hexData, 10, 1),
        "LS1_WischenStufe_2": extractCANSignal(hexData, 11, 1),
        "LS1_Frontwaschen": extractCANSignal(hexData, 12, 1),
        "LS1_Bew_Frontwaschen": extractCANSignal(hexData, 13, 1),
        "LS1_Heckintervall": extractCANSignal(hexData, 14, 1),
        "LS1_Heckwaschen": extractCANSignal(hexData, 15, 1),
        "LS1_Intervallstufen": extractCANSignal(hexData, 16, 4), // Czułość czujnika deszczu (4 bity!)
        "LS1_BC_Down_Cursor": extractCANSignal(hexData, 20, 1),
        "LS1_BC_Up_Cursor": extractCANSignal(hexData, 21, 1),
        "LS1_BC_Reset": extractCANSignal(hexData, 22, 1),
        "LS1_KD_Fehler": extractCANSignal(hexData, 23, 1),
        "LS1_LSY_oben": extractCANSignal(hexData, 24, 1),
        "LS1_LSY_unten": extractCANSignal(hexData, 25, 1),
        "LS1_LSZ_vor": extractCANSignal(hexData, 26, 1),
        "LS1_LSZ_zurueck": extractCANSignal(hexData, 27, 1),
        "LS1_ELV_enable": extractCANSignal(hexData, 28, 1),
        "LS1_def_ELV_Enable": extractCANSignal(hexData, 29, 1),
        "LS1_Easy_Entry_LS": extractCANSignal(hexData, 30, 1),
        "LS1_LHeizung_aktiv": extractCANSignal(hexData, 31, 1),
        "LS1_Winterstellung": extractCANSignal(hexData, 32, 1),
        "LS1_MFL_vorhanden": extractCANSignal(hexData, 33, 1),
        "LS1_MFA_vorhanden": extractCANSignal(hexData, 34, 1),
        "LS1_MFA_Tasten": extractCANSignal(hexData, 35, 1),
        "LS1_def_P_Verriegelt": extractCANSignal(hexData, 36, 1),
        "LS1_MFL_Typ": extractCANSignal(hexData, 37, 1),
        "LS1_Servicestellung": extractCANSignal(hexData, 38, 1),
        "LS1_P_verriegelt": extractCANSignal(hexData, 39, 1),
        "LS1_FAS_Taster": extractCANSignal(hexData, 40, 1),
        "LS1_Fehler_FAS_Taster": extractCANSignal(hexData, 41, 1),
        "LS1_Fehler_Vibration": extractCANSignal(hexData, 42, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Kierunkowskazy ---
    if (fullData.LS1_Blk_links === 1) {
        html += `<div class="ind active-green" style="animation: blink 0.5s infinite;">&#8592; KIERUNEK LEWY</div>`;
        cardElement.style.borderColor = "var(--green)";
    } else if (fullData.LS1_Blk_rechts === 1) {
        html += `<div class="ind active-green" style="animation: blink 0.5s infinite;">KIERUNEK PRAWY &#8594;</div>`;
        cardElement.style.borderColor = "var(--green)";
    } else {
        html += `<div class="ind">KIERUNKI WYŁ.</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- Klakson ---
    if (fullData.LS1_Signalhorn === 1) {
        html += `<div class="ind active-error">KLAKSON!</div>`;
    } else {
        html += `<div class="ind">KLAKSON</div>`;
    }

    // --- Światła Długie / Blinda (Lichthupe) ---
    if (fullData.LS1_Fernlicht === 1 || fullData.LS1_Lichthupe === 1) {
        let txt = fullData.LS1_Lichthupe === 1 ? "MIGNIĘCIE" : "DŁUGIE";
        html += `<div class="ind active-lock">ŚWIATŁA: ${txt}</div>`;
    }

    // --- Wycieraczki / Spryskiwacze ---
    let wipeStatus = "WYŁĄCZONE";
    let isWiping = false;

    if (fullData.LS1_Frontwaschen === 1 || fullData.LS1_Heckwaschen === 1) {
        wipeStatus = fullData.LS1_Frontwaschen === 1 ? "MYCIE PRZÓD" : "MYCIE TYŁ";
        isWiping = true;
    } else if (fullData.LS1_WischenStufe_2 === 1) {
        wipeStatus = "SZYBKIE (BIEG 2)";
        isWiping = true;
    } else if (fullData.LS1_WischenStufe_1 === 1) {
        wipeStatus = "WOLNE (BIEG 1)";
        isWiping = true;
    } else if (fullData.LS1_Intervall === 1) {
        // Tu przydaje się nasz 4-bitowy sygnał od czułości!
        wipeStatus = `AUTO (Czułość: ${fullData.LS1_Intervallstufen})`;
        isWiping = true;
    } else if (fullData.LS1_Tipwischen === 1) {
        wipeStatus = "POJEDYNCZE PRZETARCIE";
        isWiping = true;
    }

    if (isWiping) {
        html += `<div class="ind active full-width">WYCIERACZKI: ${wipeStatus}</div>`;
    } else {
        html += `<div class="ind full-width">WYCIERACZKI: OFF</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x2C3 (mZAS_Status - Status stacyjki / Zaciski)
function decodeZASData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI
    // Ramka stacyjki (Klemmen) w PQ35 opiera się na podstawowych bitach zacisków.
    const fullData = {
        "ZAS_Kl_S": extractCANSignal(hexData, 0, 1),   // Zacisk S (Kluczyk w stacyjce)
        "ZAS_Kl_15": extractCANSignal(hexData, 1, 1),  // Zacisk 15 (Zapłon ON)
        "ZAS_Kl_75": extractCANSignal(hexData, 2, 1),  // Zacisk 75 (Akcesoria / X-Kontakt)
        "ZAS_Kl_50": extractCANSignal(hexData, 3, 1),  // Zacisk 50 (Rozrusznik kręci)
        "ZAS_Kl_P": extractCANSignal(hexData, 4, 1),   // Zacisk P (Światła postojowe/parkingowe stacyjki)
        "ZAS_Fehler": extractCANSignal(hexData, 5, 1)  // Flaga błędu kostki stacyjki
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Wizualizacja Głównego Stanu Stacyjki ---
    // Logika priorytetów: Rozrusznik -> Zapłon -> Akcesoria -> Kluczyk -> Brak
    if (fullData.ZAS_Fehler === 1) {
        html += `<div class="ind active-error full-width">BŁĄD KOSTKI STACYJKI!</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else if (fullData.ZAS_Kl_50 === 1) {
        html += `<div class="ind active-lock full-width" style="animation: blink 0.2s infinite;">ROZRUSZNIK (KL. 50)</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else if (fullData.ZAS_Kl_15 === 1) {
        html += `<div class="ind active-green full-width">ZAPŁON WŁĄCZONY (KL. 15)</div>`;
        cardElement.style.borderColor = "var(--green)";
    } else if (fullData.ZAS_Kl_75 === 1) {
        html += `<div class="ind active full-width">AKCESORIA (KL. 75)</div>`;
        cardElement.style.borderColor = "var(--accent)";
    } else if (fullData.ZAS_Kl_S === 1) {
        html += `<div class="ind active full-width" style="opacity: 0.8;">KLUCZYK W STACYJCE (KL. S)</div>`;
        cardElement.style.borderColor = "var(--accent)";
    } else {
        html += `<div class="ind full-width">BRAK KLUCZYKA</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x351 (mGateway_1 - Podstawowa ramka statusowa Gatewaya)
function decodeGateway1Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI
    const fullData = {
        "GW1_FhzgGeschw_alt": extractCANSignal(hexData, 0, 1),
        "GW1_Rueckfahrlicht": extractCANSignal(hexData, 1, 1),
        // Prędkość ma 15 bitów, a jej przelicznik w dokumentacji to 0.01 (czyli np. wartość 5000 z CAN to 50.00 km/h)
        "GW1_FzgGeschw": extractCANSignal(hexData, 9, 15, 0.01, 0),
        "KKO_alt_mBSG_Kombi": extractCANSignal(hexData, 63, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Wizualizacja Bieg Wsteczny / Światło Cofania ---
    if (fullData.GW1_Rueckfahrlicht === 1) {
        html += `<div class="ind active-lock full-width">ŚWIATŁO WSTECZNE (COFANIE)</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else {
        html += `<div class="ind full-width">BIEG WSTECZNY WYŁ.</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- Prędkość pojazdu ---
    // Dokumentacja mówi, że wartości od 327.08 wzwyż (wartości RAW > 32700) oznaczają błędy/inicjalizację
    if (fullData.GW1_FzgGeschw >= 327.00) {
        html += `<div class="ind active-error full-width">BŁĄD DANYCH PRĘDKOŚCI (ABS)</div>`;
    } else {
        // Wyświetlamy prędkość zaokrągloną do jednego miejsca po przecinku
        html += `<div class="ind active full-width">PRĘDKOŚĆ: ${fullData.GW1_FzgGeschw.toFixed(1)} km/h</div>`;
    }

    // --- Ostrzeżenia o utracie łączności (Veraltet) ---
    // Jeśli jakikolwiek sygnał diagnostyczny o błędzie (Timeout) jest ustawiony na 1, zapalamy małą kontrolkę
    if (fullData.GW1_FhzgGeschw_alt === 1 || fullData.KKO_alt_mBSG_Kombi === 1) {
        html += `<div class="ind active-error full-width">OPÓŹNIENIE NA MAGISTRALI (TIMEOUT)</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x359 (mGW_Bremse_Getriebe - Hamulce i Skrzynia Biegów)
function decodeBremseGetriebeData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (29 sygnałów)
    const fullData = {
        "GWB_Alt_FzgGeschw": extractCANSignal(hexData, 0, 1),
        "GWB_Alt_2_Bremse": extractCANSignal(hexData, 1, 1),
        "GWB_Alt_1_Bremse": extractCANSignal(hexData, 2, 1),
        "GWB_Alt_1_Getriebe": extractCANSignal(hexData, 3, 1),
        "GWB_Alt_2_Getriebe": extractCANSignal(hexData, 4, 1),
        "GWB_Alt_1_EPB": extractCANSignal(hexData, 5, 1),
        "GWB_Alt_5_Bremse": extractCANSignal(hexData, 6, 1),
        "GWB_Alt_AWV_X": extractCANSignal(hexData, 7, 1),
        "GWB_FzgGeschw_Quelle": extractCANSignal(hexData, 8, 1),
        "GWB_FzgGeschw": extractCANSignal(hexData, 9, 15, 0.01, 0),
        "GWB_Wegimpulse": extractCANSignal(hexData, 24, 11),
        "GWB_Wegimpuls_Status": extractCANSignal(hexData, 35, 1),
        "GWB_Wegimpulse_Fehler": extractCANSignal(hexData, 39, 1),
        "GWB_Impulszahl": extractCANSignal(hexData, 40, 6),
        "GWB_Alt_PLA_Status": extractCANSignal(hexData, 46, 1),
        "PLS_Bremsleuchte": extractCANSignal(hexData, 47, 1),
        "GWB_TSP_aktiv": extractCANSignal(hexData, 48, 1),
        "GWB_Notbremsung": extractCANSignal(hexData, 49, 1),
        "GWB_ABS_Bremsung": extractCANSignal(hexData, 50, 1),
        "GWB_EPB_Status": extractCANSignal(hexData, 51, 1),
        "GWB_EPB_Bremslicht": extractCANSignal(hexData, 52, 1),
        "GWB_Schlechtweg": extractCANSignal(hexData, 53, 1),
        "GWB_Schlechtweg_Fehler": extractCANSignal(hexData, 54, 1),
        "GWB_Geschw_Ersatz": extractCANSignal(hexData, 55, 1),
        "GWB_Schaltvorgang": extractCANSignal(hexData, 56, 1),
        "ANB_Teilbremsung_Freigabe": extractCANSignal(hexData, 57, 1),
        "GWB_ESP_Eingriff": extractCANSignal(hexData, 58, 1),
        "GWB_Shift_Lock": extractCANSignal(hexData, 59, 1),
        "GWB_Info_Waehlhebel": extractCANSignal(hexData, 60, 4)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Światło STOP i Hamulec ---
    // Bierzemy pod uwagę światło stop, stabilizację przyczepy i hamulec EPB
    if (fullData.PLS_Bremsleuchte === 1 || fullData.GWB_TSP_aktiv === 1 || fullData.GWB_EPB_Bremslicht === 1) {
        html += `<div class="ind active-error full-width">ŚWIATŁO STOP WŁĄCZONE</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        html += `<div class="ind full-width">HAMULEC ZWOLNIONY</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- ABS / ESP / Nagłe hamowanie ---
    if (fullData.GWB_Notbremsung === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.2s infinite;">NAGŁE HAMOWANIE!</div>`;
    }
    if (fullData.GWB_ABS_Bremsung === 1) {
        html += `<div class="ind active-orange">ABS AKTYWNY</div>`;
    }
    if (fullData.GWB_ESP_Eingriff === 1) {
        html += `<div class="ind active-orange" style="animation: blink 0.5s infinite;">ESP INTERWENIUJE!</div>`;
    }

    // --- Skrzynia Biegów (Waehlhebel) ---
    let bieg = "NIEZNANY";
    switch (fullData.GWB_Info_Waehlhebel) {
        case 8: bieg = "P (PARK)"; break;
        case 7: bieg = "R (REVERSE)"; break;
        case 6: bieg = "N (NEUTRAL)"; break;
        case 5: bieg = "D (DRIVE)"; break;
        case 12: bieg = "S (SPORT)"; break;
        case 14: bieg = "M (MANUAL/TIPTRONIC)"; break;
        case 1: bieg = "BIEG 1"; break;
        case 2: bieg = "BIEG 2"; break;
        case 3: bieg = "BIEG 3"; break;
        case 4: bieg = "BIEG 4"; break;
        case 0: bieg = "ZMIANA BIEGU..."; break;
        case 15: bieg = "BŁĄD SKRZYNI"; break;
    }
    
    // Dodajemy informacje o Shift Lock (zablokowany drążek)
    let shiftLockStr = (fullData.GWB_Shift_Lock === 1) ? " 🔒 (Zablokowany)" : "";
    
    html += `<div class="ind active-green full-width">BIEG: ${bieg}${shiftLockStr}</div>`;

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x35B (mGW_Motor - Telemetria silnika)
function decodeMotorData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (25 sygnałów)
    const fullData = {
        "GWM_Alt_1_Motor": extractCANSignal(hexData, 0, 1),
        "GWM_Alt_2_Motor": extractCANSignal(hexData, 1, 1),
        "GWM_Alt_5_Motor": extractCANSignal(hexData, 2, 1),
        "GWM_Alt_Motor_Bremse": extractCANSignal(hexData, 3, 1),
        "GWM_RME_Gehalt": extractCANSignal(hexData, 5, 3, 12.5, 0),
        "GWM_Motordrehzahl": extractCANSignal(hexData, 8, 16, 0.25, 0),
        "GWM_KuehlmittelTemp": extractCANSignal(hexData, 24, 8, 0.75, -48),
        "GWM_Bremslicht_Schalter": extractCANSignal(hexData, 32, 1),
        "GWM_Bremstest_Schalter": extractCANSignal(hexData, 33, 1),
        "GWM_Fehl_KmittelTemp": extractCANSignal(hexData, 34, 1),
        "GWM_Kuppl_Schalter": extractCANSignal(hexData, 35, 1),
        "GWM_Heissl_Vorwarn": extractCANSignal(hexData, 36, 1),
        "GWM_Klimaabschaltung": extractCANSignal(hexData, 37, 1),
        "GWM_Kennfeldkuehlung": extractCANSignal(hexData, 38, 1),
        "GWM_Komp_Leist_red": extractCANSignal(hexData, 39, 1),
        "GWM_KLuefter": extractCANSignal(hexData, 40, 8, 0.4, 0),
        "GWM_Anl_Freigabe": extractCANSignal(hexData, 48, 1),
        "GWM_Anl_Ausspuren": extractCANSignal(hexData, 49, 1),
        "GWM_Interlock": extractCANSignal(hexData, 50, 1),
        "GWM_TypStartSteu": extractCANSignal(hexData, 51, 1),
        "GWM_Freig_Bremsanforderung": extractCANSignal(hexData, 52, 1),
        "GWM_Vorgluehen": extractCANSignal(hexData, 53, 1),
        "GWM_GRA_Status": extractCANSignal(hexData, 54, 2),
        "GWM_KVerbrauch": extractCANSignal(hexData, 56, 7, 256, 0),
        "GWM_Ueberl_KV": extractCANSignal(hexData, 63, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Obroty Silnika (RPM) ---
    // Z dokumentacji wynika, że raw wartość 65280 to błąd. 65280 * 0.25 = 16320.
    if (fullData.GWM_Motordrehzahl >= 16320) {
        html += `<div class="ind active-error full-width">OBROTY: BŁĄD CZYTNIKA</div>`;
    } else {
        html += `<div class="ind active full-width" style="font-size: 1.1em;">OBROTY: ${fullData.GWM_Motordrehzahl} RPM</div>`;
    }

    // --- Temperatura Płynu Chłodzącego ---
    // Według pliku błąd to raw wartość 255. Z przelicznikiem (255 * 0.75 - 48) daje to 143.25 °C.
    if (fullData.GWM_KuehlmittelTemp >= 143) {
        html += `<div class="ind active-error full-width">TEMP. PŁYNU: BŁĄD CZUJNIKA</div>`;
    } else {
        let tempColor = "var(--text-color)";
        if (fullData.GWM_KuehlmittelTemp < 50) tempColor = "var(--blue)";      // Silnik zimny
        else if (fullData.GWM_KuehlmittelTemp > 105) tempColor = "var(--red)"; // Silnik gorący
        else tempColor = "var(--green)";                                       // Temperatura robocza

        html += `<div class="ind full-width" style="border-color: ${tempColor}; color: ${tempColor}; font-weight: bold;">TEMP: ${fullData.GWM_KuehlmittelTemp.toFixed(1)} °C</div>`;
    }

    // --- Pedał Sprzęgła ---
    // Wartość 0 = wciśnięty (rozłączony napęd) | 1 = puszczony (zasprzęglony)
    if (fullData.GWM_Kuppl_Schalter === 0) {
        html += `<div class="ind active-lock">SPRZĘGŁO: WCIŚNIĘTE</div>`;
    } else {
        html += `<div class="ind">SPRZĘGŁO: PUSZCZONE</div>`;
    }

    // --- Tempomat (GRA) ---
    // Dokumentacja dla GRA: 0=wył, 1=aktywny, 2=nadpisany gazem (overridden)
    if (fullData.GWM_GRA_Status === 1) {
        html += `<div class="ind active-green">TEMPOMAT: AKTYWNY</div>`;
    } else if (fullData.GWM_GRA_Status === 2) {
        html += `<div class="ind active-orange">TEMPOMAT: +GAZ KIEROWCY</div>`;
    } else {
        html += `<div class="ind">TEMPOMAT: WYŁ.</div>`;
    }

    // --- Kontrolka Świec Żarowych / Check Engine ---
    if (fullData.GWM_Vorgluehen === 1) {
        html += `<div class="ind active-orange full-width" style="animation: blink 0.5s infinite;">ŚWIECE ŻAROWE WŁĄCZONE</div>`;
    }

    // --- Alert przegrzania silnika ---
    // Zapala kafelek na czerwono w razie alarmu Heissleuchtenvorwarnung
    if (fullData.GWM_Heissl_Vorwarn === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.2s infinite;">ALARM: PRZEGRZANIE SILNIKA!</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        // Resetowanie koloru, jeśli wszystko jest okej i silnik działa
        if (fullData.GWM_Motordrehzahl > 0 && fullData.GWM_Motordrehzahl < 16320) {
            cardElement.style.borderColor = "var(--border-color)";
        }
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x3C3 (mLenkwinkel_1 - Kąt skrętu kierownicy)
function decodeLenkwinkelData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (11 sygnałów)
    const fullData = {
        "LW1_Lenkradwinkel": extractCANSignal(hexData, 0, 15, 0.04375, 0),       // Kąt (wartość bezwzględna)
        "LW1_Vorzeichen": extractCANSignal(hexData, 15, 1),                      // Znak kąta (0=lewo/plus, 1=prawo/minus)
        "LW1_Geschwindigkeit": extractCANSignal(hexData, 16, 15, 0.04375, 0),    // Prędkość obrotu (bez wzgl.)
        "LW1_Geschw_Vorzeichen": extractCANSignal(hexData, 31, 1),               // Znak prędkości
        "LW1_ID": extractCANSignal(hexData, 32, 8),                              // Status kalibracji (128 = skalibrowany)
        "LW1_Quelle_Init": extractCANSignal(hexData, 40, 1),
        "LW1_Int_Status": extractCANSignal(hexData, 41, 2),                      // Status sensora (0=OK, 1=NoInit, 2=Sporadyczny, 3=Trwały błąd)
        "LW1_KL30_Ausfall": extractCANSignal(hexData, 43, 1),                    // Flaga braku zasilania (odpięta klema)
        "LW1_Zaehler": extractCANSignal(hexData, 44, 4),                         // Licznik wiadomości
        "LW1_CRC8CHK": extractCANSignal(hexData, 48, 8),                         // Suma kontrolna CRC
        "LW1_Pruefsumme": extractCANSignal(hexData, 56, 8)                       // Suma kontrolna ESP
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    // --- Kalkulacja prawdziwych wartości ze znakami (lewo/prawo) ---
    // Według dokumentacji: 0 = pozytywny (w lewo), 1 = negatywny (w prawo)
    let actualAngle = fullData.LW1_Lenkradwinkel;
    if (fullData.LW1_Vorzeichen === 1) actualAngle = -actualAngle;

    let actualSpeed = fullData.LW1_Geschwindigkeit;
    if (fullData.LW1_Geschw_Vorzeichen === 1) actualSpeed = -actualSpeed;

    let html = ``;

    // --- Status Sensora i Błędy ---
    if (fullData.LW1_Int_Status !== 0) {
        let errTxt = "BŁĄD SENSORA";
        if (fullData.LW1_Int_Status === 1) errTxt = "BRAK INICJALIZACJI";
        if (fullData.LW1_Int_Status === 2) errTxt = "BŁĄD SPORADYCZNY";
        if (fullData.LW1_Int_Status === 3) errTxt = "BŁĄD TRWAŁY";
        
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite;">STATUS: ${errTxt}</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        cardElement.style.borderColor = "var(--green)";
    }

    // --- Wizualizacja Kąta Skrętu ---
    // Wartość 1433.55... to fizyczny ogranicznik błędu (7FFFH), więc filtrujemy ewentualny błąd pomiaru
    if (fullData.LW1_Lenkradwinkel > 1430) {
        html += `<div class="ind active-error full-width">KĄT SKRĘTU: POZA ZAKRESEM (BŁĄD)</div>`;
    } else {
        // Określenie kierunku (kierowcy łatwiej czytać "Lewo/Prawo" niż tylko minus/plus)
        let dirStr = (actualAngle === 0) ? "PROSTO" : (actualAngle > 0 ? "LEWO" : "PRAWO");
        html += `<div class="ind active full-width" style="font-size: 1.1em;">KĄT: ${Math.abs(actualAngle).toFixed(1)}° (${dirStr})</div>`;
        html += `<div class="ind full-width" style="opacity: 0.8;">PRĘDKOŚĆ OBR: ${Math.abs(actualSpeed).toFixed(1)} °/s</div>`;
    }

    // --- Status Kalibracji / Zasilania ---
    if (fullData.LW1_KL30_Ausfall === 1) {
        html += `<div class="ind active-orange full-width">WYKRYTO ODPIĘCIE AKUMULATORA (KL30)</div>`;
    } else if (fullData.LW1_ID === 0) {
        html += `<div class="ind active-orange full-width">WYMAGANA KALIBRACJA G85</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x3E1 (mClima_1 - Główna ramka klimatyzacji)
function decodeClima1Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (20 sygnałów)
    const fullData = {
        "CL1_Drehzahlanhebung": extractCANSignal(hexData, 0, 1),
        "CL1_Zuheizer": extractCANSignal(hexData, 1, 1),
        "CL1_HzgHeckscheibe": extractCANSignal(hexData, 2, 1),
        "CL1_HzgFrontscheibe": extractCANSignal(hexData, 3, 1),
        "CL1_Kompressor": extractCANSignal(hexData, 4, 1),
        "CL1_Heizung_aus": extractCANSignal(hexData, 5, 1),
        "CL1_Kompressormoment_alt": extractCANSignal(hexData, 6, 1),
        "CL1_Kaeltemitteldruck_alt": extractCANSignal(hexData, 7, 1),
        "CL1_AussenTemp": extractCANSignal(hexData, 8, 8, 0.5, -50),        // Temp zewnętrzna (podszybie)
        "CL1_KaeltemittelDruck": extractCANSignal(hexData, 16, 8, 0.2, 0),  // Ciśnienie czynnika
        "CL1_Last_Kompressor": extractCANSignal(hexData, 24, 8, 0.25, 0),   // Obciążenie kompresora (Nm)
        "CL1_Geblaeselast": extractCANSignal(hexData, 32, 8, 0.4, 0),       // Dmuchawa nawiewu (%)
        "CL1_Strg_Kluefter": extractCANSignal(hexData, 40, 8, 0.4, 0),      // Wysterowanie wentylatora chłodnicy (%)
        "CL1_Temp_in_F": extractCANSignal(hexData, 48, 1),                  // Czy na ekranie są Fahrenheity
        "CL1_AC_Schalter": extractCANSignal(hexData, 49, 1),                // Wciśnięty przycisk AC na panelu
        "CL1_WAPU_Zuschaltung": extractCANSignal(hexData, 50, 1),           // Pompa wody (0 = włączona, 1 = wyłączona)
        "CL1_Restwaerme": extractCANSignal(hexData, 51, 1),                 // Funkcja odzysku ciepła resztkowego
        "CL1_PTC_Clima": extractCANSignal(hexData, 52, 3, 25, 0),           // Nagrzewnica elektryczna PTC (%)
        "CL1_KD_Fehler": extractCANSignal(hexData, 55, 1),                  // Flaga błędu serwisowego
        "KL_Thermomanagement": extractCANSignal(hexData, 56, 2)             // Zarządzanie ciepłem (stopnie)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Przycisk AC i stan kompresora ---
    if (fullData.CL1_Kompressor === 1) {
        html += `<div class="ind active-blue full-width">KLIMATYZACJA (KOMPRESOR): WŁĄCZONA</div>`;
        cardElement.style.borderColor = "var(--blue)";
    } else if (fullData.CL1_AC_Schalter === 1) {
        html += `<div class="ind active-orange full-width">TRYB AC WŁ (KOMPRESOR ZATRZYMANY)</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else {
        html += `<div class="ind full-width">KLIMATYZACJA: WYŁ (AC OFF)</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- Ciśnienie czynnika chłodniczego ---
    // Wartość szesnastkowa FF (255) oznacza błąd (255 * 0.2 = 51)
    if (fullData.CL1_KaeltemittelDruck > 50) {
        html += `<div class="ind active-error">CIŚNIENIE: BŁĄD!</div>`;
    } else {
        // Dodajemy delikatne kolorowanie ostrzegawcze jeśli ciśnienie jest za niskie (np. brak czynnika) lub za wysokie
        let pressColor = "";
        if (fullData.CL1_Kompressor === 1 && fullData.CL1_KaeltemittelDruck < 2.0) pressColor = "active-error";
        
        html += `<div class="ind ${pressColor}">CIŚNIENIE: ${fullData.CL1_KaeltemittelDruck.toFixed(1)} bar</div>`;
    }

    // --- Moc Dmuchawy (Nawiew) ---
    if (fullData.CL1_Geblaeselast > 100) {
        html += `<div class="ind active-error">NAWIEW: BŁĄD</div>`;
    } else if (fullData.CL1_Geblaeselast > 0) {
        html += `<div class="ind active">NAWIEW: ${fullData.CL1_Geblaeselast.toFixed(0)}%</div>`;
    } else {
        html += `<div class="ind">NAWIEW: OFF</div>`;
    }

    // --- Ogrzewanie szyb ---
    if (fullData.CL1_HzgFrontscheibe === 1 || fullData.CL1_HzgHeckscheibe === 1) {
        let glass = "";
        if (fullData.CL1_HzgFrontscheibe === 1) glass += "PRZÓD ";
        if (fullData.CL1_HzgHeckscheibe === 1) glass += "TYŁ";
        html += `<div class="ind active-orange full-width">GRZANIE SZYBY: ${glass}</div>`;
    }

    // --- Nagrzewnica Elektryczna (PTC) ---
    if (fullData.CL1_PTC_Clima > 0) {
        html += `<div class="ind active-orange full-width" style="animation: blink 1s infinite;">NAGRZEWNICA PTC AKTYWNA: ${fullData.CL1_PTC_Clima}%</div>`;
    }

    // --- Temperatura Zewnętrzna (Podszybie) ---
    if (fullData.CL1_AussenTemp > 77) {
        html += `<div class="ind active-error full-width">TEMP. ZEWN: BŁĄD CZUJNIKA</div>`;
    } else {
        html += `<div class="ind active full-width" style="font-size: 1.1em;">TEMP. ZEWN: ${fullData.CL1_AussenTemp.toFixed(1)} °C</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x3E3 (mClima_2 - Dodatkowe parametry klimatyzacji)
function decodeClima2Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (12 sygnałów)
    const fullData = {
        "CL2_Sonne_links": extractCANSignal(hexData, 0, 8, 4, 0),            // Czujnik nasłonecznienia lewy (W/m^2)
        "CL2_Sonne_rechts": extractCANSignal(hexData, 8, 8, 4, 0),           // Czujnik nasłonecznienia prawy (W/m^2)
        "CL2_InnenTemp": extractCANSignal(hexData, 16, 8, 0.5, -50),         // Temperatura wnętrza kabiny (°C)
        "CL2_SitzH_links": extractCANSignal(hexData, 24, 3),                 // Grzanie fotela lewego (0-6)
        "CL2_SitzH_rechts": extractCANSignal(hexData, 27, 3),                // Grzanie fotela prawego (0-6)
        "CL2_StSt_Info": extractCANSignal(hexData, 30, 2),                   // Info dla systemu Start-Stop
        "CL2_SH": extractCANSignal(hexData, 32, 1),                          // Ogrzewanie postojowe (Standheizung)
        "CL2_SL_LED": extractCANSignal(hexData, 33, 1),                      // Kontrolka wentylacji postojowej
        "CL2_Geblaese_plus": extractCANSignal(hexData, 34, 1),               // Podbicie nawiewu dla Webasto
        "CL2_Umluft_Taste": extractCANSignal(hexData, 39, 1),                // Przycisk obiegu zamkniętego
        "CL2_Solltemperatur": extractCANSignal(hexData, 40, 8),              // Wymagana temperatura dla radia/navi
        "CL2_Vorgabe_KWTemp": extractCANSignal(hexData, 56, 8, 0.75, -48)    // Wymagana temp. płynu chłodzącego
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Temperatura Wnętrza ---
    // Wartość 255 (czyli po przeliczeniu 77.5) oznacza błąd czujnika
    if (fullData.CL2_InnenTemp > 76) {
        html += `<div class="ind active-error full-width">TEMP. WNĘTRZA: BŁĄD CZUJNIKA</div>`;
    } else {
        html += `<div class="ind active full-width" style="font-size: 1.1em;">TEMP. WNĘTRZA: ${fullData.CL2_InnenTemp.toFixed(1)} °C</div>`;
    }

    // --- Podgrzewanie Foteli ---
    if (fullData.CL2_SitzH_links > 0 || fullData.CL2_SitzH_rechts > 0) {
        let seatL = fullData.CL2_SitzH_links > 0 ? `L:${fullData.CL2_SitzH_links}` : `L:WYŁ`;
        let seatR = fullData.CL2_SitzH_rechts > 0 ? `P:${fullData.CL2_SitzH_rechts}` : `P:WYŁ`;
        html += `<div class="ind active-orange full-width">GRZANIE FOTELI - ${seatL} | ${seatR}</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else {
        html += `<div class="ind full-width">GRZANIE FOTELI: WYŁ</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- Obieg Zamknięty ---
    if (fullData.CL2_Umluft_Taste === 1) {
        html += `<div class="ind active-blue">OBIEG ZAMKNIĘTY</div>`;
    } else {
        html += `<div class="ind">OBIEG ZEWNĘTRZNY</div>`;
    }

    // --- Ogrzewanie Postojowe (Webasto) ---
    if (fullData.CL2_SH === 1) {
        html += `<div class="ind active-red" style="animation: blink 1s infinite;">WEBASTO WŁĄCZONE!</div>`;
    }

    // --- Czujniki Nasłonecznienia ---
    // Pokazujemy na kafelku informacje tylko wtedy, gdy auto faktycznie "czuje" mocne słońce (> 100 W/m^2)
    // Maksymalna wartość błędu to 1020 W/m^2 (255 * 4)
    if (fullData.CL2_Sonne_links < 1020 && fullData.CL2_Sonne_rechts < 1020) {
        if (fullData.CL2_Sonne_links > 100 || fullData.CL2_Sonne_rechts > 100) {
            html += `<div class="ind active-orange full-width">SŁOŃCE (W/m²): L: ${fullData.CL2_Sonne_links} | P: ${fullData.CL2_Sonne_rechts}</div>`;
        }
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x42B (mNM_Gateway_I - Zarządzanie usypianiem/budzeniem)
function decodeNMGatewayIData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (19 sygnałów)
    const fullData = {
        "NMGW_I_Receiver": extractCANSignal(hexData, 0, 8),
        "NMGW_I_CmdRing": extractCANSignal(hexData, 8, 1),
        "NMGW_I_CmdAlive": extractCANSignal(hexData, 9, 1),
        "NMGW_I_CmdLimpHome": extractCANSignal(hexData, 10, 1),
        "NMGW_I_SleepInd": extractCANSignal(hexData, 12, 1),
        "NMGW_I_SleepAck": extractCANSignal(hexData, 13, 1),
        "NMGW_I_Kl_30_Reset": extractCANSignal(hexData, 20, 1),
        "NMGW_I_Fkt_Nachlauf": extractCANSignal(hexData, 21, 1),
        "NMGW_I_NWake": extractCANSignal(hexData, 22, 1),
        "NMGW_I_CAN": extractCANSignal(hexData, 23, 1),
        "NMGW_I_Wake_Up_Ltg": extractCANSignal(hexData, 24, 1),
        "NMGW_I_Komfort_CAN": extractCANSignal(hexData, 25, 1),
        "NMGW_I_Info_CAN": extractCANSignal(hexData, 26, 1),
        "NMGW_I_Kl_15": extractCANSignal(hexData, 30, 1),
        "NMGW_I_Diag_CAN": extractCANSignal(hexData, 31, 1),
        "NMGW_I_LIN1": extractCANSignal(hexData, 32, 1),
        "NMGW_I_LIN2": extractCANSignal(hexData, 33, 1),
        "NMGW_I_WakeUp2": extractCANSignal(hexData, 34, 6),
        "NMGW_I_WakeUp3": extractCANSignal(hexData, 40, 8)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Stan Magistrali (Uśpienie / Wybudzenie) ---
    // Jeśli wskazanie usypiania i potwierdzenie są aktywne:
    if (fullData.NMGW_I_SleepInd === 1 && fullData.NMGW_I_SleepAck === 1) {
        html += `<div class="ind active-blue full-width" style="animation: blink 1s infinite;">MAGISTRALA: USYPIANIE (SLEEP)</div>`;
        cardElement.style.borderColor = "var(--blue)";
    } else if (fullData.NMGW_I_SleepInd === 1 || fullData.NMGW_I_SleepAck === 1) {
        html += `<div class="ind active-orange full-width">MAGISTRALA: ŻĄDANIE UŚPIENIA</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else {
        html += `<div class="ind active-green full-width">MAGISTRALA: AKTYWNA (AWAKE)</div>`;
        cardElement.style.borderColor = "var(--green)";
    }

    // --- Przyczyny Wybudzenia (Weckursache) ---
    // Zbieramy do tablicy wszystkie aktywne flagi "Weckursache"
    let wakeReasons = [];
    if (fullData.NMGW_I_Kl_15 === 1) wakeReasons.push("ZAPŁON (KL.15)");
    if (fullData.NMGW_I_Komfort_CAN === 1) wakeReasons.push("CAN KOMFORT");
    if (fullData.NMGW_I_Info_CAN === 1) wakeReasons.push("CAN INFO");
    if (fullData.NMGW_I_Diag_CAN === 1) wakeReasons.push("CAN DIAGNOSTYKA");
    if (fullData.NMGW_I_CAN === 1) wakeReasons.push("CAN (OGÓLNY)");
    if (fullData.NMGW_I_Kl_30_Reset === 1) wakeReasons.push("RESET ZASILANIA");
    if (fullData.NMGW_I_Wake_Up_Ltg === 1) wakeReasons.push("LINIA WAKE-UP");

    if (wakeReasons.length > 0) {
        html += `<div class="ind active full-width" style="font-size: 0.9em;">WAKE-UP: ${wakeReasons.join(', ')}</div>`;
    }

    // --- Tryb Awaryjny (Limp Home) ---
    if (fullData.NMGW_I_CmdLimpHome === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite;">TRYB AWARYJNY (LIMP HOME)!</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x470 (mBSG_Kombi - Interakcje z nadwoziem i oświetleniem)
function decodeBSGKombiData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (44 sygnały!)
    const fullData = {
        "BSK_Blk_links": extractCANSignal(hexData, 0, 1),
        "BSK_Blk_rechts": extractCANSignal(hexData, 1, 1),
        "BSK_Anhaenger": extractCANSignal(hexData, 2, 1),
        "BSK_Warnblinker": extractCANSignal(hexData, 3, 1),
        "BSK_DWA_Akku": extractCANSignal(hexData, 4, 1),
        "BSK_Rueckfahrlicht": extractCANSignal(hexData, 5, 1),
        "BSK_Sammelfehler_AKI": extractCANSignal(hexData, 6, 1),
        "BSK_Ladekontrollampe": extractCANSignal(hexData, 7, 1),
        "BSK_FT_geoeffnet": extractCANSignal(hexData, 8, 1),             // Drzwi kierowcy
        "BSK_BT_geoeffnet": extractCANSignal(hexData, 9, 1),             // Drzwi pasażera
        "BSK_HL_geoeffnet": extractCANSignal(hexData, 10, 1),            // Drzwi tył lewe
        "BSK_HR_geoeffnet": extractCANSignal(hexData, 11, 1),            // Drzwi tył prawe
        "BSK_MH_geoeffnet": extractCANSignal(hexData, 12, 1),            // Maska silnika
        "BSK_HD_Hauptraste": extractCANSignal(hexData, 13, 1),           // Bagażnik (zamek główny)
        "BSK_HD_Vorraste": extractCANSignal(hexData, 14, 1),             // Bagażnik (przed-rygiel)
        "BSK_Unterspannung": extractCANSignal(hexData, 15, 1),           // Niskie napięcie
        "BSK_Display": extractCANSignal(hexData, 16, 7),                 // Ściemnianie zegarów (%)
        "BSK_Display_def": extractCANSignal(hexData, 23, 1),
        "BSK_Klemme_58t": extractCANSignal(hexData, 24, 7),
        "BSK_Klemme_58t_def": extractCANSignal(hexData, 31, 1),
        "BSK_Interlock": extractCANSignal(hexData, 32, 1),               // Wciśnij sprzęgło by odpalić
        "BSK_Buzzer": extractCANSignal(hexData, 33, 1),
        "BSK_Ruecks_HL_verriegelt": extractCANSignal(hexData, 34, 1),    // Oparcie kanapy zablokowane (L)
        "BSK_Ruecks_HR_verriegelt": extractCANSignal(hexData, 35, 1),    // Oparcie kanapy zablokowane (P)
        "BSK_Def_Lampe": extractCANSignal(hexData, 36, 1),               // Spalona żarówka
        "BSK_NSL_LED_Pfad": extractCANSignal(hexData, 37, 1),
        "BSK_AFL_defekt": extractCANSignal(hexData, 38, 1),              // Błąd świateł AUTO
        "BSK_BSG_defekt": extractCANSignal(hexData, 39, 1),              // Awaria BCM
        "BSK_Standlicht": extractCANSignal(hexData, 40, 1),              // Postojówki
        "BSK_Parklicht_links": extractCANSignal(hexData, 41, 1),         // Parkingowe L
        "BSK_Parklicht_rechts": extractCANSignal(hexData, 42, 1),        // Parkingowe P
        "BSK_Abblendlicht": extractCANSignal(hexData, 43, 1),            // Mijania
        "BSK_Nebellicht": extractCANSignal(hexData, 44, 1),              // Przeciwmgielne przód
        "BSK_Heckscheibenhzg": extractCANSignal(hexData, 45, 1),
        "BSK_Tankklappe": extractCANSignal(hexData, 46, 1),              // Klapka paliwa otwarta
        "BSK_FFB_Bat": extractCANSignal(hexData, 47, 1),                 // Słaba bateria w pilocie
        "BSK_FLA_Soft_LED": extractCANSignal(hexData, 48, 1),            // Asystent długich świateł
        "BSK_FLA_Sensor_blockiert": extractCANSignal(hexData, 49, 1),
        "BSK_FLA_Defekt": extractCANSignal(hexData, 50, 1),
        "BCM_Remotestart_Betrieb": extractCANSignal(hexData, 55, 1),
        "BSK_Ruhespannung": extractCANSignal(hexData, 56, 5, 0.1, 10.5), // Napięcie w Voltoach
        "BSK_Nebelschlusslicht": extractCANSignal(hexData, 61, 1),       // Przeciwmgielne tył
        "BSK_Fernlicht": extractCANSignal(hexData, 62, 1),               // Drogowe (Długie)
        "BSK_Tagfahrlicht": extractCANSignal(hexData, 63, 1)             // DRL (Światła dzienne)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- DRZWI, MASKA I BAGAŻNIK ---
    let openDoors = [];
    if (fullData.BSK_FT_geoeffnet === 1) openDoors.push("KIER");
    if (fullData.BSK_BT_geoeffnet === 1) openDoors.push("PAS");
    if (fullData.BSK_HL_geoeffnet === 1) openDoors.push("TYŁ-L");
    if (fullData.BSK_HR_geoeffnet === 1) openDoors.push("TYŁ-P");

    if (fullData.BSK_MH_geoeffnet === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite;">MASKA SILNIKA OTARTA!</div>`;
    }

    if (fullData.BSK_HD_Hauptraste === 1) {
        html += `<div class="ind active-orange full-width">BAGAŻNIK OTWARTY</div>`;
    }

    if (openDoors.length > 0) {
        html += `<div class="ind active-error full-width">OTWARTE DRZWI: ${openDoors.join(', ')}</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else if (fullData.BSK_MH_geoeffnet === 0 && fullData.BSK_HD_Hauptraste === 0) {
        html += `<div class="ind full-width">ZAMKNIĘTY (NADWOZIE OK)</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- KIERUNKOWSKAZY / AWARYJNE ---
    if (fullData.BSK_Warnblinker === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite;">&#8592; ŚWIATŁA AWARYJNE &#8594;</div>`;
    } else if (fullData.BSK_Blk_links === 1) {
        html += `<div class="ind active-green" style="animation: blink 0.5s infinite;">&#8592; KIERUNKOWSKAZ</div>`;
    } else if (fullData.BSK_Blk_rechts === 1) {
        html += `<div class="ind active-green" style="animation: blink 0.5s infinite;">KIERUNKOWSKAZ &#8594;</div>`;
    }

    // --- OŚWIETLENIE ZEWNĘTRZNE ---
    let lights = [];
    if (fullData.BSK_Abblendlicht === 1) lights.push("MIJANIA");
    if (fullData.BSK_Fernlicht === 1) lights.push("DROGOWE");
    if (fullData.BSK_Tagfahrlicht === 1) lights.push("DZIENNE (DRL)");
    if (fullData.BSK_Standlicht === 1) lights.push("POSTOJOWE");
    if (fullData.BSK_Nebellicht === 1) lights.push("HALOGENY");
    if (fullData.BSK_Nebelschlusslicht === 1) lights.push("P.MGIELNE TYŁ");
    
    if (lights.length > 0) {
        html += `<div class="ind active-green full-width">ŚWIATŁA: ${lights.join(', ')}</div>`;
    }

    // --- OSTRZEŻENIA I BŁĘDY EKSPLOATACYJNE ---
    if (fullData.BSK_Def_Lampe === 1) {
        html += `<div class="ind active-orange full-width">SPALONA ŻARÓWKA!</div>`;
    }
    if (fullData.BSK_Tankklappe === 1) {
        html += `<div class="ind active-orange full-width">KLAPKA PALIWA OTWARTA</div>`;
    }
    if (fullData.BSK_FFB_Bat === 1) {
        html += `<div class="ind active-orange full-width">SŁABA BATERIA PILOTA</div>`;
    }
    
    // --- AKUMULATOR / ŁADOWANIE ---
    if (fullData.BSK_Ladekontrollampe === 1 || fullData.BSK_Unterspannung === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.2s infinite;">BRAK ŁADOWANIA / NISKIE NAPIĘCIE!</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x527 (mGW_Kombi - Dane z Gatewaya do liczników)
function decodeGWKombiData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (14 sygnałów)
    const fullData = {
        "GWK_Alt_3_Kombi": extractCANSignal(hexData, 0, 1),
        "GWK_Alt_2_Kombi": extractCANSignal(hexData, 1, 1),
        "GWK_Alt_1_Kombi": extractCANSignal(hexData, 2, 1),
        "GWK_Reifenumfang_empf": extractCANSignal(hexData, 4, 1),
        "GWK_FzgGeschw_Quelle": extractCANSignal(hexData, 8, 1),                     // Źródło prędkości: 0=Impulsator, 1=ABS
        "GWK_FzgGeschw": extractCANSignal(hexData, 9, 15, 0.01, 0),                  // Prędkość (km/h)
        "GWK_Umfang_Reifen": extractCANSignal(hexData, 28, 12),                      // Obwód opony (mm)
        "GWK_AussenTemp_gefiltert": extractCANSignal(hexData, 40, 8, 0.5, -50),      // Temperatura wygładzona dla FIS (°C)
        "GWK_AussenTemp_ungefiltert": extractCANSignal(hexData, 48, 8, 0.5, -50),    // Temperatura surowa (°C)
        "GWK_AussenTemp_Fehler": extractCANSignal(hexData, 56, 1),                   // Błąd czujnika temperatury
        "GWK_Warn_Heiss": extractCANSignal(hexData, 57, 1),                          // Ostrzeżenie o gorącym silniku
        "GWK_Passiv_Autolock": extractCANSignal(hexData, 58, 1),                     // Funkcja Autolock (zamki drzwi)
        "GWK_WFS_Schl_Ort": extractCANSignal(hexData, 59, 1),                        // Typ kluczyka (0=Keyless, 1=Pętla immo)
        "KB1_Lenkh_Lampe": extractCANSignal(hexData, 60, 1)                          // Kontrolka wspomagania (kierownica)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Kontrolka Wspomagania Układu Kierowniczego ---
    if (fullData.KB1_Lenkh_Lampe === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite;">BŁĄD WSPOMAGANIA (KONTROLKA)</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        html += `<div class="ind active-green full-width">WSPOMAGANIE OK</div>`;
        cardElement.style.borderColor = "var(--green)";
    }

    // --- Prędkość Pojazdu i Źródło ---
    // Wartość powyżej 326 km/h traktujemy jako błąd (zgodnie z max zakresem pomiaru)
    if (fullData.GWK_FzgGeschw > 326) {
        html += `<div class="ind active-error">PRĘDKOŚĆ: BŁĄD</div>`;
    } else {
        let speedSrc = fullData.GWK_FzgGeschw_Quelle === 1 ? "(ABS)" : "(Skrzynia)";
        html += `<div class="ind active">PRĘDKOŚĆ: ${fullData.GWK_FzgGeschw.toFixed(1)} km/h ${speedSrc}</div>`;
    }

    // --- Temperatura Zewnętrzna (Przefiltrowana) ---
    // Kod błędu dla wartości przed przeliczeniem to 255 (czyli po wzorze 77.5)
    if (fullData.GWK_AussenTemp_Fehler === 1 || fullData.GWK_AussenTemp_gefiltert > 76) {
        html += `<div class="ind active-error">TEMP: BŁĄD CZUJNIKA</div>`;
    } else {
        html += `<div class="ind active" style="font-weight: bold;">TEMP: ${fullData.GWK_AussenTemp_gefiltert.toFixed(1)} °C</div>`;
    }

    // --- Status Kluczyka / Immo ---
    if (fullData.GWK_WFS_Schl_Ort === 0) {
        html += `<div class="ind active-blue full-width">KESSY (KEYLESS) AKTYWNE</div>`;
    } else {
        html += `<div class="ind full-width">KLUCZYK (PĘTLA IMMO)</div>`;
    }

    // --- Funkcje Dodatkowe ---
    if (fullData.GWK_Passiv_Autolock === 1) {
        html += `<div class="ind active-orange full-width">AUTOLOCK (Ryglowanie 15 km/h) AKTYWNY</div>`;
    }

    if (fullData.GWK_Warn_Heiss === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.2s infinite;">OSTRZEŻENIE: SILNIK GORĄCY!</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x555 (mMotor7 - Dodatkowa ramka silnika)
function decodeMotor7Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (22 sygnały)
    const fullData = {
        "MO7_LL_Status": extractCANSignal(hexData, 0, 1),
        "MO7_V_Begrenz": extractCANSignal(hexData, 1, 1),
        "MO7_V_Begr_akt": extractCANSignal(hexData, 2, 1),
        "MO7_FehlerSp": extractCANSignal(hexData, 3, 1),
        "MO7_Fehler_Oel_Temp": extractCANSignal(hexData, 4, 1),
        "MO7_PTC": extractCANSignal(hexData, 5, 3),
        "MO7_DFM": extractCANSignal(hexData, 8, 8, 0.4, 0),
        "MO7_Hoeheninfo": extractCANSignal(hexData, 16, 8, 0.0078125, 0),
        "MO7_Gradient_Drehz": extractCANSignal(hexData, 24, 7),
        "MO7_Gradient_Vorz": extractCANSignal(hexData, 31, 1),
        "MO7_Ladedruckneu": extractCANSignal(hexData, 32, 8, 0.02, 0),
        "MO7_GenLoadResp": extractCANSignal(hexData, 40, 2, 3, 0),
        "MO7_PTC_bereit": extractCANSignal(hexData, 42, 2),
        "MO7_Mot_weckfaehig": extractCANSignal(hexData, 44, 1),
        "MO7_Zus_Kuehl": extractCANSignal(hexData, 45, 1),
        "MO7_Sleep_Ind": extractCANSignal(hexData, 46, 1),
        "MO7_Rueck_LLDz": extractCANSignal(hexData, 47, 1),
        "MO7_Last_abwurf": extractCANSignal(hexData, 48, 2),
        "MO7_Ein_Generator": extractCANSignal(hexData, 50, 1),
        "MO7_Lastabwurf_Heiz": extractCANSignal(hexData, 51, 1),
        "MO7_Stat_Gluehk": extractCANSignal(hexData, 52, 4, 8, 0),
        "MO7_Oeltemperatur": extractCANSignal(hexData, 56, 8, 1, -60)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Ciśnienie doładowania (Turbo) ---
    // Wartość 255 (czyli po przeliczeniu 5.10) to błąd
    if (fullData.MO7_Ladedruckneu > 5.0) {
        html += `<div class="ind active-error full-width">DOŁADOWANIE (TURBO): BŁĄD CZUJNIKA</div>`;
    } else {
        html += `<div class="ind active full-width" style="font-size: 1.1em; color: var(--blue); border-color: var(--blue);">ZADANE TURBO: ${fullData.MO7_Ladedruckneu.toFixed(2)} bar</div>`;
    }

    // --- Temperatura Oleju ---
    // 255 to błąd 
    if (fullData.MO7_Fehler_Oel_Temp === 1 || fullData.MO7_Oeltemperatur > 194) {
         html += `<div class="ind active-error full-width">TEMP. OLEJU: BŁĄD CZUJNIKA</div>`;
    } else if (fullData.MO7_Oeltemperatur === -59) {
         // Wartość "0" odczytana z CAN i odjęcie 60 to init (-60)
         // Wartość 1 z CAN oznacza Init (czyli po odjęciu 60 da nam -59) 
         html += `<div class="ind full-width">TEMP. OLEJU: INICJALIZACJA</div>`;
    } else if (fullData.MO7_Oeltemperatur === -60) {
         html += `<div class="ind full-width">TEMP. OLEJU: NIE ZAMONTOWANO</div>`;
    } else {
        let tempColor = "var(--text-color)";
        if (fullData.MO7_Oeltemperatur < 70) tempColor = "var(--blue)";
        else if (fullData.MO7_Oeltemperatur > 120) tempColor = "var(--red)";
        else tempColor = "var(--orange)";

        html += `<div class="ind full-width" style="border-color: ${tempColor}; color: ${tempColor};">TEMP. OLEJU: ${fullData.MO7_Oeltemperatur} °C</div>`;
    }

    // --- Gradient obrotów silnika (przyspieszenie) ---
    let gradient = fullData.MO7_Gradient_Drehz;
    if (fullData.MO7_Gradient_Vorz === 1) gradient = -gradient; // ujemny spadek obrotów
    
    if (fullData.MO7_Gradient_Drehz >= 127) {
        html += `<div class="ind full-width">PRZYSPIESZENIE RPM: MAX (>127)</div>`;
    } else {
        // Zaznaczamy na zielono gdy rośnie, a na czerwono jak hamujesz silnikiem
        let gradColor = gradient > 0 ? "active-green" : (gradient < 0 ? "active-error" : "");
        html += `<div class="ind ${gradColor} full-width">RPM Δ (t-20ms): ${gradient}</div>`;
    }
    
    // --- Generator / Alternator ---
    // Gdy generator nie ładuje po starcie silnika, wyrzucamy błąd
    if (fullData.MO7_Ein_Generator === 1) {
        html += `<div class="ind active-green full-width">ALTERNATOR WŁĄCZONY (OBCIĄŻ. DFM: ${fullData.MO7_DFM.toFixed(1)}%)</div>`;
    } else {
        html += `<div class="ind active-error full-width">ALTERNATOR: WYŁĄCZONY!</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x557 (mKD_Error - Flagi błędów modułów)
function decodeKDErrorData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (62 moduły!)
    const fullData = {
        "EKD_Motor_A": extractCANSignal(hexData, 0, 1),
        "EKD_Getriebe_A": extractCANSignal(hexData, 1, 1),
        "EKD_Bremse_A": extractCANSignal(hexData, 2, 1),
        "EKD_Kombi_A": extractCANSignal(hexData, 3, 1),
        "EKD_LSM_A": extractCANSignal(hexData, 4, 1),
        "EKD_Airbag_A": extractCANSignal(hexData, 5, 1),
        "EKD_Lenkhilfe_A": extractCANSignal(hexData, 6, 1),
        "EKD_dyn_LWR_A": extractCANSignal(hexData, 7, 1),
        "EKD_Niveau_A": extractCANSignal(hexData, 8, 1),
        "EKD_Allrad_A": extractCANSignal(hexData, 9, 1),
        "EKD_ADR_Sensor_A": extractCANSignal(hexData, 10, 1),
        "EKD_ADR_getrennt": extractCANSignal(hexData, 11, 1),
        "EKD_Parkbremse_A": extractCANSignal(hexData, 12, 1),
        "EKD_EZS_A": extractCANSignal(hexData, 13, 1),
        "EKD_Daempfer_A": extractCANSignal(hexData, 14, 1),
        "EKD_Quersperre": extractCANSignal(hexData, 15, 1),
        "EKD_Motor_Slave_A": extractCANSignal(hexData, 16, 1),
        "EKD_SWA_A": extractCANSignal(hexData, 17, 1),
        "EKD_LDW_A": extractCANSignal(hexData, 18, 1),
        "EKD_RKA_Plus_A": extractCANSignal(hexData, 19, 1),
        "EKD_PLA_A": extractCANSignal(hexData, 20, 1),
        "EKD_WFS_KBI": extractCANSignal(hexData, 21, 1),
        "EKD_Kombi_KBI": extractCANSignal(hexData, 22, 1),
        "EKD_BSG_K": extractCANSignal(hexData, 24, 1),
        "EKD_KSG_K": extractCANSignal(hexData, 25, 1),
        "EKD_TSG_FT_K": extractCANSignal(hexData, 26, 1),
        "EKD_TSG_BT_K": extractCANSignal(hexData, 27, 1),
        "EKD_TSG_HL_K": extractCANSignal(hexData, 28, 1),
        "EKD_TSG_HR_K": extractCANSignal(hexData, 29, 1),
        "EKD_Memory_K": extractCANSignal(hexData, 30, 1),
        "EKD_Dachmodul_K": extractCANSignal(hexData, 31, 1),
        "EKD_Zentralelektrik_II_K": extractCANSignal(hexData, 32, 1),
        "EKD_RDK_K": extractCANSignal(hexData, 33, 1),
        "EKD_SMLS_K": extractCANSignal(hexData, 34, 1),
        "EKD_Gateway_K": extractCANSignal(hexData, 35, 1),
        "EKD_Clima_K": extractCANSignal(hexData, 36, 1),
        "EKD_APS_K": extractCANSignal(hexData, 37, 1),
        "EKD_PTC_Heizung_K": extractCANSignal(hexData, 38, 1),
        "EKD_Standhzg_K": extractCANSignal(hexData, 39, 1),
        "EKD_VSG_K": extractCANSignal(hexData, 40, 1),
        "EKD_RSE_I": extractCANSignal(hexData, 41, 1),
        "EKD_Wischer_K": extractCANSignal(hexData, 42, 1),
        "EKD_MDI_I": extractCANSignal(hexData, 43, 1),
        "EKD_AAG_K": extractCANSignal(hexData, 44, 1),
        "EKD_Mem_BF_K": extractCANSignal(hexData, 45, 1),
        "EKD_Easy_Entry_VF": extractCANSignal(hexData, 46, 1),
        "EKD_Easy_Entry_VB": extractCANSignal(hexData, 47, 1),
        "EKD_Heckdeckel_K": extractCANSignal(hexData, 48, 1),
        "EKD_Rearview_I": extractCANSignal(hexData, 49, 1),
        "EKD_Sonderfahrzeug_SG_K": extractCANSignal(hexData, 50, 1),
        "EKD_Tastenmodul_I": extractCANSignal(hexData, 51, 1),
        "EKD_Kompass_I": extractCANSignal(hexData, 52, 1),
        "EKD_WFS_K": extractCANSignal(hexData, 53, 1),
        "EKD_GSM_Pager_I": extractCANSignal(hexData, 54, 1),
        "EKD_DSP_I": extractCANSignal(hexData, 56, 1),
        "EKD_DAB_I": extractCANSignal(hexData, 57, 1),
        "EKD_Telematik_I": extractCANSignal(hexData, 58, 1),
        "EKD_Navigation_I": extractCANSignal(hexData, 59, 1),
        "EKD_TV_Tuner_I": extractCANSignal(hexData, 60, 1),
        "EKD_Neigungsmodul": extractCANSignal(hexData, 61, 1),
        "EKD_Radio_I": extractCANSignal(hexData, 62, 1),
        "EKD_Telefon_I": extractCANSignal(hexData, 63, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;
    let activeErrors = [];

    // Logika wykrywania błędów dla czytelności zmapowana na przyjazne nazwy
    if (fullData.EKD_Motor_A) activeErrors.push("SILNIK (01)");
    if (fullData.EKD_Getriebe_A) activeErrors.push("SKRZYNIA (02)");
    if (fullData.EKD_Bremse_A) activeErrors.push("ABS/ESP (03)");
    if (fullData.EKD_Lenkhilfe_A) activeErrors.push("WSPOMAGANIE (44)");
    if (fullData.EKD_Airbag_A) activeErrors.push("AIRBAG (15)");
    if (fullData.EKD_Kombi_A || fullData.EKD_Kombi_KBI) activeErrors.push("LICZNIKI (17)");
    if (fullData.EKD_Gateway_K) activeErrors.push("GATEWAY (19)");
    if (fullData.EKD_BSG_K) activeErrors.push("BORDNETZ/BCM (09)");
    if (fullData.EKD_KSG_K) activeErrors.push("MODUŁ KOMFORTU (46)");
    if (fullData.EKD_Clima_K) activeErrors.push("CLIMATRONIC (08)");
    if (fullData.EKD_LSM_A || fullData.EKD_SMLS_K) activeErrors.push("KOLUMNA KIER. (16)");
    if (fullData.EKD_TSG_FT_K || fullData.EKD_TSG_BT_K || fullData.EKD_TSG_HL_K || fullData.EKD_TSG_HR_K) activeErrors.push("MODUŁY DRZWI");
    if (fullData.EKD_Radio_I || fullData.EKD_Navigation_I || fullData.EKD_DSP_I) activeErrors.push("INFOTAINMENT (56/37)");
    if (fullData.EKD_Wischer_K) activeErrors.push("WYCIERACZKI");
    if (fullData.EKD_Allrad_A) activeErrors.push("HALDEX (22)");
    if (fullData.EKD_Parkbremse_A) activeErrors.push("HAMULEC RĘCZNY (53)");
    if (fullData.EKD_dyn_LWR_A) activeErrors.push("XENON/AFS (55)");

    // --- Wizualizacja Błędów ---
    if (activeErrors.length > 0) {
        html += `<div class="ind active-error full-width" style="animation: blink 1s infinite; font-weight: bold;">WYKRYTO BŁĘDY (DTC)!</div>`;
        
        // Wypisanie skróconej listy modułów z usterkami
        html += `<div class="ind active-error full-width" style="font-size: 0.8em;">Moduły: ${activeErrors.join(', ')}</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        html += `<div class="ind active-green full-width" style="font-weight: bold;">SKANOWANIE OK - BRAK BŁĘDÓW</div>`;
        cardElement.style.borderColor = "var(--green)";
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x571 (mBSG_2 - Zarządzanie zasilaniem i akumulator)
function decodeBSG2Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (30 sygnałów)
    const fullData = {
        "BS2_U_BATT": extractCANSignal(hexData, 0, 8, 0.05, 5),
        "BS2_Heckscheibe_aus": extractCANSignal(hexData, 8, 1),
        "BS2_Frontscheibe_aus": extractCANSignal(hexData, 9, 1),
        "BS2_Aussenspiegel_aus": extractCANSignal(hexData, 10, 1),
        "BS2_Sitzheizung_aus": extractCANSignal(hexData, 11, 1),
        "BS2_aus_Lenkradheizung": extractCANSignal(hexData, 12, 1),
        "BS2_aus_Wischwasserhzg": extractCANSignal(hexData, 13, 1),
        "BS2_aus_Sitzlueftung": extractCANSignal(hexData, 14, 1),
        "BS2_Klimaanlage_aus": extractCANSignal(hexData, 15, 1),
        "BS2_U_Start_BATT": extractCANSignal(hexData, 16, 8, 0.05, 5),
        "BS2_Lastman_aktiv": extractCANSignal(hexData, 24, 1),
        "BS2_Verbr_ab_aktiv": extractCANSignal(hexData, 25, 1),
        "BS2_Notstart": extractCANSignal(hexData, 26, 1),
        "BS2_aus_Sitzhzg_H": extractCANSignal(hexData, 27, 1),
        "BS2_aus_Steckdosen": extractCANSignal(hexData, 28, 1),
        "BS2_aus_Zusatz_Verbr": extractCANSignal(hexData, 29, 1),
        "BS2_aus_Infotainment": extractCANSignal(hexData, 30, 1),
        "BS2_Wake_Up_ACAN": extractCANSignal(hexData, 31, 1),
        "BS2_aus_PTC_Clima": extractCANSignal(hexData, 32, 3, 25, 0),
        "BS2_KlimaLeistRed": extractCANSignal(hexData, 35, 2),
        "BS2_red_Heckscheibe": extractCANSignal(hexData, 37, 1),
        "BS2_aus_Ablage_Wischer": extractCANSignal(hexData, 38, 1),
        "BS2_aus_Innen_Bel": extractCANSignal(hexData, 39, 1),
        "BS2_Warn_Steckdosen": extractCANSignal(hexData, 40, 1),
        "BS2_Warn_Infotainment": extractCANSignal(hexData, 41, 1),
        "BS2_Warn_Zusatz": extractCANSignal(hexData, 42, 1),
        "BS2_Weckursache_ACAN": extractCANSignal(hexData, 43, 2),
        "BS2_VB_2_Battarie": extractCANSignal(hexData, 45, 1),
        "BS2_Zust_Start_Ltg": extractCANSignal(hexData, 46, 1),
        "BS2_Mess_Start_Ltg": extractCANSignal(hexData, 47, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Napięcie Akumulatora (Bordnetz) ---
    // Maksymalna wartość błędu wynosi FF (255), co po przeliczeniu x0.05 + 5 daje 17.75V
    if (fullData.BS2_U_BATT >= 17.7) {
        html += `<div class="ind active-error full-width">NAPIĘCIE (GŁÓWNE): BŁĄD ODCZYTU</div>`;
    } else {
        let voltColor = "var(--green)";
        if (fullData.BS2_U_BATT < 11.5) voltColor = "var(--red)";
        else if (fullData.BS2_U_BATT < 12.2) voltColor = "var(--orange)";
        
        html += `<div class="ind active full-width" style="font-size: 1.1em; color: ${voltColor}; border-color: ${voltColor};">AKUMULATOR (GŁÓWNY): ${fullData.BS2_U_BATT.toFixed(2)} V</div>`;
    }

    // --- Drugi akumulator (opcja dla Webasto itp.) ---
    if (fullData.BS2_VB_2_Battarie === 1) {
        if (fullData.BS2_U_Start_BATT >= 17.7) {
            html += `<div class="ind active-error full-width">NAPIĘCIE (DODATKOWE): BŁĄD</div>`;
        } else {
            html += `<div class="ind active full-width" style="opacity: 0.8;">AKUMULATOR (DODATK.): ${fullData.BS2_U_Start_BATT.toFixed(2)} V</div>`;
        }
    }

    // --- Zarządzanie obciążeniem (Load Management) ---
    if (fullData.BS2_Lastman_aktiv === 1 || fullData.BS2_Verbr_ab_aktiv === 1) {
        html += `<div class="ind active-orange full-width" style="animation: blink 0.5s infinite;">ZARZĄDZANIE ENERGIĄ: AKTYWNE</div>`;
        cardElement.style.borderColor = "var(--orange)";
        
        // Zliczamy co BCM wyłączył, żeby ratować prąd
        let cutoffs = [];
        if (fullData.BS2_Heckscheibe_aus === 1) cutoffs.push("TYLNA SZYBA");
        if (fullData.BS2_Frontscheibe_aus === 1) cutoffs.push("PRZEDNIA SZYBA");
        if (fullData.BS2_Sitzheizung_aus === 1) cutoffs.push("FOTELE");
        if (fullData.BS2_Klimaanlage_aus === 1) cutoffs.push("KLIMA");
        if (fullData.BS2_aus_Steckdosen === 1) cutoffs.push("GNIAZDA 12V");
        if (fullData.BS2_aus_Infotainment === 1) cutoffs.push("RADIO/NAVI");
        if (fullData.BS2_aus_PTC_Clima > 0) cutoffs.push(`PTC ZREDUKOWANE`);

        if (cutoffs.length > 0) {
            html += `<div class="ind active-error full-width" style="font-size: 0.8em;">ODCIĘTO: ${cutoffs.join(', ')}</div>`;
        }
    } else {
        html += `<div class="ind full-width">ZARZĄDZANIE ENERGIĄ: UŚPIONE</div>`;
        // Powrót do zielonego lub szarego obramowania nastąpi z innych warunków, np. domyślnie:
        if (fullData.BS2_U_BATT < 17.7 && fullData.BS2_U_BATT >= 12.2) {
            cardElement.style.borderColor = "var(--border-color)";
        }
    }

    // --- Status Linii Rozrusznika ---
    if (fullData.BS2_Zust_Start_Ltg === 1) {
        html += `<div class="ind active-error full-width">BŁĄD: ZWARCIE LINII ROZRUSZNIKA (MASA)</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x575 (mBSG_3 - Rozszerzone statusy oświetlenia i stacyjki)
function decodeBSG3Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (30 sygnałów)
    const fullData = {
        "BS3_Klemme_S": extractCANSignal(hexData, 0, 1),
        "BS3_Klemme_15": extractCANSignal(hexData, 1, 1),
        "BS3_Klemme_X": extractCANSignal(hexData, 2, 1),
        "BS3_Klemme_50": extractCANSignal(hexData, 3, 1),
        "BS3_Klemme_P": extractCANSignal(hexData, 4, 1),
        "BS3_2_Drehzahl": extractCANSignal(hexData, 5, 1),
        "BS3_Klemme_15_Motorraum": extractCANSignal(hexData, 6, 1),
        "BS3_Ladekontrollampe": extractCANSignal(hexData, 7, 1),
        "BS3_Drehzahlanhebung": extractCANSignal(hexData, 8, 1),
        "BS3_Bordnetzbatt": extractCANSignal(hexData, 9, 2),
        "BS3_Starterbatt": extractCANSignal(hexData, 11, 2),
        "BS3_KD_Fehler": extractCANSignal(hexData, 13, 1),
        "BS3_LWR_Fehler": extractCANSignal(hexData, 14, 1),
        "BS3_Haubenkontakt": extractCANSignal(hexData, 15, 1),
        "BS3_Coming_Home": extractCANSignal(hexData, 16, 1),
        "BS3_Leaving_Home": extractCANSignal(hexData, 17, 1),
        "BS3_K_Luefter_ein": extractCANSignal(hexData, 18, 1),
        "BS3_Ab_Batterie": extractCANSignal(hexData, 19, 1),
        "BS3_VP_Taste": extractCANSignal(hexData, 20, 1),
        "BS3_Verglasung_zu": extractCANSignal(hexData, 21, 1),
        "BS3_PDC_Taster": extractCANSignal(hexData, 22, 1),
        "BS3_IRUE_Taster": extractCANSignal(hexData, 23, 1),
        "BS3_VB_Coming_Home": extractCANSignal(hexData, 24, 1),
        "BS3_VB_Tagesfahrlicht": extractCANSignal(hexData, 25, 1),
        "BS3_VB_Fussraumleuchten": extractCANSignal(hexData, 26, 1),
        "BS3_LED_Heckscheibe": extractCANSignal(hexData, 27, 1),
        "BS3_LED_Frontscheibe": extractCANSignal(hexData, 28, 1),
        "BS3_LED_Sitze": extractCANSignal(hexData, 29, 1),
        "BS3_LED_Aussenspiegel": extractCANSignal(hexData, 30, 1),
        "BS3_Starterlaubnis": extractCANSignal(hexData, 31, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Status Akumulatora Głównego (Bordnetzbatt) ---
    // 0 = iO (OK), 1 = krytyczny, 2 = rozładowany, 3 = błąd
    let batStatus = "B/D";
    if (fullData.BS3_Bordnetzbatt === 0) {
        batStatus = `<div class="ind active-green full-width">KONDYCJA BATERII: OK</div>`;
        cardElement.style.borderColor = "var(--green)";
    } else if (fullData.BS3_Bordnetzbatt === 1) {
        batStatus = `<div class="ind active-orange full-width">KONDYCJA BATERII: KRYTYCZNA!</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else if (fullData.BS3_Bordnetzbatt === 2) {
        batStatus = `<div class="ind active-error full-width" style="animation: blink 1s infinite;">BATERIA ROZŁADOWANA!</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else if (fullData.BS3_Bordnetzbatt === 3) {
        batStatus = `<div class="ind active-error full-width">KONDYCJA BATERII: BŁĄD</div>`;
    }
    
    // Jeśli auto zgłasza odpięcie akumulatora na CAN
    if (fullData.BS3_Ab_Batterie === 1) {
        batStatus = `<div class="ind active-error full-width">ODPIĘTO AKUMULATOR!</div>`;
        cardElement.style.borderColor = "var(--red)";
    }
    
    html += batStatus;

    // --- Zezwolenie na Rozruch (Starterlaubnis) / Klemme S ---
    if (fullData.BS3_Klemme_S === 1) {
        if (fullData.BS3_Starterlaubnis === 1) {
            html += `<div class="ind active-green">ROZRUCH: ZEZWOLONO</div>`;
        } else {
            html += `<div class="ind active-orange" style="animation: blink 0.5s infinite;">WCIŚNIJ SPRZĘGŁO/HAMULEC</div>`;
        }
    } else {
        html += `<div class="ind">ROZRUCH: ZABLOKOWANY</div>`;
    }

    // --- Coming / Leaving Home ---
    if (fullData.BS3_Coming_Home === 1 || fullData.BS3_Leaving_Home === 1) {
        let chlh = fullData.BS3_Coming_Home === 1 ? "COMING HOME" : "LEAVING HOME";
        html += `<div class="ind active-blue">AKTYWNE: ${chlh}</div>`;
    }

    // --- Ostrzeżenia i Usterki ---
    let alerts = [];
    if (fullData.BS3_LWR_Fehler === 1) alerts.push("POZIOMOWANIE ŚWIATEŁ (LWR)");
    if (fullData.BS3_Ladekontrollampe === 1) alerts.push("BRAK ŁADOWANIA");
    
    if (alerts.length > 0) {
         html += `<div class="ind active-error full-width">USTERKA: ${alerts.join(', ')}</div>`;
    }

    // --- Status Maska/Szyby ---
    if (fullData.BS3_Verglasung_zu === 1) {
        html += `<div class="ind active-lock full-width">DOMYKANIE SZYB (DESZCZ)</div>`;
    }
    if (fullData.BS3_Haubenkontakt === 1) {
         html += `<div class="ind active-error full-width">MASKA OTWARTA</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x60E (mEinheiten - Formaty jednostek i wyświetlacza)
function decodeEinheitenData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (10 sygnałów)
    const fullData = {
        "EH1_Einh_Strck": extractCANSignal(hexData, 0, 1),
        "EH1_Einh_Temp": extractCANSignal(hexData, 1, 1),
        "EH1_Einh_Vol": extractCANSignal(hexData, 2, 1),
        "EH1_Einh_Verbr": extractCANSignal(hexData, 3, 1),
        "EH1_Einh_Druck": extractCANSignal(hexData, 4, 2),
        "EH1_Datum_Anzeige": extractCANSignal(hexData, 6, 1),
        "EH1_Uhr_Anzeige": extractCANSignal(hexData, 7, 1),
        "EH1_Profil": extractCANSignal(hexData, 8, 4),
        "EH1_Wochentag": extractCANSignal(hexData, 12, 3),
        "EH1_Verstellung_Strck": extractCANSignal(hexData, 15, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Jednostki podstawowe (Temp, Dystans, Objętość) ---
    let unitTemp = fullData.EH1_Einh_Temp === 0 ? "°C" : "°F";
    let unitDist = fullData.EH1_Einh_Strck === 0 ? "km" : "mi";
    let unitVol = fullData.EH1_Einh_Vol === 0 ? "L" : "gal";
    
    // Ciśnienie
    let unitPress = "bar";
    if (fullData.EH1_Einh_Druck === 1) unitPress = "psi";
    else if (fullData.EH1_Einh_Druck === 3) unitPress = "kPa";

    html += `<div class="ind active-blue full-width">JEDNOSTKI: ${unitTemp} | ${unitDist} | ${unitVol} | ${unitPress}</div>`;

    // --- Formaty Czasu i Daty ---
    let clockFormat = fullData.EH1_Uhr_Anzeige === 0 ? "24H" : "12H (AM/PM)";
    let dateFormat = fullData.EH1_Datum_Anzeige === 0 ? "DD.MM.YYYY" : "MM.DD.YYYY";
    
    html += `<div class="ind active">FORMAT CZASU: ${clockFormat}</div>`;
    html += `<div class="ind active">FORMAT DATY: ${dateFormat}</div>`;

    // --- Dzień Tygodnia ---
    // 0=Init, 1=Mo, 2=Di, 3=Mi, 4=Do, 5=Fr, 6=Sa, 7=So
    const days = ["BRAK/INIT", "PONIEDZIAŁEK", "WTOREK", "ŚRODA", "CZWARTEK", "PIĄTEK", "SOBOTA", "NIEDZIELA"];
    let currentDay = days[fullData.EH1_Wochentag] || "NIEZNANY";

    html += `<div class="ind full-width" style="opacity: 0.8;">DZIEŃ TYGODNIA: ${currentDay}</div>`;

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x621 (mKombi_K1 - Dane z licznika)
function decodeKombiK1Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (14 sygnałów)
    const fullData = {
        "KO1_Tankstop": extractCANSignal(hexData, 0, 1),
        "KO1_Tankwarnlampe": extractCANSignal(hexData, 1, 1),
        "KO1_WaschWasser": extractCANSignal(hexData, 2, 1),
        "KO1_MH_Kontakt": extractCANSignal(hexData, 3, 1),
        "KO1_FT_geoeffnet": extractCANSignal(hexData, 4, 1),
        "KO1_Handbremse": extractCANSignal(hexData, 5, 1),
        "KO1_AFL": extractCANSignal(hexData, 6, 1),
        "KO1_Klemme_L": extractCANSignal(hexData, 7, 1),
        "KO1_Standzeit": extractCANSignal(hexData, 8, 15, 4, 0),             // Czas postoju w sekundach
        "KO1_Standzeit_Fehler": extractCANSignal(hexData, 23, 1),
        "KO1_Tankinhalt": extractCANSignal(hexData, 24, 7),                  // Poziom paliwa (litry)
        "KO1_Tankwarnung": extractCANSignal(hexData, 31, 1),
        "KO1_WFS_Schluessel": extractCANSignal(hexData, 32, 4),              // Numer rozpoznanego kluczyka Immo
        "KO1_KD_Fehler_WFS": extractCANSignal(hexData, 36, 1),
        "KO1_Fernlicht": extractCANSignal(hexData, 37, 1),
        "KO1_Freigabe_Zuheizer": extractCANSignal(hexData, 38, 1),
        "KO1_MFA_vorhanden": extractCANSignal(hexData, 39, 1),
        "KO1_Bel_Displ": extractCANSignal(hexData, 40, 7),                   // Podświetlenie FIS (%)
        "KO1_Sta_Displ": extractCANSignal(hexData, 47, 1),
        "KO1_Lichtsensor": extractCANSignal(hexData, 48, 8)                  // Odczyt z czujnika światła
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Poziom Paliwa i Rezerwa ---
    // Zgodnie z dokumentacją: 127 = Błąd czujnika [cite: 107]
    if (fullData.KO1_Tankinhalt >= 127) {
        html += `<div class="ind active-error full-width">POZIOM PALIWA: BŁĄD PŁYWAKA</div>`;
    } else {
        let fuelColor = "var(--green)";
        if (fullData.KO1_Tankwarnlampe === 1 || fullData.KO1_Tankwarnung === 1) { // Zapalona rezerwa [cite: 95, 108]
            fuelColor = "var(--orange)";
        }
        if (fullData.KO1_Tankstop === 1) { // Rozpoznano tankowanie [cite: 93]
             html += `<div class="ind active-blue full-width">TANKOWANIE...</div>`;
        }
        
        html += `<div class="ind active full-width" style="font-size: 1.1em; color: ${fuelColor}; border-color: ${fuelColor};">PALIWO: ${fullData.KO1_Tankinhalt} L</div>`;
    }

    // --- Czas Postoju (Standzeit) ---
    if (fullData.KO1_Standzeit_Fehler === 1) { // Błąd resetu czasu po odpięciu klemy [cite: 104]
         html += `<div class="ind active-error full-width">CZAS POSTOJU: BŁĄD ZASILANIA (KL. 30)</div>`;
    } else {
        // Przeliczamy sekundy na format HH:MM:SS [cite: 103]
        let h = Math.floor(fullData.KO1_Standzeit / 3600);
        let m = Math.floor((fullData.KO1_Standzeit % 3600) / 60);
        let s = fullData.KO1_Standzeit % 60;
        let timeStr = `${h}h ${m}m ${s}s`;
        
        html += `<div class="ind full-width" style="opacity: 0.8;">CZAS POSTOJU: ${timeStr}</div>`;
    }

    // --- Ostrzeżenia na desce ---
    let alerts = [];
    if (fullData.KO1_Handbremse === 1) alerts.push("HAMULEC RĘCZNY"); // [cite: 100]
    if (fullData.KO1_WaschWasser === 1) alerts.push("PŁYN SPRYSK."); // [cite: 96]
    
    if (alerts.length > 0) {
        html += `<div class="ind active-error full-width">KONTROLKI: ${alerts.join(', ')}</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    // --- Podświetlenie Wnętrza / Zegarów ---
    // 127 = błąd [cite: 117]
    if (fullData.KO1_Bel_Displ < 127) {
         html += `<div class="ind active" style="opacity: 0.6;">ŚCIEMNIACZ ZEGARÓW: ${fullData.KO1_Bel_Displ}%</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x62F (mDisplay_1 - Interakcja i sterowanie ekranem FIS/MFA)
function decodeDisplay1Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (10 sygnałów)
    const fullData = {
        "DY1_Display_OK": extractCANSignal(hexData, 0, 1),
        "DY1_Reset": extractCANSignal(hexData, 1, 1),
        "DY1_Global_Reset": extractCANSignal(hexData, 2, 1),
        "DY1_MFA_Down": extractCANSignal(hexData, 4, 1),
        "DY1_MFA_Up": extractCANSignal(hexData, 5, 1),
        "DY1_MFA_Reset": extractCANSignal(hexData, 6, 1),
        "DY1_MFA_WippeLang": extractCANSignal(hexData, 7, 1),
        "DY1_Bereich1": extractCANSignal(hexData, 8, 8),
        "DY1_Bereich2": extractCANSignal(hexData, 16, 8),
        "DY1_Bereich3": extractCANSignal(hexData, 24, 8)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Status gotowości wyświetlacza ---
    if (fullData.DY1_Display_OK === 1) {
        html += `<div class="ind active-green full-width">WYŚWIETLACZ: GOTOWY (ON)</div>`;
        cardElement.style.borderColor = "var(--green)";
    } else {
        html += `<div class="ind full-width">WYŚWIETLACZ: UŚPIONY / WYŁ</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- Akcje Przycisków (MFA) ---
    let buttonPressed = false;
    let longPressStr = fullData.DY1_MFA_WippeLang === 1 ? " (DŁUGIE PRZYTRZYMANIE)" : "";

    if (fullData.DY1_MFA_Up === 1) {
        html += `<div class="ind active-blue full-width">PRZYCISK: STRZAŁKA W GÓRĘ${longPressStr}</div>`;
        buttonPressed = true;
    }
    if (fullData.DY1_MFA_Down === 1) {
        html += `<div class="ind active-blue full-width">PRZYCISK: STRZAŁKA W DÓŁ${longPressStr}</div>`;
        buttonPressed = true;
    }
    if (fullData.DY1_MFA_Reset === 1) {
        html += `<div class="ind active-orange full-width">PRZYCISK: OK / RESET${longPressStr}</div>`;
        buttonPressed = true;
    }

    if (buttonPressed) {
        cardElement.style.borderColor = "var(--blue)";
    }

    // --- Powiadomienia o resecie ---
    if (fullData.DY1_Global_Reset === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite;">GLOBALNY RESET DDP!</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x635 (mDimmung - Ściemniacz deski rozdzielczej i przycisków)
function decodeDimmungData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (5 sygnałów)
    const fullData = {
        "DI1_Display": extractCANSignal(hexData, 0, 7),
        "DI1_Display_def": extractCANSignal(hexData, 7, 1),
        "DI1_Schalter": extractCANSignal(hexData, 8, 7),
        "DI1_Schalter_def": extractCANSignal(hexData, 15, 1),
        "DI1_Sensor": extractCANSignal(hexData, 16, 8)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Ściemniacz Wyświetlaczy (Klemme 58d) ---
    if (fullData.DI1_Display_def === 1 || fullData.DI1_Display === 127) {
        html += `<div class="ind active-error full-width">WYŚWIETLACZE (58d): BŁĄD ZASILANIA</div>`;
    } else {
        html += `<div class="ind active-blue full-width">WYŚWIETLACZE (58d): ${fullData.DI1_Display}%</div>`;
    }

    // --- Ściemniacz Przycisków (Klemme 58s) ---
    if (fullData.DI1_Schalter_def === 1 || fullData.DI1_Schalter === 127) {
        html += `<div class="ind active-error full-width">PRZYCISKI (58s): BŁĄD ZASILANIA</div>`;
    } else {
        html += `<div class="ind active-blue full-width">PRZYCISKI (58s): ${fullData.DI1_Schalter}%</div>`;
    }

    // --- Czujnik Światła Zewnętrznego ---
    if (fullData.DI1_Sensor === 255) {
        html += `<div class="ind active-error full-width">CZUJNIK ŚWIATŁA: BŁĄD</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else if (fullData.DI1_Sensor === 254) {
        html += `<div class="ind active-orange full-width">CZUJNIK ŚWIATŁA: INICJALIZACJA</div>`;
    } else {
        html += `<div class="ind active full-width" style="opacity: 0.8;">CZUJNIK ŚWIATŁA: Wartość ${fullData.DI1_Sensor}</div>`;
        cardElement.style.borderColor = "var(--blue)";
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x651 (mSysteminfo_1 - Globalne flagi systemowe Gatewaya)
function decodeSysteminfo1Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (27 sygnałów)
    const fullData = {
        "SY1_CAN_Extern": extractCANSignal(hexData, 0, 1),
        "SY1_Diag_Antrieb": extractCANSignal(hexData, 1, 1),
        "SY1_Sleep_Komfort": extractCANSignal(hexData, 2, 1),
        "SY1_Diag_Komfort": extractCANSignal(hexData, 3, 1),
        "SY1_Sleep_Infotainment": extractCANSignal(hexData, 4, 1),
        "SY1_Diag_Infotainment": extractCANSignal(hexData, 5, 1),
        "SY1_Infotainment": extractCANSignal(hexData, 6, 1),
        "SY1_Verbauliste_gueltig": extractCANSignal(hexData, 7, 1),
        "SY1_Klasse": extractCANSignal(hexData, 8, 4),
        "SY1_Marke": extractCANSignal(hexData, 12, 4),
        "SY1_Derivat": extractCANSignal(hexData, 16, 4),
        "SY1_Generation": extractCANSignal(hexData, 20, 4),
        "SY1_Erweiterung": extractCANSignal(hexData, 24, 4),
        "SY1_Rechtslenker": extractCANSignal(hexData, 28, 1),
        "SY1_Viertuerer": extractCANSignal(hexData, 29, 1),
        "SY1_Transportmode": extractCANSignal(hexData, 30, 1),
        "SY1_KD_Fehler": extractCANSignal(hexData, 31, 1),
        "SY1_VersLowCAN_Komfort": extractCANSignal(hexData, 32, 4),
        "SY1_VersHighCAN_Komfort": extractCANSignal(hexData, 36, 4),
        "SY1_VersLowCAN_Antrieb": extractCANSignal(hexData, 40, 4),
        "SY1_VersHighCAN_Antrieb": extractCANSignal(hexData, 44, 4),
        "SY1_Relais_FAS_Zweig": extractCANSignal(hexData, 48, 2),
        "SY1_ELV_Lock_Supply": extractCANSignal(hexData, 50, 1),
        "SY1_QRS_Messmodus": extractCANSignal(hexData, 51, 1),
        "SY1_NWDF_gueltig": extractCANSignal(hexData, 54, 1),
        "SY1_NWDF": extractCANSignal(hexData, 55, 1),
        "SY1_Notbrems_Status": extractCANSignal(hexData, 56, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Tożsamość pojazdu (Marka i Nadwozie) ---
    let brand = "NIEZNANA";
    switch (fullData.SY1_Marke) {
        case 0: brand = "VOLKSWAGEN"; break;
        case 1: brand = "AUDI"; break;
        case 2: brand = "SEAT"; break;
        case 3: brand = "SKODA"; break;
        case 4: brand = "VW NUTZFAHRZEUGE"; break;
        case 5: brand = "BUGATTI"; break;
        case 6: brand = "LAMBORGHINI"; break;
        case 7: brand = "BENTLEY"; break;
        case 15: brand = "PORSCHE"; break;
    }

    let steering = fullData.SY1_Rechtslenker === 1 ? "RHD (Prawa)" : "LHD (Lewa)";
    let doors = fullData.SY1_Viertuerer === 1 ? "4/5 DRZWI" : "2/3 DRZWI";

    html += `<div class="ind active-blue full-width" style="font-weight: bold;">ZAKODOWANO: ${brand} | ${doors} | ${steering}</div>`;

    // --- Stan usypiania magistrali ---
    let sleepState = [];
    if (fullData.SY1_Sleep_Komfort === 1) sleepState.push("KOMFORT: UŚPIONY");
    if (fullData.SY1_Sleep_Infotainment === 1) sleepState.push("INFO: UŚPIONA");

    if (sleepState.length > 0) {
        html += `<div class="ind active-orange full-width">STAN SIECI: ${sleepState.join(', ')}</div>`;
    } else {
        html += `<div class="ind full-width">STAN SIECI: WYBUDZONA (AKTYWNA)</div>`;
    }

    // --- Alert Awaryjnego Hamowania ---
    if (fullData.SY1_Notbrems_Status === 1) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.2s infinite; font-size: 1.1em;">UWAGA: AWARYJNE HAMOWANIE!</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    // --- Ostrzeżenia diagnostyczne ---
    if (fullData.SY1_Transportmode === 1) {
        html += `<div class="ind active-error full-width">TRYB TRANSPORTOWY AKTYWNY!</div>`;
    }
    
    if (fullData.SY1_KD_Fehler === 1) {
         html += `<div class="ind active-error">BŁĄD GATEWAY (DTC)</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x653 (mGateway_3 - Wersja językowa, region i typ silnika)
function decodeGateway3Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (7 sygnałów)
    const fullData = {
        "GW3_Laendervariante": extractCANSignal(hexData, 0, 6),       // [cite: 187]
        "GW3_Alt_3_Kombi": extractCANSignal(hexData, 6, 1),           // [cite: 188]
        "GW3_Land_Sprach_empf": extractCANSignal(hexData, 7, 1),      // [cite: 190]
        "GW3_Sprachvariante": extractCANSignal(hexData, 8, 8),        // [cite: 191]
        "GW3_Motortyp": extractCANSignal(hexData, 16, 6),             // [cite: 193]
        "GW3_Alt_5_Motor": extractCANSignal(hexData, 22, 1),          // [cite: 195]
        "GW3_Motortyp_empf": extractCANSignal(hexData, 23, 1)         // [cite: 197]
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Region i Język ---
    // Sprawdzamy czy dane nie są wartościami początkowymi (Initwert) [cite: 190]
    if (fullData.GW3_Land_Sprach_empf === 1) {
        let country = "NIEZNANY";
        switch (fullData.GW3_Laendervariante) {
            case 0: country = "NIEMCY"; break;          // [cite: 188]
            case 1: country = "EUROPA"; break;          // [cite: 188]
            case 2: country = "USA"; break;             // [cite: 188]
            case 3: country = "KANADA"; break;          // [cite: 188]
            case 4: country = "WIELKA BRYTANIA"; break; // [cite: 188]
            case 5: country = "JAPONIA"; break;         // [cite: 187]
            case 6: country = "ARABIA SAUDYJSKA"; break;// [cite: 187]
            case 7: country = "AUSTRALIA"; break;       // [cite: 188]
        }

        let lang = "NIEZNANY";
        switch (fullData.GW3_Sprachvariante) {
            case 0: lang = "BRAK"; break;               // [cite: 192]
            case 1: lang = "NIEMIECKI"; break;          // [cite: 192]
            case 2: lang = "ANGIELSKI"; break;          // [cite: 193]
            case 3: lang = "FRANCUSKI"; break;          // [cite: 193]
            case 4: lang = "WŁOSKI"; break;             // [cite: 192]
            case 5: lang = "HISZPAŃSKI"; break;         // [cite: 192]
            case 6: lang = "PORTUGALSKI"; break;        // [cite: 192]
            case 8: lang = "CZESKI"; break;             // [cite: 193]
            case 9: lang = "CHIŃSKI"; break;            // [cite: 192]
            case 10: lang = "US-ANGIELSKI"; break;      // [cite: 192]
            case 11: lang = "HOLENDERSKI"; break;       // [cite: 192]
            case 12: lang = "JAPOŃSKI"; break;          // [cite: 193]
            case 13: lang = "ROSYJSKI"; break;          // [cite: 193]
            case 14: lang = "KOREAŃSKI"; break;         // [cite: 193]
            case 15: lang = "FRANCO-KANADYJSKI"; break; // [cite: 193]
            case 16: lang = "SZWEDZKI"; break;          // [cite: 193]
            case 17: lang = "POLSKI"; break;            // [cite: 193]
            case 18: lang = "TURECKI"; break;           // [cite: 193]
        }
        
        html += `<div class="ind active-blue full-width">REGION: ${country} | JĘZYK: ${lang}</div>`;
        cardElement.style.borderColor = "var(--blue)";
    } else {
        html += `<div class="ind full-width">REGION/JĘZYK: DANE OCZEKUJĄCE...</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- Typ Silnika ---
    if (fullData.GW3_Motortyp_empf === 1) { // [cite: 197]
        // Bity 0-3 określają liczbę cylindrów (np. 4 dla R4, 6 dla V6) 
        let cyl = fullData.GW3_Motortyp & 0x0F; 
        // Bit 4 odpowiada za obecność turbosprężarki (Turbo_M) [cite: 194]
        let isTurbo = (fullData.GW3_Motortyp & 0x10) ? " (TURBO)" : ""; 
        
        let cylStr = cyl > 0 ? `${cyl} CYL.` : "NIEZNANY";
        
        html += `<div class="ind active full-width" style="opacity: 0.9;">SILNIK: ${cylStr}${isTurbo}</div>`;
    }

    // --- Flagi Opóźnień (Timeout) ---
    // Gateway informuje czy paczki z licznika (>100ms) i silnika się nie spóźniają [cite: 188, 195]
    if (fullData.GW3_Alt_3_Kombi === 1 || fullData.GW3_Alt_5_Motor === 1) { // [cite: 188, 196]
        html += `<div class="ind active-error full-width">OPÓŹNIENIE MAGISTRALI (TIMEOUT)!</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x655 (mSollverbau_neu - Lista zakodowanych sterowników)
function decodeSollverbauData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (64 sygnały - po 1 bicie)
    const fullData = {
        "VBN_Motor_A": extractCANSignal(hexData, 0, 1),
        "VBN_Getriebe_A": extractCANSignal(hexData, 1, 1),
        "VBN_Bremse_A": extractCANSignal(hexData, 2, 1),
        "VBN_Kombi_A": extractCANSignal(hexData, 3, 1),
        "VBN_LSM_A": extractCANSignal(hexData, 4, 1),
        "VBN_Airbag_A": extractCANSignal(hexData, 5, 1),
        "VBN_Lenkhilfe_A": extractCANSignal(hexData, 6, 1),
        "VBN_dyn_LWR_A": extractCANSignal(hexData, 7, 1),
        "VBN_Niveau_A": extractCANSignal(hexData, 8, 1),
        "VBN_Allrad_A": extractCANSignal(hexData, 9, 1),
        "VBN_ADR_Sensor_A": extractCANSignal(hexData, 10, 1),
        "VBN_ADR_getrennt": extractCANSignal(hexData, 11, 1), // Flaga: odłączenie radaru
        "VBN_Parkbremse_A": extractCANSignal(hexData, 12, 1),
        "VBN_EZS_A": extractCANSignal(hexData, 13, 1),
        "VBN_Daempfer_A": extractCANSignal(hexData, 14, 1),
        "VBN_Quersperre": extractCANSignal(hexData, 15, 1),
        "VBN_Motor_Slave_A": extractCANSignal(hexData, 16, 1),
        "VBN_SWA_A": extractCANSignal(hexData, 17, 1),
        "VBN_LDW_A": extractCANSignal(hexData, 18, 1),
        "VBN_RKA_Plus_A": extractCANSignal(hexData, 19, 1),
        "VBN_PLA_A": extractCANSignal(hexData, 20, 1),
        "VBN_WFS_KBI": extractCANSignal(hexData, 21, 1),
        "VBN_Kombi_KBI": extractCANSignal(hexData, 22, 1),
        "VBN_Soll_Ist_OK": extractCANSignal(hexData, 23, 1),  // Flaga: Lista zakodowana = Rzeczywista
        "VBN_BSG_K": extractCANSignal(hexData, 24, 1),
        "VBN_KSG_K": extractCANSignal(hexData, 25, 1),
        "VBN_TSG_FT_K": extractCANSignal(hexData, 26, 1),
        "VBN_TSG_BT_K": extractCANSignal(hexData, 27, 1),
        "VBN_TSG_HL_K": extractCANSignal(hexData, 28, 1),
        "VBN_TSG_HR_K": extractCANSignal(hexData, 29, 1),
        "VBN_Memory_K": extractCANSignal(hexData, 30, 1),
        "VBN_Dachmodul_K": extractCANSignal(hexData, 31, 1),
        "VBN_Zentralelektrik_II_K": extractCANSignal(hexData, 32, 1),
        "VBN_RDK_K": extractCANSignal(hexData, 33, 1),
        "VBN_SMLS_K": extractCANSignal(hexData, 34, 1),
        "VBN_Gateway_K": extractCANSignal(hexData, 35, 1),
        "VBN_Clima_K": extractCANSignal(hexData, 36, 1),
        "VBN_APS_K": extractCANSignal(hexData, 37, 1),
        "VBN_PTC_Heizung_K": extractCANSignal(hexData, 38, 1),
        "VBN_Standhzg_K": extractCANSignal(hexData, 39, 1),
        "VBN_VSG_K": extractCANSignal(hexData, 40, 1),
        "VBN_RSE_I": extractCANSignal(hexData, 41, 1),
        "VBN_Wischer_K": extractCANSignal(hexData, 42, 1),
        "VBN_MDI_I": extractCANSignal(hexData, 43, 1),
        "VBN_AAG_K": extractCANSignal(hexData, 44, 1),
        "VBN_Mem_BF_K": extractCANSignal(hexData, 45, 1),
        "VBN_Easy_Entry_VF": extractCANSignal(hexData, 46, 1),
        "VBN_Easy_Entry_VB": extractCANSignal(hexData, 47, 1),
        "VBN_Heckdeckel_K": extractCANSignal(hexData, 48, 1),
        "VBN_Rearview_I": extractCANSignal(hexData, 49, 1),
        "VBN_Sonderfahrzeug_SG_K": extractCANSignal(hexData, 50, 1),
        "VBN_Tastenmodul_I": extractCANSignal(hexData, 51, 1),
        "VBN_Kompass_I": extractCANSignal(hexData, 52, 1),
        "VBN_WFS_K": extractCANSignal(hexData, 53, 1),
        "VBN_GSM_Pager_I": extractCANSignal(hexData, 54, 1),
        "VBN_InfoElektronik": extractCANSignal(hexData, 55, 1),
        "VBN_DSP_I": extractCANSignal(hexData, 56, 1),
        "VBN_DAB_I": extractCANSignal(hexData, 57, 1),
        "VBN_Telematik_I": extractCANSignal(hexData, 58, 1),
        "VBN_Navigation_I": extractCANSignal(hexData, 59, 1),
        "VBN_TV_Tuner_I": extractCANSignal(hexData, 60, 1),
        "VBN_Neigungsmodul_I": extractCANSignal(hexData, 61, 1),
        "VBN_Radio_I": extractCANSignal(hexData, 62, 1),
        "VBN_Telefon_I": extractCANSignal(hexData, 63, 1)
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Zliczanie wyposażenia ---
    // Obliczamy sumę jedynek (pomijając bity 11 i 23, które są flagami stanowymi, a nie modułami)
    let moduleCount = 0;
    for (const [key, value] of Object.entries(fullData)) {
        if (value === 1 && key !== "VBN_ADR_getrennt" && key !== "VBN_Soll_Ist_OK") {
            moduleCount++;
        }
    }

    html += `<div class="ind active-blue full-width">ZAKODOWANO MODUŁÓW: ${moduleCount}</div>`;

    // --- Flaga Rzeczywistej Instalacji (Soll = Ist) ---
    // 0 = Sollverbau ungleich Istverbau (Błąd kodowania lub brak komunikacji ze sterownikiem)
    // 1 = Sollverbau gleich Istverbau (Wszystko działa idealnie)
    if (fullData.VBN_Soll_Ist_OK === 0) {
        html += `<div class="ind active-error full-width" style="animation: blink 0.5s infinite; font-size: 0.9em; font-weight: bold;">BŁĄD GATEWAY: BRAK ODPOWIEDZI STEROWNIKA (SOLL != IST)</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        html += `<div class="ind active-green full-width">MAGISTRALA KOMPLETNA (SOLL = IST)</div>`;
        cardElement.style.borderColor = "var(--green)";
    }

    // --- Krótki przegląd kluczowych modułów ---
    let keyModules = [];
    if (fullData.VBN_Motor_A === 1) keyModules.push("SILNIK");
    if (fullData.VBN_Bremse_A === 1) keyModules.push("ABS/ESP");
    if (fullData.VBN_Airbag_A === 1) keyModules.push("AIRBAG");
    if (fullData.VBN_Kombi_A === 1) keyModules.push("LICZNIKI");
    
    html += `<div class="ind full-width" style="opacity: 0.7; font-size: 0.8em;">GŁÓWNE: ${keyModules.join(', ')} ... [Kliknij by zobaczyć 64]</div>`;

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x65D (mDiagnose_1 - Globalny czas, data i przebieg)
function decodeDiagnose1Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (10 sygnałów)
    const fullData = {
        "DN1_Verlernzaehler": extractCANSignal(hexData, 0, 8),
        "DN1_KM_Stand": extractCANSignal(hexData, 8, 20),                    // Przebieg (km)
        "DN1_Jahr": extractCANSignal(hexData, 28, 7, 1, 2000),               // Rok (offset +2000)
        "DN1_Monat": extractCANSignal(hexData, 35, 4),                       // Miesiąc (1-12)
        "DN1_Tag": extractCANSignal(hexData, 39, 5),                         // Dzień (1-31)
        "DN1_Stunde": extractCANSignal(hexData, 44, 5),                      // Godzina (0-23)
        "DN1_Minute": extractCANSignal(hexData, 49, 6),                      // Minuta (0-59)
        "DN1_Sekunde": extractCANSignal(hexData, 55, 6),                     // Sekunda (0-59)
        "DN1_alt_Kilometerstand": extractCANSignal(hexData, 62, 1),          // Flaga opóźnienia przebiegu
        "DN1_alt_Zeit": extractCANSignal(hexData, 63, 1)                     // Flaga opóźnienia czasu
    };

    // Zapisz do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 2. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // --- Przebieg Pojazdu (Odometer) ---
    if (fullData.DN1_alt_Kilometerstand === 1) {
        html += `<div class="ind active-orange full-width">PRZEBIEG: OCZEKIWANIE NA DANE...</div>`;
    } else {
        // Formatujemy przebieg, dodając spacje tysięcy dla czytelności (np. 245 000 km)
        let kmFormatted = fullData.DN1_KM_Stand.toLocaleString('pl-PL');
        html += `<div class="ind active-blue full-width" style="font-size: 1.2em; font-weight: bold;">ODO: ${kmFormatted} km</div>`;
        cardElement.style.borderColor = "var(--blue)";
    }

    // --- Globalna Data i Czas ---
    if (fullData.DN1_alt_Zeit === 1) {
        html += `<div class="ind active-orange full-width">CZAS/DATA: BRAK SYNCHRONIZACJI</div>`;
    } else {
        // Zabezpieczenia przed błędnymi danymi (np. gdy zegar nie jest ustawiony)
        // Z dokumentacji: Miesiąc > 12 to błąd/init, Godzina > 23 to błąd itd.
        let isDateValid = fullData.DN1_Monat >= 1 && fullData.DN1_Monat <= 12 && fullData.DN1_Tag >= 1 && fullData.DN1_Tag <= 31;
        let isTimeValid = fullData.DN1_Stunde <= 23 && fullData.DN1_Minute <= 59 && fullData.DN1_Sekunde <= 59;

        if (isDateValid && isTimeValid) {
            // Dodajemy zera wiodące (np. "09" zamiast "9")
            let d = fullData.DN1_Tag.toString().padStart(2, '0');
            let mo = fullData.DN1_Monat.toString().padStart(2, '0');
            let y = fullData.DN1_Jahr;
            
            let h = fullData.DN1_Stunde.toString().padStart(2, '0');
            let mi = fullData.DN1_Minute.toString().padStart(2, '0');
            let s = fullData.DN1_Sekunde.toString().padStart(2, '0');

            html += `<div class="ind active full-width" style="opacity: 0.9;">DATA: ${d}.${mo}.${y}</div>`;
            html += `<div class="ind active full-width" style="opacity: 0.9; font-family: monospace;">CZAS: ${h}:${mi}:${s}</div>`;
        } else {
            html += `<div class="ind active-error full-width">CZAS/DATA: NIEUSTAWIONE (INIT)</div>`;
        }
    }

    // --- Verlernzaehler (Licznik cykli) ---
    // 255 (FFh) oznacza błąd
    if (fullData.DN1_Verlernzaehler === 255) {
        html += `<div class="ind active-error full-width" style="font-size: 0.8em;">BŁĄD CYKLU JAZDY</div>`;
    }

    gridContainer.innerHTML = html;
}

// Dekoder dla 0x65F (mFzg_Ident - Złożenie numeru VIN z multipleksera)
function decodeFzgIdentData(id, hexData, cardElement) {
    // 1. ODCZYT MULTIPLEKSERA
    const mux = extractCANSignal(hexData, 0, 2);

    // Pobieramy dotychczasowe dane z pamięci (aby ich nie nadpisać przy nowym cyklu MUX)
    // Jeśli to pierwsza ramka, inicjujemy pusty obiekt.
    const fullData = frameDataCache[id] || {};
    fullData["FI1_MUX"] = mux; // Zapisujemy, w którym trybie aktualnie nadaje Gateway

    // Odczyt kolejnych 7 bajtów (sygnały dzielone po 8 bitów)
    const b1 = extractCANSignal(hexData, 8, 8);
    const b2 = extractCANSignal(hexData, 16, 8);
    const b3 = extractCANSignal(hexData, 24, 8);
    const b4 = extractCANSignal(hexData, 32, 8);
    const b5 = extractCANSignal(hexData, 40, 8);
    const b6 = extractCANSignal(hexData, 48, 8);
    const b7 = extractCANSignal(hexData, 56, 8);

    // 2. PRZYPISANIE BAJTÓW DO ODPOWIEDNICH SYGNAŁÓW W ZALEŻNOŚCI OD MUX
    if (mux === 0) {
        fullData["FI1_Geheimnis_1"] = b1;
        fullData["FI1_Geheimnis_2"] = b2;
        fullData["FI1_Geheimnis_3"] = b3;
        fullData["FI1_Geheimnis_4"] = b4;
        fullData["FI1_VIN_1"] = b5;
        fullData["FI1_VIN_2"] = b6;
        fullData["FI1_VIN_3"] = b7;
    } else if (mux === 1) {
        fullData["FI1_VIN_4"] = b1;
        fullData["FI1_VIN_5"] = b2;
        fullData["FI1_VIN_6"] = b3;
        fullData["FI1_VIN_7"] = b4;
        fullData["FI1_VIN_8"] = b5;
        fullData["FI1_VIN_9"] = b6;
        fullData["FI1_VIN_10"] = b7;
    } else if (mux === 2) {
        fullData["FI1_VIN_11"] = b1;
        fullData["FI1_VIN_12"] = b2;
        fullData["FI1_VIN_13"] = b3;
        fullData["FI1_VIN_14"] = b4;
        fullData["FI1_VIN_15"] = b5;
        fullData["FI1_VIN_16"] = b6;
        fullData["FI1_VIN_17"] = b7;
    }

    // Zapisz zaktualizowany kompletny obiekt do pamięci dla okna Modal
    frameDataCache[id] = fullData;

    // 3. AKTUALIZACJA GŁÓWNEGO KAFELKA NA EKRANIE
    const valElement = cardElement.querySelector('.val');
    if (valElement) {
        valElement.setAttribute('data-decoded', 'true');
        valElement.classList.add('hidden-val');
    }

    const gridContainer = cardElement.querySelector('.grid');
    if (!gridContainer) return;

    let html = ``;

    // Budowanie ostatecznego ciągu znaków (String) z wartości ASCII
    let vinString = "";
    let isComplete = true;

    for (let i = 1; i <= 17; i++) {
        let charCode = fullData[`FI1_VIN_${i}`];
        if (charCode !== undefined && charCode !== 0) {
            // Zamiana kodu dziesiętnego na rzeczywisty znak ASCII
            vinString += String.fromCharCode(charCode);
        } else {
            // Jeśli MUX jeszcze nie nadał tej części, wstawiamy znak zapytania
            vinString += "?";
            isComplete = false;
        }
    }

    // Zabezpieczenie przed niewyuczonym immo (zgodnie z dokumentacją wyświetli X lub -)
    if (vinString.includes("XXX") || vinString.includes("---")) {
        html += `<div class="ind active-error full-width">BŁĄD WFS (IMMO) / VIN NIEZAKODOWANY!</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else if (!isComplete) {
        html += `<div class="ind active-orange full-width" style="animation: blink 1s infinite;">SKANOWANIE VIN: ${vinString}</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else {
        html += `<div class="ind active-blue full-width" style="font-size: 1.2em; font-family: monospace; font-weight: bold; letter-spacing: 2px;">${vinString}</div>`;
        html += `<div class="ind active full-width" style="opacity: 0.6; font-size: 0.8em;">NUMER NADWOZIA ZWERYFIKOWANY</div>`;
        cardElement.style.borderColor = "var(--blue)";
    }

    gridContainer.innerHTML = html;
}