import { extractCANSignal } from "../utils.js";
import { frameDataCache } from "../state.js";

export function decodeZKEData(id, hexData, cardElement) {
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
        html += `<div class="ind active-error full-width blink">PILOT: PANIC!</div>`;
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

export function decodeManetkiData(id, hexData, cardElement) {
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
        html += `<div class="ind active-green">&#8592; KIERUNEK LEWY</div>`;
        cardElement.style.borderColor = "var(--green)";
    } else if (fullData.LS1_Blk_rechts === 1) {
        html += `<div class="ind active-green">KIERUNEK PRAWY &#8594;</div>`;
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

export function decodeZASData(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI
    // Ramka stacyjki (Klemmen) w PQ35 opiera się na podstawowych bitach zacisków.
    const fullData = {
        "ZS1_ZAS_Kl_S": extractCANSignal(hexData, 0, 1),   // Zacisk S (Kluczyk w stacyjce)
        "ZS1_ZAS_Kl_15": extractCANSignal(hexData, 1, 1),  // Zacisk 15 (Zapłon ON)
        "ZS1_ZAS_Kl_X": extractCANSignal(hexData, 2, 1),  // Zacisk X (Akcesoria)
        "ZS1_ZAS_Kl_50": extractCANSignal(hexData, 3, 1),  // Zacisk 50 (Rozrusznik kręci)
        "ZS1_ZAS_Kl_P": extractCANSignal(hexData, 4, 1),   // Zacisk P (Światła postojowe/parkingowe stacyjki)
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
    if (fullData.ZS1_ZAS_Kl_50 === 1) {
        html += `<div class="ind active-lock full-width blink-fast">ROZRUSZNIK (KL. 50)</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else if (fullData.ZS1_ZAS_Kl_15 === 1) {
        html += `<div class="ind active-green full-width">ZAPŁON WŁĄCZONY (KL. 15)</div>`;
        cardElement.style.borderColor = "var(--green)";
    } else if (fullData.ZS1_ZAS_Kl_X === 1) {
        html += `<div class="ind active full-width">AKCESORIA (KL. X)</div>`;
        cardElement.style.borderColor = "var(--accent)";
    } else if (fullData.ZS1_ZAS_Kl_S === 1) {
        html += `<div class="ind active full-width">KLUCZYK W STACYJCE (KL. S)</div>`;
        cardElement.style.borderColor = "var(--accent)";
    } else {
        html += `<div class="ind full-width">BRAK KLUCZYKA</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    gridContainer.innerHTML = html;
}

export function decodeClima1Data(id, hexData, cardElement) {
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
        html += `<div class="ind active-orange full-width blink">NAGRZEWNICA PTC AKTYWNA: ${fullData.CL1_PTC_Clima}%</div>`;
    }

    // --- Temperatura Zewnętrzna (Podszybie) ---
    if (fullData.CL1_AussenTemp > 77) {
        html += `<div class="ind active-error full-width">TEMP. ZEWN: BŁĄD CZUJNIKA</div>`;
    } else {
        html += `<div class="ind active full-width">TEMP. ZEWN: ${fullData.CL1_AussenTemp.toFixed(1)} °C</div>`;
    }

    gridContainer.innerHTML = html;
}

export function decodeClima2Data(id, hexData, cardElement) {
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
        html += `<div class="ind active full-width">TEMP. WNĘTRZA: ${fullData.CL2_InnenTemp.toFixed(1)} °C</div>`;
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
        html += `<div class="ind active-red blink">WEBASTO WŁĄCZONE!</div>`;
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

export function decodeBSGKombiData(id, hexData, cardElement) {
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
        html += `<div class="ind active-error full-width">MASKA SILNIKA OTARTA!</div>`;
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
        html += `<div class="ind active-error full-width blink">&#8592; ŚWIATŁA AWARYJNE &#8594;</div>`;
    } else if (fullData.BSK_Blk_links === 1) {
        html += `<div class="ind active-green">&#8592; KIERUNKOWSKAZ</div>`;
    } else if (fullData.BSK_Blk_rechts === 1) {
        html += `<div class="ind active-green">KIERUNKOWSKAZ &#8594;</div>`;
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
        html += `<div class="ind active-error full-width blink-fast">BRAK ŁADOWANIA / NISKIE NAPIĘCIE!</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    gridContainer.innerHTML = html;
}

export function decodeBSG3Data(id, hexData, cardElement) {
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
        batStatus = `<div class="ind active-error full-width blink">BATERIA ROZŁADOWANA!</div>`;
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
            html += `<div class="ind active-orange blink">WCIŚNIJ SPRZĘGŁO/HAMULEC</div>`;
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

export function decodeDimmungData(id, hexData, cardElement) {
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
        html += `<div class="ind active full-width">CZUJNIK ŚWIATŁA: Wartość ${fullData.DI1_Sensor}</div>`;
        cardElement.style.borderColor = "var(--blue)";
    }

    gridContainer.innerHTML = html;
}

