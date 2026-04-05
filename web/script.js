/* =========================================
   GOLF MASTER v50.0 - SMART ENGINE (JS)
   ========================================= */

// --- KONFIGURACJA I ZMIENNE ---
const WS_URL = "ws://localhost:8765";
let socket = null;

// Słownik znanych ramek CAN (PQ35)
const canDictionary = {
    "151": { name: "AIRBAG (mAirbag_1)", zone: "system" },
    "291": { name: "ZAMEK / KOMFORT (mZKE_1)", zone: "komfort" },
    "2C1": { name: "MANETKI (mLSM_1)", zone: "komfort" },
    "2C3": { name: "STACYJKA (mZAS_Status)", zone: "naped" },
    "351": { name: "GATEWAY (mGateway_1)", zone: "system" },
    "359": { name: "HAMULCE / BIEGI (mGW_Bremse)", zone: "naped" },
    "35B": { name: "SILNIK (mGW_Motor)", zone: "naped" },
    "3C3": { name: "KĄT SKRĘTU (mLenkwinkel)", zone: "naped" },
    "3E1": { name: "CLIMATRONIC 1 (mClima_1)", zone: "komfort" },
    "3E3": { name: "CLIMATRONIC 2 (mClima_2)", zone: "komfort" },
    "42B": { name: "SLEEP / WAKE (mNM_Gateway)", zone: "system" },
    "470": { name: "DRZWI / ŚWIATŁA (mBSG_Kombi)", zone: "komfort" },
    "527": { name: "TEMP. ZEWN. (mGW_Kombi)", zone: "media" },
    "551": { name: "UKŁ. KIEROWNICZY", zone: "naped" },
    "555": { name: "TURBO / OLEJ (mMotor7)", zone: "naped" },
    "557": { name: "BŁĘDY MODUŁÓW (mKD_Error)", zone: "system" },
    "571": { name: "ZASILANIE / AKU (mBSG_2)", zone: "naped" },
    "575": { name: "STATUS ŚWIATEŁ (mBSG_3)", zone: "komfort" },
    "60E": { name: "JEDNOSTKI (mEinheiten)", zone: "media" },
    "621": { name: "PALIWO / RĘCZNY (mKombi_K1)", zone: "naped" },
    "62F": { name: "WYŚWIETLACZ MFA (mDisplay_1)", zone: "media" },
    "635": { name: "ŚCIEMNIANIE DESKI (mDimmung)", zone: "komfort" },
    "651": { name: "FLAGI SYSTEMU (mSysteminfo)", zone: "system" },
    "653": { name: "REGION / JĘZYK (mGateway_3)", zone: "media" },
    "655": { name: "LISTA MODUŁÓW (mVerbauliste)", zone: "system" },
    "65D": { name: "CZAS / PRZEBIEG (mDiagnose_1)", zone: "media" },
    "65F": { name: "VIN POJAZDU (mFzg_Ident)", zone: "system" }
};

// Pamięć kafelków: { "0x470": DOMElement }
const activeCards = {};
// Rejestr błędów: { "PY:SERIAL_LOST": { count: 5, row: DOMElement } }
const errorRegistry = {};

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
        handleCANFrame(idHex.toUpperCase(), dataHex);
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
        <div class="id-label">0x${id}</div>
        <h2>${def.name}</h2>
        <span class="val">-- -- --</span>
        <div class="grid">
            </div>
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
    
    document.getElementById('modal-title').textContent = `[0x${id}] ${def.name}`;
    
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
        case "151": decodeAirbagData(hexData, cardElement); break;
        case "291": decodeZKEData(hexData, cardElement); break;
        case "2C1": decodeManetkiData(hexData, cardElement); break;
        case "2C3": decodeZASData(hexData, cardElement); break;
    }
}

// =========================================
// DEKODERY POSZCZEGÓLNYCH RAMEK
// =========================================

// Dekoder dla 0x151 (mAirbag_1)
function decodeAirbagData(hexData, cardElement) {
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
    frameDataCache["151"] = fullData;

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
function decodeZKEData(hexData, cardElement) {
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
    frameDataCache["291"] = fullData;

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
function decodeManetkiData(hexData, cardElement) {
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
    frameDataCache["2C1"] = fullData;

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
function decodeZASData(hexData, cardElement) {
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
    frameDataCache["2C3"] = fullData;

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