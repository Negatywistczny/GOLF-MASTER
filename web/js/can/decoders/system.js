import { extractCANSignal } from "../../shared/canUtils.js";
import { signalMeta, frameDataCache } from "../../state/index.js";

export function decodeAirbagData(id, hexData, cardElement) {
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
    } else {
        html += `<div class="ind active-green full-width">SYSTEM AIRBAG OK</div>`;
    }

    // Alarm zderzeniowy: wszystkie bity crash z mAirbag_1 (id_ramek.txt 0x151) + CrashStaerke > 0
    const crashBits =
        fullData.AB1_FrontCrash === 1 ||
        fullData.AB1_HeckCrash === 1 ||
        fullData.AB1_Crash_FT === 1 ||
        fullData.AB1_Crash_BT === 1 ||
        fullData.AB1_Rollover === 1;
    if (fullData.AB1_CrashStaerke > 0 || crashBits) {
        html += `<div class="ind active-error full-width blink-fast">WYPADEK / CRASH DETECTED!</div>`;
    }

    gridContainer.innerHTML = html;
}

export function decodeGateway1Data(id, hexData, cardElement) {
    // mGateway_1 (0x351), DLC 8 B — data/id_ramek.txt: bity 0–1, 9–23 (prędkość), 63
    const fullData = {
        "GW1_FhzgGeschw_alt": extractCANSignal(hexData, 0, 1),
        "GW1_Rueckfahrlicht": extractCANSignal(hexData, 1, 1),
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
        html += `<div class="ind active-orange full-width">ŚWIATŁO WSTECZNE (COFANIE)</div>`;
    } else {
        html += `<div class="ind full-width">BIEG WSTECZNY WYŁ.</div>`;
    }

    // --- Prędkość pojazdu ---
    // Dokumentacja mówi, że wartości od 327.08 wzwyż (wartości RAW > 32700) oznaczają błędy/inicjalizację
    if (fullData.GW1_FzgGeschw >= 327.00) {
        html += `<div class="ind active-error full-width">BŁĄD DANYCH PRĘDKOŚCI (ABS)</div>`;
    } else {
        // Wyświetlamy prędkość zaokrągloną do jednego miejsca po przecinku
        html += `<div class="ind active-blue full-width">PRĘDKOŚĆ: ${fullData.GW1_FzgGeschw.toFixed(1)} km/h</div>`;
    }

    // --- Ostrzeżenia o utracie łączności (Veraltet) ---
    // Jeśli jakikolwiek sygnał diagnostyczny o błędzie (Timeout) jest ustawiony na 1, zapalamy małą kontrolkę
    if (fullData.GW1_FhzgGeschw_alt === 1 || fullData.KKO_alt_mBSG_Kombi === 1) {
        html += `<div class="ind active-error full-width">OPÓŹNIENIE NA MAGISTRALI (TIMEOUT)</div>`;
    }

    gridContainer.innerHTML = html;
}

function buildNmWakeReasons(fullData) {
    const wakeReasons = [];
    if (fullData.NMGW_I_Kl_15 === 1) wakeReasons.push("ZAPŁON (KL.15)");
    if (fullData.NMGW_I_Komfort_CAN === 1) wakeReasons.push("CAN KOMFORT");
    if (fullData.NMGW_I_Info_CAN === 1) wakeReasons.push("CAN INFO");
    if (fullData.NMGW_I_Diag_CAN === 1) wakeReasons.push("CAN DIAGNOSTYKA");
    if (fullData.NMGW_I_CAN === 1) wakeReasons.push("CAN (OGÓLNY)");
    if (fullData.NMGW_I_Kl_30_Reset === 1) wakeReasons.push("RESET ZASILANIA");
    if (fullData.NMGW_I_Wake_Up_Ltg === 1) wakeReasons.push("LINIA WAKE-UP");
    if (fullData.NMGW_I_Fkt_Nachlauf === 1) wakeReasons.push("TIMER (NACHLAUF)");
    if (fullData.NMGW_I_NWake === 1) wakeReasons.push("NWAKE");
    if (fullData.NMGW_I_LIN1 === 1) wakeReasons.push("LIN 1");
    if (fullData.NMGW_I_LIN2 === 1) wakeReasons.push("LIN 2");
    return wakeReasons;
}

