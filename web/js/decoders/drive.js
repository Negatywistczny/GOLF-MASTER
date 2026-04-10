import { extractCANSignal } from "../utils.js";
import { frameDataCache, signalMeta } from "../state.js";

export function decodeBremseGetriebeData(id, hexData, cardElement) {
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

    // Domyslnie resetuj obramowanie, aby uniknac losowego dziedziczenia koloru.
    cardElement.style.borderColor = "var(--border-color)";

    let html = ``;

    // --- Światło STOP i Hamulec ---
    // Bierzemy pod uwagę światło stop, stabilizację przyczepy i hamulec EPB
    if (fullData.PLS_Bremsleuchte === 1 || fullData.GWB_TSP_aktiv === 1 || fullData.GWB_EPB_Bremslicht === 1) {
        html += `<div class="ind active-orange full-width">ŚWIATŁO STOP WŁĄCZONE</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else {
        html += `<div class="ind full-width">HAMULEC ZWOLNIONY</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- ABS / ESP / Nagłe hamowanie ---
    if (fullData.GWB_Notbremsung === 1) {
        html += `<div class="ind active-error full-width blink-fast">NAGŁE HAMOWANIE!</div>`;
    }
    if (fullData.GWB_ABS_Bremsung === 1) {
        html += `<div class="ind active-orange">ABS AKTYWNY</div>`;
    }
    if (fullData.GWB_ESP_Eingriff === 1) {
        html += `<div class="ind active-orange blink">ESP INTERWENIUJE!</div>`;
    }

    // --- Skrzynia Biegów (Waehlhebel) ---
    const gearMeta = signalMeta.GWB_Info_Waehlhebel?.states || {};
    let bieg = gearMeta[fullData.GWB_Info_Waehlhebel] || "NIEZNANY";
    
    // Dodajemy informacje o Shift Lock (zablokowany drążek)
    let shiftLockStr = (fullData.GWB_Shift_Lock === 1) ? " 🔒 (Zablokowany)" : "";
    
    html += `<div class="ind active-blue full-width">BIEG: ${bieg}${shiftLockStr}</div>`;

    gridContainer.innerHTML = html;
}

export function decodeMotorData(id, hexData, cardElement) {
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

    // Domyslnie resetuj obramowanie, aby uniknac losowego dziedziczenia koloru.
    cardElement.style.borderColor = "var(--border-color)";

    let html = ``;

    // --- Obroty Silnika (RPM) ---
    // Z dokumentacji wynika, że raw wartość 65280 to błąd. 65280 * 0.25 = 16320.
    if (fullData.GWM_Motordrehzahl >= 16320) {
        html += `<div class="ind active-error full-width">OBROTY: BŁĄD CZYTNIKA</div>`;
    } else {
        html += `<div class="ind active-blue full-width">OBROTY: ${fullData.GWM_Motordrehzahl} RPM</div>`;
    }

    // --- Temperatura Płynu Chłodzącego ---
    // Według pliku błąd to raw wartość 255. Z przelicznikiem (255 * 0.75 - 48) daje to 143.25 °C.
    if (fullData.GWM_KuehlmittelTemp >= 143) {
        html += `<div class="ind active-error full-width">TEMP. PŁYNU: BŁĄD CZUJNIKA</div>`;
    } else {
        html += `<div class="ind active-blue full-width">TEMP: ${fullData.GWM_KuehlmittelTemp.toFixed(1)} °C</div>`;
    }

    // --- Pedał Sprzęgła ---
    // Wartość 0 = wciśnięty (rozłączony napęd) | 1 = puszczony (zasprzęglony)
    if (fullData.GWM_Kuppl_Schalter === 0) {
        html += `<div class="ind active-blue">SPRZĘGŁO: WCIŚNIĘTE</div>`;
    } else {
        html += `<div class="ind">SPRZĘGŁO: PUSZCZONE</div>`;
    }

    // --- Tempomat (GRA) ---
    // Dokumentacja dla GRA: 0=wył, 1=aktywny, 2=nadpisany gazem (overridden)
    if (fullData.GWM_GRA_Status === 1) {
        html += `<div class="ind active-green">TEMPOMAT: AKTYWNY</div>`;
        if (cardElement.style.borderColor === "var(--border-color)") {
            cardElement.style.borderColor = "var(--green)";
        }
    } else if (fullData.GWM_GRA_Status === 2) {
        html += `<div class="ind active-orange">TEMPOMAT: +GAZ KIEROWCY</div>`;
    } else {
        html += `<div class="ind">TEMPOMAT: WYŁ.</div>`;
    }

    // --- Kontrolka Świec Żarowych / Check Engine ---
    if (fullData.GWM_Vorgluehen === 1) {
        html += `<div class="ind active-orange full-width blink">ŚWIECE ŻAROWE WŁĄCZONE</div>`;
    }

    // --- Alert przegrzania silnika ---
    // Zapala kafelek na czerwono w razie alarmu Heissleuchtenvorwarnung
    if (fullData.GWM_Heissl_Vorwarn === 1) {
        html += `<div class="ind active-error full-width blink-fast">ALARM: PRZEGRZANIE SILNIKA!</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        // Resetowanie koloru, jeśli wszystko jest okej i silnik działa
        if (fullData.GWM_Motordrehzahl > 0 && fullData.GWM_Motordrehzahl < 16320) {
            cardElement.style.borderColor = "var(--border-color)";
        }
    }

    gridContainer.innerHTML = html;
}

export function decodeLenkwinkelData(id, hexData, cardElement) {
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

    // Domyslnie resetuj obramowanie, aby uniknac losowego dziedziczenia koloru.
    cardElement.style.borderColor = "var(--border-color)";

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
        
        html += `<div class="ind active-error full-width blink">STATUS: ${errTxt}</div>`;
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
        html += `<div class="ind active-blue full-width">KĄT: ${Math.abs(actualAngle).toFixed(1)}° (${dirStr})</div>`;
        html += `<div class="ind active-blue full-width">PRĘDKOŚĆ OBR: ${Math.abs(actualSpeed).toFixed(1)} °/s</div>`;
    }

    // --- Status Kalibracji / Zasilania ---
    if (fullData.LW1_KL30_Ausfall === 1) {
        html += `<div class="ind active-orange full-width">WYKRYTO ODPIĘCIE AKUMULATORA (KL30)</div>`;
    } else if (fullData.LW1_ID === 0) {
        html += `<div class="ind active-orange full-width">WYMAGANA KALIBRACJA G85</div>`;
    }

    gridContainer.innerHTML = html;
}

export function decodeMotor7Data(id, hexData, cardElement) {
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

    // Domyslnie resetuj obramowanie, aby uniknac losowego dziedziczenia koloru.
    cardElement.style.borderColor = "var(--border-color)";

    let html = ``;

    // --- Ciśnienie doładowania (Turbo) ---
    // Wartość 255 (czyli po przeliczeniu 5.10) to błąd
    if (fullData.MO7_Ladedruckneu > 5.0) {
        html += `<div class="ind active-error full-width">DOŁADOWANIE (TURBO): BŁĄD CZUJNIKA</div>`;
    } else {
        html += `<div class="ind active-blue full-width">ZADANE TURBO: ${fullData.MO7_Ladedruckneu.toFixed(2)} bar</div>`;
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
        html += `<div class="ind active-blue full-width">TEMP. OLEJU: ${fullData.MO7_Oeltemperatur} °C</div>`;
    }

    // --- Gradient obrotów silnika (przyspieszenie) ---
    let gradient = fullData.MO7_Gradient_Drehz;
    if (fullData.MO7_Gradient_Vorz === 1) gradient = -gradient; // ujemny spadek obrotów
    
    if (fullData.MO7_Gradient_Drehz >= 127) {
        html += `<div class="ind active-orange full-width">PRZYSPIESZENIE RPM: MAX (>127)</div>`;
    } else {
        // Zaznaczamy na zielono gdy rośnie, a na czerwono jak hamujesz silnikiem
        let gradColor = gradient > 0 ? "active-blue" : (gradient < 0 ? "active-orange" : "active-blue");
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

export function decodeBSG2Data(id, hexData, cardElement) {
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

    // Domyslnie resetuj obramowanie, aby uniknac losowego dziedziczenia koloru.
    cardElement.style.borderColor = "var(--border-color)";

    let html = ``;

    // --- Napięcie Akumulatora (Bordnetz) ---
    // Maksymalna wartość błędu wynosi FF (255), co po przeliczeniu x0.05 + 5 daje 17.75V
    if (fullData.BS2_U_BATT >= 17.7) {
        html += `<div class="ind active-error full-width">NAPIĘCIE (GŁÓWNE): BŁĄD ODCZYTU</div>`;
    } else {
        html += `<div class="ind active-blue full-width">AKUMULATOR (GŁÓWNY): ${fullData.BS2_U_BATT.toFixed(2)} V</div>`;
    }

    // --- Drugi akumulator (opcja dla Webasto itp.) ---
    if (fullData.BS2_VB_2_Battarie === 1) {
        if (fullData.BS2_U_Start_BATT >= 17.7) {
            html += `<div class="ind active-error full-width">NAPIĘCIE (DODATKOWE): BŁĄD</div>`;
        } else {
            html += `<div class="ind active-blue full-width">AKUMULATOR (DODATK.): ${fullData.BS2_U_Start_BATT.toFixed(2)} V</div>`;
        }
    }

    // --- Zarządzanie obciążeniem (Load Management) ---
    if (fullData.BS2_Lastman_aktiv === 1 || fullData.BS2_Verbr_ab_aktiv === 1) {
        html += `<div class="ind active-orange full-width">ZARZĄDZANIE ENERGIĄ: AKTYWNE</div>`;
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
            html += `<div class="ind active-orange full-width">ODCIĘTO: ${cutoffs.join(', ')}</div>`;
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
        html += `<div class="ind active-error full-width blink">BŁĄD: ZWARCIE LINII ROZRUSZNIKA (MASA)</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    gridContainer.innerHTML = html;
}

export function decodeKombiK1Data(id, hexData, cardElement) {
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

    // Domyslnie resetuj obramowanie, aby uniknac losowego dziedziczenia koloru.
    cardElement.style.borderColor = "var(--border-color)";

    let html = ``;

    // --- Poziom Paliwa i Rezerwa ---
    // Zgodnie z dokumentacją: 127 = Błąd czujnika
    if (fullData.KO1_Tankinhalt >= 127) {
        html += `<div class="ind active-error full-width">POZIOM PALIWA: BŁĄD PŁYWAKA</div>`;
    } else {
        let fuelColor = "var(--green)";
        if (fullData.KO1_Tankwarnlampe === 1 || fullData.KO1_Tankwarnung === 1) { // Zapalona rezerwa
            fuelColor = "var(--orange)";
        }
        if (fullData.KO1_Tankstop === 1) { // Rozpoznano tankowanie
             html += `<div class="ind active-blue full-width">TANKOWANIE...</div>`;
        }
        
        html += `<div class="ind active-blue full-width">PALIWO: ${fullData.KO1_Tankinhalt} L</div>`;
    }

    // --- Czas Postoju (Standzeit) ---
    if (fullData.KO1_Standzeit_Fehler === 1) { // Błąd resetu czasu po odpięciu klemy
         html += `<div class="ind active-error full-width">CZAS POSTOJU: BŁĄD ZASILANIA (KL. 30)</div>`;
    } else {
        // Przeliczamy sekundy na format HH:MM:SS
        let h = Math.floor(fullData.KO1_Standzeit / 3600);
        let m = Math.floor((fullData.KO1_Standzeit % 3600) / 60);
        let s = fullData.KO1_Standzeit % 60;
        let timeStr = `${h}h ${m}m ${s}s`;
        
        html += `<div class="ind active-blue full-width">CZAS POSTOJU: ${timeStr}</div>`;
    }

    // --- Ostrzeżenia na desce ---
    let alerts = [];
    if (fullData.KO1_Handbremse === 1) alerts.push("HAMULEC RĘCZNY"); //
    if (fullData.KO1_WaschWasser === 1) alerts.push("PŁYN SPRYSK."); //
    
    if (alerts.length > 0) {
        html += `<div class="ind active-orange full-width">KONTROLKI: ${alerts.join(', ')}</div>`;
        cardElement.style.borderColor = "var(--orange)";
    }

    // --- Podświetlenie Wnętrza / Zegarów ---
    // 127 = błąd
    if (fullData.KO1_Bel_Displ < 127) {
         html += `<div class="ind active-blue">ŚCIEMNIACZ ZEGARÓW: ${fullData.KO1_Bel_Displ}%</div>`;
    }

    gridContainer.innerHTML = html;
}

