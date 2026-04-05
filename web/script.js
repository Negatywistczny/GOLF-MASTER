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

    // AKTUALIZACJA DANYCH
    // Na razie wszystko traktujemy jako RAW DATA
    const valElement = card.querySelector('.val');
    if (valElement) {
        valElement.textContent = data;
        valElement.classList.add('raw-data'); // Możemy ostylować surowe dane inaczej
    }
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
    document.getElementById('modal-title').textContent = `SZCZEGÓŁY RAMKI 0x${id}`;
    document.getElementById('modal-body').innerHTML = `
        <p>To jest automatycznie wygenerowany podgląd dla ramki <strong>0x${id}</strong>.</p>
        <p>Status: Nieprzypisana do kategorii (DEBUG MODE).</p>
    `;
    modal.classList.add('show');
}
