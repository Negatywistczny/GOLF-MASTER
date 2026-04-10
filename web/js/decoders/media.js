import { extractCANSignal } from "../utils.js";
import { frameDataCache } from "../state.js";

export function decodeGWKombiData(id, hexData, cardElement) {
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

export function decodeEinheitenData(id, hexData, cardElement) {
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

export function decodeDisplay1Data(id, hexData, cardElement) {
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

export function decodeGateway3Data(id, hexData, cardElement) {
    // 1. WYCIĄGANIE ABSOLUTNIE WSZYSTKICH SYGNAŁÓW Z DOKUMENTACJI (7 sygnałów)
    const fullData = {
        "GW3_Laendervariante": extractCANSignal(hexData, 0, 6),
        "GW3_Alt_3_Kombi": extractCANSignal(hexData, 6, 1),
        "GW3_Land_Sprach_empf": extractCANSignal(hexData, 7, 1),
        "GW3_Sprachvariante": extractCANSignal(hexData, 8, 8),
        "GW3_Motortyp": extractCANSignal(hexData, 16, 6),
        "GW3_Alt_5_Motor": extractCANSignal(hexData, 22, 1),
        "GW3_Motortyp_empf": extractCANSignal(hexData, 23, 1)
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
    // Sprawdzamy czy dane nie są wartościami początkowymi (Initwert)
    if (fullData.GW3_Land_Sprach_empf === 1) {
        let country = "NIEZNANY";
        switch (fullData.GW3_Laendervariante) {
            case 0: country = "NIEMCY"; break;
            case 1: country = "EUROPA"; break;
            case 2: country = "USA"; break;
            case 3: country = "KANADA"; break;
            case 4: country = "WIELKA BRYTANIA"; break; 
            case 5: country = "JAPONIA"; break;
            case 6: country = "ARABIA SAUDYJSKA"; break;
            case 7: country = "AUSTRALIA"; break;
        }

        let lang = "NIEZNANY";
        switch (fullData.GW3_Sprachvariante) {
            case 0: lang = "BRAK"; break; 
            case 1: lang = "NIEMIECKI"; break;
            case 2: lang = "ANGIELSKI"; break;
            case 3: lang = "FRANCUSKI"; break;
            case 4: lang = "WŁOSKI"; break;
            case 5: lang = "HISZPAŃSKI"; break;
            case 6: lang = "PORTUGALSKI"; break;
            case 8: lang = "CZESKI"; break;
            case 9: lang = "CHIŃSKI"; break;
            case 10: lang = "US-ANGIELSKI"; break;
            case 11: lang = "HOLENDERSKI"; break;
            case 12: lang = "JAPOŃSKI"; break;
            case 13: lang = "ROSYJSKI"; break;
            case 14: lang = "KOREAŃSKI"; break;
            case 15: lang = "FRANCO-KANADYJSKI"; break;
            case 16: lang = "SZWEDZKI"; break;
            case 17: lang = "POLSKI"; break;
            case 18: lang = "TURECKI"; break; 
        }
        
        html += `<div class="ind active-blue full-width">REGION: ${country} | JĘZYK: ${lang}</div>`;
        cardElement.style.borderColor = "var(--blue)";
    } else {
        html += `<div class="ind full-width">REGION/JĘZYK: DANE OCZEKUJĄCE...</div>`;
        cardElement.style.borderColor = "var(--border-color)";
    }

    // --- Typ Silnika ---
    if (fullData.GW3_Motortyp_empf === 1) { //
        // Bity 0-3 określają liczbę cylindrów (np. 4 dla R4, 6 dla V6) 
        let cyl = fullData.GW3_Motortyp & 0x0F; 
        // Bit 4 odpowiada za obecność turbosprężarki (Turbo_M)
        let isTurbo = (fullData.GW3_Motortyp & 0x10) ? " (TURBO)" : ""; 
        
        let cylStr = cyl > 0 ? `${cyl} CYL.` : "NIEZNANY";
        
        html += `<div class="ind active full-width" style="opacity: 0.9;">SILNIK: ${cylStr}${isTurbo}</div>`;
    }

    // --- Flagi Opóźnień (Timeout) ---
    // Gateway informuje czy paczki z licznika (>100ms) i silnika się nie spóźniają 
    if (fullData.GW3_Alt_3_Kombi === 1 || fullData.GW3_Alt_5_Motor === 1) {
        html += `<div class="ind active-error full-width">OPÓŹNIENIE MAGISTRALI (TIMEOUT)!</div>`;
    }

    gridContainer.innerHTML = html;
}

export function decodeDiagnose1Data(id, hexData, cardElement) {
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