export function decodeNMGatewayIData(id, hexData, cardElement) {
    // mNM_Gateway_I (0x42B), 6 B — data/id_ramek.txt (19 sygnałów; zarezerwowany bit 11 między LimpHome a SleepInd; bity 27–29 przed Kl.15)
    const rawData = {
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

    const previousData = frameDataCache[id] || {};
    const isRingOnlyFrame = rawData.NMGW_I_CmdRing === 1 && rawData.NMGW_I_CmdAlive !== 1;
    const latchedFields = [
        "NMGW_I_Kl_30_Reset",
        "NMGW_I_Fkt_Nachlauf",
        "NMGW_I_NWake",
        "NMGW_I_CAN",
        "NMGW_I_Wake_Up_Ltg",
        "NMGW_I_Komfort_CAN",
        "NMGW_I_Info_CAN",
        "NMGW_I_Kl_15",
        "NMGW_I_Diag_CAN",
        "NMGW_I_LIN1",
        "NMGW_I_LIN2",
        "NMGW_I_WakeUp2",
        "NMGW_I_WakeUp3"
    ];

    const fullData = { ...rawData };
    // Ramki RING nie niosą stabilnych danych o powodach wybudzenia (bajty 2+),
    // więc podtrzymujemy ostatni poprawny stan z ALIVE, aby nie zerować widoku.
    if (isRingOnlyFrame) {
        for (const fieldName of latchedFields) {
            if (previousData[fieldName] !== undefined) {
                fullData[fieldName] = previousData[fieldName];
            }
        }
    }

    let busMode = "AKTYWNA (AWAKE)";
    if (fullData.NMGW_I_SleepInd === 1 && fullData.NMGW_I_SleepAck === 1) {
        busMode = "USYPIANIE (SLEEP)";
    } else if (fullData.NMGW_I_SleepInd === 1 || fullData.NMGW_I_SleepAck === 1) {
        busMode = "ŻĄDANIE UŚPIENIA";
    }

    const nmModes = [];
    if (fullData.NMGW_I_CmdRing === 1) nmModes.push("RING");
    if (fullData.NMGW_I_CmdAlive === 1) nmModes.push("ALIVE");
    const nmModeSummary = nmModes.length > 0 ? nmModes.join(" + ") : "BRAK NM";

    const wakeReasons = buildNmWakeReasons(fullData);
    const wakeSummary = wakeReasons.length > 0 ? wakeReasons.join(", ") : "BRAK POWODU WYBUDZENIA";

    fullData.NMGW_I_SUMMARY_BUS_MODE = busMode;
    fullData.NMGW_I_SUMMARY_NM_MODE = nmModeSummary;
    fullData.NMGW_I_SUMMARY_WAKE_REASON = wakeSummary;

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
    const busModeClass = fullData.NMGW_I_SUMMARY_BUS_MODE === "ŻĄDANIE UŚPIENIA" ? "active-orange" : "active-blue";
    html += `<div class="ind ${busModeClass} full-width">MAGISTRALA: ${fullData.NMGW_I_SUMMARY_BUS_MODE}</div>`;

    // --- Ramki Ring / Alive (OSEK NM) ---
    const nmModeClass = fullData.NMGW_I_SUMMARY_NM_MODE === "BRAK NM" ? "" : "active-blue";
    html += `<div class="ind ${nmModeClass} full-width">NM: ${fullData.NMGW_I_SUMMARY_NM_MODE}</div>`;

    // --- Przyczyny wybudzenia (Weckursache) ---
    const wakeClass = wakeReasons.length > 0 ? "active-blue" : "";
    html += `<div class="ind ${wakeClass} full-width">WAKE-UP: ${fullData.NMGW_I_SUMMARY_WAKE_REASON}</div>`;

    // --- Tryb Awaryjny (Limp Home) ---
    if (fullData.NMGW_I_CmdLimpHome === 1) {
        html += `<div class="ind active-error full-width blink">TRYB AWARYJNY (LIMP HOME)!</div>`;
    }

    gridContainer.innerHTML = html;
}

export function decodeKDErrorData(id, hexData, cardElement) {
    // mKD_Error (0x557), 8 B — data/id_ramek.txt (62 sygnały; bity 23 i 55 zarezerwowane)
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
        html += `<div class="ind active-error full-width blink">WYKRYTO BŁĘDY (DTC)!</div>`;
        
        // Wypisanie skróconej listy modułów z usterkami
        html += `<div class="ind active-error full-width">Moduły: ${activeErrors.join(', ')}</div>`;
    } else {
        html += `<div class="ind active-green full-width">SKANOWANIE OK - BRAK BŁĘDÓW</div>`;
    }

    gridContainer.innerHTML = html;
}

/** 0x551: brak BO_ 1361 w DBC w repozytorium — tylko surowe bajty (data/id_ramek.txt). */
export function decodeGateway551RawData(id, hexData, cardElement) {
    const parts = hexData.trim().split(/\s+/).filter(Boolean);
    const fullData = {};
    for (let i = 0; i < parts.length; i++) {
        fullData[`Byte_${i}`] = parseInt(parts[i], 16);
    }
    frameDataCache[id] = fullData;

    const valElement = cardElement.querySelector(".val");
    if (valElement) {
        valElement.setAttribute("data-decoded", "true");
        valElement.classList.add("hidden-val");
    }

    const gridContainer = cardElement.querySelector(".grid");
    if (!gridContainer) return;

    const preview = parts.length ? parts.join(" ").toUpperCase() : "—";
    gridContainer.innerHTML = `
        <div class="ind full-width">Brak mapy sygnałów w bazie projektu (0x551).</div>
        <div class="ind active-blue full-width">DLC ${parts.length}: ${preview}</div>
    `;
}

export function decodeSysteminfo1Data(id, hexData, cardElement) {
    // mSysteminfo_1 (0x651), 8 B — data/id_ramek.txt (27 sygnałów; bity 52–53 zarezerwowane przed NWDF_gueltig)
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
    const brandMeta = signalMeta.SY1_Marke?.states || {};
    const brand = (brandMeta[fullData.SY1_Marke] || "Nieznana").toUpperCase();

    let steering = fullData.SY1_Rechtslenker === 1 ? "RHD (Prawa)" : "LHD (Lewa)";
    let doors = fullData.SY1_Viertuerer === 1 ? "4/5 DRZWI" : "2/3 DRZWI";

    html += `<div class="ind full-width">ZAKODOWANO: ${brand} | ${doors} | ${steering}</div>`;

    // --- Stan usypiania magistrali ---
    let sleepState = [];
    if (fullData.SY1_Sleep_Komfort === 1) sleepState.push("KOMFORT: UŚPIONY");
    if (fullData.SY1_Sleep_Infotainment === 1) sleepState.push("INFO: UŚPIONA");

    if (sleepState.length > 0) {
        html += `<div class="ind active-orange full-width">STAN SIECI: ${sleepState.join(', ')}</div>`;
    } else {
        html += `<div class="ind active-blue full-width">STAN SIECI: WYBUDZONA (AKTYWNA)</div>`;
    }

    // --- Alert Awaryjnego Hamowania ---
    if (fullData.SY1_Notbrems_Status === 1) {
        html += `<div class="ind active-error full-width blink-fast">UWAGA: AWARYJNE HAMOWANIE!</div>`;
    }

    // --- Ostrzeżenia diagnostyczne ---
    if (fullData.SY1_Transportmode === 1) {
        html += `<div class="ind active-orange full-width">TRYB TRANSPORTOWY AKTYWNY!</div>`;
    }
    
    if (fullData.SY1_KD_Fehler === 1) {
         html += `<div class="ind active-error">BŁĄD GATEWAY (DTC)</div>`;
    }

    gridContainer.innerHTML = html;
}

export function decodeSollverbauData(id, hexData, cardElement) {
    // mSollverbau_neu (0x655), 8 B — data/id_ramek.txt (64 sygnały po 1 bicie)
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

    html += `<div class="ind full-width">ZAKODOWANO MODUŁÓW: ${moduleCount}</div>`;

    // --- Flaga Rzeczywistej Instalacji (Soll = Ist) ---
    // 0 = Sollverbau ungleich Istverbau (Błąd kodowania lub brak komunikacji ze sterownikiem)
    // 1 = Sollverbau gleich Istverbau (Wszystko działa idealnie)
    if (fullData.VBN_Soll_Ist_OK === 0) {
        html += `<div class="ind active-error full-width blink">BŁĄD GATEWAY: BRAK ODPOWIEDZI STEROWNIKA (SOLL != IST)</div>`;
    } else {
        html += `<div class="ind active-green full-width">MAGISTRALA KOMPLETNA (SOLL = IST)</div>`;
    }

    // --- Krótki przegląd kluczowych modułów ---
    let keyModules = [];
    if (fullData.VBN_Motor_A === 1) keyModules.push("SILNIK");
    if (fullData.VBN_Bremse_A === 1) keyModules.push("ABS/ESP");
    if (fullData.VBN_Airbag_A === 1) keyModules.push("AIRBAG");
    if (fullData.VBN_Kombi_A === 1) keyModules.push("LICZNIKI");
    
    html += `<div class="ind full-width">GŁÓWNE: ${keyModules.join(', ')} ... [Kliknij by zobaczyć 64]</div>`;

    gridContainer.innerHTML = html;
}

export function decodeFzgIdentData(id, hexData, cardElement) {
    // mFzg_Ident (0x65F), 8 B — data/id_ramek.txt (multipleks FI1_MUX 0–2; bity 2–7 zarezerwowane; 7×8 bitów od bitu 8)
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

    let vinStatus = "KOMPLETNY";
    if (vinString.includes("XXX") || vinString.includes("---")) {
        vinStatus = "WFS_BŁĄD";
    } else if (!isComplete) {
        vinStatus = "SKANOWANIE";
    }

    fullData.FI1_SUMMARY_VIN = vinString;
    fullData.FI1_SUMMARY_VIN_STATUS = vinStatus;
    fullData.FI1_SUMMARY_MUX_STAGE = `MUX ${mux}`;

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

    // Zabezpieczenie przed niewyuczonym immo (zgodnie z dokumentacją wyświetli X lub -)
    if (fullData.FI1_SUMMARY_VIN_STATUS === "WFS_BŁĄD") {
        html += `<div class="ind active-error full-width">BŁĄD WFS (IMMO) / VIN NIEZAKODOWANY!</div>`;
        html += `<div class="ind full-width">VIN: ${fullData.FI1_SUMMARY_VIN}</div>`;
    } else if (fullData.FI1_SUMMARY_VIN_STATUS === "SKANOWANIE") {
        html += `<div class="ind active-orange full-width blink">SKANOWANIE VIN: ${fullData.FI1_SUMMARY_VIN}</div>`;
    } else {
        html += `<div class="ind active-blue full-width">${fullData.FI1_SUMMARY_VIN}</div>`;
        html += `<div class="ind full-width">NUMER NADWOZIA ZWERYFIKOWANY</div>`;
    }

    gridContainer.innerHTML = html;
}

