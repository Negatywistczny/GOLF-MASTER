/*
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
 * Source of truth: web/js/*.js modules.
 * Regenerate with: python3 web/build_offline_bundle.py
 */

// ===== js/config.js =====
const WS_URL = "ws://localhost:8765";

// ===== js/state.js =====
const signalMeta = Object.freeze({

    // ==========================================
    // 0x151 - PODUSZKI POWIETRZNE (mAirbag_1)
    // ==========================================
    "AB1_FrontCrash": { label: "Zderzenie czołowe", states: { 0: "Brak", 1: "WYKRYTO ZDERZENIE" } },
    "AB1_HeckCrash": { label: "Zderzenie tylne", states: { 0: "Brak", 1: "WYKRYTO ZDERZENIE" } },
    "AB1_Crash_FT": { label: "Zderzenie boczne (Kierowca)", states: { 0: "Brak", 1: "WYKRYTO ZDERZENIE" } },
    "AB1_Crash_BT": { label: "Zderzenie boczne (Pasażer)", states: { 0: "Brak", 1: "WYKRYTO ZDERZENIE" } },
    "AB1_Rollover": { label: "Rolowanie (Dachowanie)", states: { 0: "Brak", 1: "WYKRYTO DACHOWANIE" } },
    "AB1_CrashStaerke": { label: "Siła zderzenia", states: { 0: "Brak zderzenia", 1: "Napinacze pasów", 2: "Próg US (Niski)", 3: "Próg US (Wysoki)", 4: "Próg RoW", 5: "Próg RoW", 6: "Próg RoW", 7: "Odcięcie paliwa" } },
    "AB1_AirbagLampe_ein": { label: "Kontrolka poduszki powietrznej", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "AB1_Airbag_deaktiviert": { label: "System Airbag", states: { 0: "Aktywny", 1: "DEZAKTYWOWANY" } },
    "AB1_Beif_Airbag_deaktiviert": { label: "Poduszka pasażera", states: { 0: "Aktywna", 1: "WYŁĄCZONA Z KLUCZYKA" } },
    "AB1_Systemfehler": { label: "Błąd systemu Airbag", states: { 0: "System OK", 1: "USTERKA SYSTEMU" } },
    "AB1_Fa_Gurt": { label: "Zapięcie pasa kierowcy", states: { 0: "Niedostępne", 1: "Błąd czujnika", 2: "NIEZAPIĘTY", 3: "Zapięty" } },
    "AB1_Bf_Gurt": { label: "Zapięcie pasa pasażera", states: { 0: "Niedostępne", 1: "Błąd czujnika", 2: "NIEZAPIĘTY", 3: "Zapięty" } },
    "AB1_Diagnose": { label: "Tryb diagnostyki Airbag", states: { 0: "Nieaktywny", 1: "W TRAKCIE DIAGNOZY" } },
    "AB1_Stellglied": { label: "Test elementów wykonawczych", states: { 0: "Nieaktywny", 1: "TEST AKTYWNY" } },
    "AB1_BF_Anschnall": { label: "Ostrzeżenie o pasie pasażera", states: { 0: "Brak ostrzeżenia", 1: "ALARM AKTYWNY" } },
    "AB1_KD_Fehler": { label: "Błąd diagnostyczny w pamięci", states: { 0: "Brak", 1: "ZAPISANY BŁĄD" } },
    "AB1_MessageZaehler": { label: "Licznik wiadomości (Alive-Counter)", unit: "" },
    "AB1_Pruefsumme": { label: "Suma kontrolna ramki", unit: "" },

    // ==========================================
    // 0x291 - ZAMEK CENTRALNY I KOMFORT (mZKE_1)
    // ==========================================
    "ZK1_Funkschl_Nr": { label: "Numer kluczyka (Pilot)", unit: "" },
    "ZK1_433_MHz": { label: "Częstotliwość pilota", states: { 0: "315 MHz", 1: "433 MHz" } },
    "ZK1_Taste_HDF": { label: "Przycisk pilota: Bagażnik", states: { 0: "Zwolniony", 1: "WCIŚNIĘTY" } },
    "ZK1_Taste_Panik": { label: "Przycisk pilota: Panik", states: { 0: "Zwolniony", 1: "WCIŚNIĘTY" } },
    "ZK1_Taste_Auf": { label: "Przycisk pilota: Otwórz", states: { 0: "Zwolniony", 1: "WCIŚNIĘTY" } },
    "ZK1_Taste_Zu": { label: "Przycisk pilota: Zamknij", states: { 0: "Zwolniony", 1: "WCIŚNIĘTY" } },
    "ZK1_FT_verriegeln": { label: "Zablokuj drzwi kierowcy", states: { 0: "Brak", 1: "ZABLOKUJ" } },
    "ZK1_FT_entriegeln": { label: "Odblokuj drzwi kierowcy", states: { 0: "Brak", 1: "ODBLOKUJ" } },
    "ZK1_BT_verriegeln": { label: "Zablokuj drzwi pasażera", states: { 0: "Brak", 1: "ZABLOKUJ" } },
    "ZK1_BT_entriegeln": { label: "Odblokuj drzwi pasażera", states: { 0: "Brak", 1: "ODBLOKUJ" } },
    "ZK1_HL_verriegeln": { label: "Zablokuj drzwi tył-lewe", states: { 0: "Brak", 1: "ZABLOKUJ" } },
    "ZK1_HL_entriegeln": { label: "Odblokuj drzwi tył-lewe", states: { 0: "Brak", 1: "ODBLOKUJ" } },
    "ZK1_HR_verriegeln": { label: "Zablokuj drzwi tył-prawe", states: { 0: "Brak", 1: "ZABLOKUJ" } },
    "ZK1_HR_entriegeln": { label: "Odblokuj drzwi tył-prawe", states: { 0: "Brak", 1: "ODBLOKUJ" } },
    "ZK1_Zent_safen": { label: "Centralne ryglowanie (Safe)", states: { 0: "Brak", 1: "ZARYGLUJ" } },
    "ZK1_Zent_entsafen": { label: "Centralne odryglowanie", states: { 0: "Brak", 1: "ODRYGLUJ" } },
    "ZK1_HD_verriegeln": { label: "Zablokuj bagażnik", states: { 0: "Brak", 1: "ZABLOKUJ" } },
    "ZK1_HD_entriegeln": { label: "Odblokuj bagażnik", states: { 0: "Brak", 1: "ODBLOKUJ" } },
    "ZK1_HD_oeffnen": { label: "Otwórz bagażnik", states: { 0: "Brak", 1: "OTWÓRZ" } },
    "ZK1_HD_schliessen": { label: "Zamknij bagażnik", states: { 0: "Brak", 1: "ZAMKNIJ" } },
    "ZK1_LED_Steuerung": { label: "Dioda LED w drzwiach (Safe)", states: { 0: "Wyłączona", 1: "MIGA (AKTYWNA)" } },
    "ZK1_LED_Uebernahme": { label: "Przejęcie sterowania LED", states: { 0: "Brak", 1: "PRZEJĘTE" } },
    "ZK1_Dongle_Nr": { label: "Numer modułu dachu (Dongle)", unit: "" },
    "ZK1_Dongle_Freq": { label: "Częstotliwość dachu", states: { 0: "315 MHz", 1: "433 MHz" } },
    "ZK1_Verdeck_auf": { label: "Otwieranie dachu", states: { 0: "Brak", 1: "OTWÓRZ" } },
    "ZK1_Verdeck_zu": { label: "Zamykanie dachu", states: { 0: "Brak", 1: "ZAMKNIJ" } },
    "ZK1_LeaveHome_aktiv": { label: "Funkcja Leaving Home", states: { 0: "Nieaktywna", 1: "AKTYWNA" } },
    "ZK1_HL_Tuer_offen": { label: "Drzwi tył-lewe", states: { 0: "Zamknięte", 1: "OTWARTE" } },
    "ZK1_HR_Tuer_offen": { label: "Drzwi tył-prawe", states: { 0: "Zamknięte", 1: "OTWARTE" } },
    "ZK1_SL_Anf": { label: "Żądanie: Drzwi przesuwne lewe", states: { 0: "Brak", 1: "AKTYWNE" } },
    "ZK1_SR_Anf": { label: "Żądanie: Drzwi przesuwne prawe", states: { 0: "Brak", 1: "AKTYWNE" } },

    // ==========================================
    // 0x2C1 - MANETKI I KIEROWNICA (mLSM_1)
    // ==========================================
    "LS1_Blk_links": { label: "Kierunkowskaz lewy", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "LS1_Blk_rechts": { label: "Kierunkowskaz prawy", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "LS1_Lichthupe": { label: "Blinda (Mruganie długimi)", states: { 0: "Nieaktywna", 1: "AKTYWNA" } },
    "LS1_Fernlicht": { label: "Światła drogowe (Długie)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "LS1_Parklicht_links": { label: "Światła postojowe lewe", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "LS1_Parklicht_rechts": { label: "Światła postojowe prawe", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "LS1_Signalhorn": { label: "Klakson", states: { 0: "Cisza", 1: "TRĄBI" } },
    "LS1_Tipwischen": { label: "Pojedyncze przetarcie szyby", states: { 0: "Brak", 1: "AKTYWNE" } },
    "LS1_Intervall": { label: "Wycieraczki przód (Interwał/Auto)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "LS1_WischenStufe_1": { label: "Wycieraczki przód (Bieg 1)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "LS1_WischenStufe_2": { label: "Wycieraczki przód (Bieg 2)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "LS1_Frontwaschen": { label: "Spryskiwacz przód", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "LS1_Bew_Frontwaschen": { label: "Analiza spryskiwacza przód", states: { 0: "Brak", 1: "POTWIERDZONE" } },
    "LS1_Heckintervall": { label: "Wycieraczka tył (Interwał)", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "LS1_Heckwaschen": { label: "Spryskiwacz tył", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "LS1_Intervallstufen": { label: "Czułość wycieraczek (0-15)", unit: "" },
    "LS1_BC_Down_Cursor": { label: "MFA Przycisk: W dół", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "LS1_BC_Up_Cursor": { label: "MFA Przycisk: W górę", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "LS1_BC_Reset": { label: "MFA Przycisk: Reset / OK", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "LS1_KD_Fehler": { label: "Błąd modułu kierownicy", states: { 0: "Brak błędów", 1: "⚠️ ZAPISANO BŁĄD" } },
    "LS1_LSY_oben": { label: "Regulacja kolumny Y+", states: { 0: "Zwolniona", 1: "AKTYWNA" } },
    "LS1_LSY_unten": { label: "Regulacja kolumny Y-", states: { 0: "Zwolniona", 1: "AKTYWNA" } },
    "LS1_LSZ_vor": { label: "Regulacja kolumny Z+", states: { 0: "Zwolniona", 1: "AKTYWNA" } },
    "LS1_LSZ_zurueck": { label: "Regulacja kolumny Z-", states: { 0: "Zwolniona", 1: "AKTYWNA" } },
    "LS1_ELV_enable": { label: "Sterowanie blokadą (ELV)", states: { 0: "Odblokuj", 1: "Zablokuj" } },
    "LS1_def_ELV_Enable": { label: "Diagnostyka przewodu ELV", states: { 0: "System OK", 1: "⚠️ USTERKA ELV" } },
    "LS1_Easy_Entry_LS": { label: "Kierownica Easy Entry", states: { 0: "Wyłączona", 1: "AKTYWNA" } },
    "LS1_LHeizung_aktiv": { label: "Podgrzewanie kierownicy", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "LS1_Winterstellung": { label: "Wycieraczki: Tryb zimowy", states: { 0: "Wyłączony", 1: "AKTYWNY" } },
    "LS1_MFL_vorhanden": { label: "Obecność multifunkcji (MFL)", states: { 0: "Brak", 1: "ZAMONTOWANA" } },
    "LS1_MFA_vorhanden": { label: "Przyciski komputera (MFA)", states: { 0: "Brak", 1: "ZAMONTOWANE" } },
    "LS1_MFA_Tasten": { label: "Ilość przycisków MFA", states: { 0: "3 przyciski", 1: "4 przyciski" } },
    "LS1_def_P_Verriegelt": { label: "Diagnostyka czujnika Park", states: { 0: "System OK", 1: "⚠️ AWARIA CZUJNIKA" } },
    "LS1_MFL_Typ": { label: "Generacja multifunkcji", states: { 0: "Stary typ (Low)", 1: "Nowy typ (High)" } },
    "LS1_Servicestellung": { label: "Wycieraczki: Tryb serwisowy", states: { 0: "Wyłączony", 1: "AKTYWNY" } },
    "LS1_P_verriegelt": { label: "Blokada wyjęcia kluczyka (P)", states: { 0: "Skrzynia w P (OK)", 1: "SKRZYNIA POZA P" } },
    "LS1_FAS_Taster": { label: "Przycisk asystentów jazdy", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "LS1_Fehler_FAS_Taster": { label: "Usterka przycisku asystentów", states: { 0: "OK", 1: "BŁĄD" } },
    "LS1_Fehler_Vibration": { label: "Usterka wibracji kierownicy", states: { 0: "OK", 1: "BŁĄD" } },

    // ==========================================
    // 0x2C3 - STATUS STACYJKI (mZAS_Status)
    // ==========================================
    "ZS1_ZAS_Kl_S": { label: "Styk S (Obecność kluczyka)", states: { 0: "Brak kluczyka", 1: "KLUCZYK WŁOŻONY" } },
    "ZS1_ZAS_Kl_15": { label: "Zacisk 15 (Zapłon)", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "ZS1_ZAS_Kl_X": { label: "Zacisk X (Przekaźnik odciążający)", states: { 0: "Brak napięcia", 1: "NAPIĘCIE OBECNE" } },
    "ZS1_ZAS_Kl_50": { label: "Zacisk 50 (Rozrusznik)", states: { 0: "Wyłączony", 1: "START (PRACA)" } },
    "ZS1_ZAS_Kl_P": { label: "Zacisk P (Światła postojowe)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },

    // ==========================================
    // 0x351 - GATEWAY GŁÓWNY (mGateway_1)
    // ==========================================
    "GW1_FhzgGeschw_alt": { label: "Przestarzała ramka: Prędkość pojazdu", states: { 0: "Aktualna", 1: "Przestarzała" } },
    "GW1_Rueckfahrlicht": { label: "Światło wsteczne", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "GW1_FzgGeschw": { label: "Prędkość pojazdu", unit: " km/h", states: { 32708: "Inicjalizacja", 32725: "Zbyt niskie napięcie", 32742: "Błąd czujnika" } },
    "KKO_alt_mBSG_Kombi": { label: "Przestarzała ramka: mBSG_Kombi", states: { 0: "Aktualna", 1: "Przestarzała" } },

    // ==========================================
    // 0x359 - HAMULCE I SKRZYNIA BIEGÓW (mGW_Bremse_Getriebe)
    // ==========================================
    "GWB_Alt_FzgGeschw": { label: "Przestarzała ramka: Prędkość", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWB_Alt_2_Bremse": { label: "Przestarzała ramka: Bremse 2", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWB_Alt_1_Bremse": { label: "Przestarzała ramka: Bremse 1", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWB_Alt_1_Getriebe": { label: "Przestarzała ramka: Getriebe 1", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWB_Alt_2_Getriebe": { label: "Przestarzała ramka: Getriebe 2", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWB_Alt_1_EPB": { label: "Przestarzała ramka: EPB 1", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWB_Alt_5_Bremse": { label: "Przestarzała ramka: Bremse 5", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWB_Alt_AWV_X": { label: "Przestarzała ramka: AWV X", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWB_FzgGeschw_Quelle": { label: "Źródło prędkości pojazdu", states: { 0: "Impulsator (Skrzynia)", 1: "Czujniki ABS" } }, 
    "GWB_FzgGeschw": { label: "Prędkość pojazdu", unit: " km/h" }, 
    "GWB_Wegimpulse": { label: "Impulsy przebytej drogi (Oś przednia)", unit: "" }, 
    "GWB_Wegimpuls_Status": { label: "Status licznika impulsów drogi", states: { 0: "Brak przepełnienia", 1: "Przepełniony (Reset)" } }, 
    "GWB_Wegimpulse_Fehler": { label: "Błąd czujników ABS (Oś przednia)", states: { 0: "OK", 1: "BŁĄD" } }, 
    "GWB_Impulszahl": { label: "Ilość zębów wieńca impulsatora", unit: "" }, 
    "GWB_Alt_PLA_Status": { label: "Przestarzała ramka: Status PLA", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "PLS_Bremsleuchte": { label: "Żądanie świateł hamowania (Asystent)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } }, 
    "GWB_TSP_aktiv": { label: "Stabilizacja toru jazdy przyczepy", states: { 0: "Brak interwencji", 1: "AKTYWNA (Włącza stop)" } }, 
    "GWB_Notbremsung": { label: "Awaryjne hamowanie", states: { 0: "Brak", 1: "AWARYJNE (Ostrzeżenie)" } }, 
    "GWB_ABS_Bremsung": { label: "Praca systemu ABS", states: { 0: "Brak interwencji", 1: "AKTYWNY" } }, 
    "GWB_EPB_Status": { label: "Hamulec postojowy (EPB)", states: { 0: "Zwolniony", 1: "ZACIĄGNIĘTY" } }, 
    "GWB_EPB_Bremslicht": { label: "Światło hamowania z EPB", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } }, 
    "GWB_Schlechtweg": { label: "Wykrycie złej nawierzchni (Wyboje)", states: { 0: "Brak", 1: "ZŁA DROGA" } }, 
    "GWB_Schlechtweg_Fehler": { label: "Błąd wykrywania złej nawierzchni", states: { 0: "Ważne", 1: "Nieważne/Błąd" } }, 
    "GWB_Geschw_Ersatz": { label: "Prędkość zastępcza (Błąd czujnika)", states: { 0: "OK", 1: "WARTOŚĆ ZASTĘPCZA" } }, 
    "GWB_Schaltvorgang": { label: "Zmiana biegu w toku", states: { 0: "Brak zmiany", 1: "ZMIANA BIEGU" } }, 
    "ANB_Teilbremsung_Freigabe": { label: "Zezwolenie na hamowanie częściowe", states: { 0: "Brak zezwolenia", 1: "ZEZWOLONO" } }, 
    "GWB_ESP_Eingriff": { label: "Interwencja systemu ESP", states: { 0: "Brak interwencji", 1: "ESP AKTYWNE" } }, 
    "GWB_Shift_Lock": { label: "Blokada dźwigni zmiany biegów", states: { 0: "Odblokowana", 1: "ZABLOKOWANA" } }, 
    "GWB_Info_Waehlhebel": { label: "Pozycja dźwigni zmiany biegów", states: { 0: "Pozycja pośrednia", 1: "Bieg 1", 2: "Bieg 2", 3: "Bieg 3", 4: "Bieg 4", 5: "D (Drive)", 6: "N (Neutral)", 7: "R (Reverse)", 8: "P (Park)", 9: "Tiptronic (-)", 10: "Bieg pośredni 1", 11: "Bieg pośredni 2", 12: "S (Sport)", 13: "L (Low)", 14: "Tiptronic (+)", 15: "BŁĄD" } }, 

    // ==========================================
    // 0x35B - SILNIK GŁÓWNY (mGW_Motor)
    // ==========================================
    "GWM_Alt_1_Motor": { label: "Przestarzała ramka: Motor 1", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWM_Alt_2_Motor": { label: "Przestarzała ramka: Motor 2", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWM_Alt_5_Motor": { label: "Przestarzała ramka: Motor 5", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWM_Alt_Motor_Bremse": { label: "Przestarzała ramka: Motor Bremse", states: { 0: "Aktualna", 1: "Przestarzała" } }, 
    "GWM_RME_Gehalt": { label: "Zawartość biopaliwa (RME)", unit: " %", states: { 7: "BŁĄD" } }, 
    "GWM_Motordrehzahl": { label: "Obroty silnika", unit: " obr/min", states: { 65280: "BŁĄD CZUJNIKA" } }, 
    "GWM_KuehlmittelTemp": { label: "Temperatura płynu chłodzącego", unit: " °C", states: { 0: "Inicjalizacja", 255: "BŁĄD" } }, 
    "GWM_Bremslicht_Schalter": { label: "Czujnik pedału hamulca (BLS)", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } }, 
    "GWM_Bremstest_Schalter": { label: "Styk testowy hamulca (BTS)", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } }, 
    "GWM_Fehl_KmittelTemp": { label: "Błąd czujnika temp. płynu", states: { 0: "OK", 1: "BŁĄD CZUJNIKA" } }, 
    "GWM_Kuppl_Schalter": { label: "Czujnik pedału sprzęgła", states: { 0: "Wciśnięty (Rozsprzęglony)", 1: "Puszczony (Zasprzęglony)" } }, 
    "GWM_Heissl_Vorwarn": { label: "Ostrzeżenie o przegrzaniu silnika", states: { 0: "OK", 1: "OSTRZEŻENIE" } }, 
    "GWM_Klimaabschaltung": { label: "Odłączenie kompresora klimatyzacji", states: { 0: "Praca dozwolona", 1: "KOMPRESOR WYŁĄCZONY" } }, 
    "GWM_Kennfeldkuehlung": { label: "Aktywne chłodzenie mapowe", states: { 0: "Nie", 1: "TAK" } }, 
    "GWM_Komp_Leist_red": { label: "Redukcja mocy kompresora", states: { 0: "Nie", 1: "TAK" } }, 
    "GWM_KLuefter": { label: "Wysterowanie wentylatora chłodnicy", unit: " %", states: { 0: "Wyłączony", 255: "BŁĄD" } }, 
    "GWM_Anl_Freigabe": { label: "Zezwolenie na start (Rozrusznik)", states: { 0: "Brak zezwolenia", 1: "START DOZWOLONY" } }, 
    "GWM_Anl_Ausspuren": { label: "Odcięcie pracy rozrusznika", states: { 0: "Praca w toku / Niestabilny", 1: "ODCIĘCIE ROZRUSZNIKA" } }, 
    "GWM_Interlock": { label: "Wymóg wciśnięcia sprzęgła do startu", states: { 0: "Brak wymogu", 1: "SPRZĘGŁO WCIŚNIĘTE" } }, 
    "GWM_TypStartSteu": { label: "Typ sterowania rozruchem", states: { 0: "Kluczyk / Kessy", 1: "AUTOMATYCZNY START" } }, 
    "GWM_Freig_Bremsanforderung": { label: "Zezwolenie na żądanie hamowania", states: { 0: "Brak zezwolenia", 1: "ZEZWOLONO" } }, 
    "GWM_Vorgluehen": { label: "Świece żarowe / Kontrolka silnika", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } }, 
    "GWM_GRA_Status": { label: "Status tempomatu (GRA)", states: { 0: "Wyłączony", 1: "AKTYWNY", 2: "Przyspieszanie z pedału", 3: "Brak zezwolenia" } }, 
    "GWM_KVerbrauch": { label: "Chwilowe zużycie paliwa", unit: " µl/cykl" }, 
    "GWM_Ueberl_KV": { label: "Przepełnienie licznika zużycia paliwa", states: { 0: "Brak", 1: "PRZEPEŁNIONY" } }, 

    // ==========================================
    // 0x3C3 - KĄT SKRĘTU KIEROWNICY (mLenkwinkel_1)
    // ==========================================
    "LW1_Lenkradwinkel": { label: "Kąt skrętu kierownicy", unit: " °" }, //
    "LW1_Vorzeichen": { label: "Kierunek skrętu", states: { 0: "Prawo (Pozytywny)", 1: "Lewo (Negatywny)" } }, //
    "LW1_Geschwindigkeit": { label: "Prędkość obrotu kierownicy", unit: " °/s" }, //
    "LW1_Geschw_Vorzeichen": { label: "Kierunek prędkości obrotu", states: { 0: "Prawo (Pozytywna)", 1: "Lewo (Negatywna)" } }, //
    "LW1_ID": { label: "ID kalibracji czujnika kąta", states: { 0: "Brak kalibracji", 128: "Skalibrowany" } }, //
    "LW1_Quelle_Init": { label: "Źródło inicjalizacji czujnika", states: { 0: "Bremse 3 (ABS)", 1: "EPS_Bit" } }, //
    "LW1_Int_Status": { label: "Status pomiaru kąta", states: { 0: "OK", 1: "Brak inicjalizacji", 2: "Błąd sporadyczny", 3: "Błąd trwały" } }, //
    "LW1_KL30_Ausfall": { label: "Status po zaniku Klemme 30 (Zasilanie)", states: { 0: "OK", 1: "Brak inicjalizacji po restarcie" } }, //
    "LW1_Zaehler": { label: "Licznik wiadomości (Alive-Counter)", unit: "" }, //
    "LW1_CRC8CHK": { label: "Suma kontrolna CRC8", unit: "" }, //
    "LW1_Pruefsumme": { label: "Suma kontrolna ramki", unit: "" }, //

    // ==========================================
    // 0x3E1 - KLIMATYZACJA PARAMETRY 1 (mClima_1)
    // ==========================================
    "CL1_Drehzahlanhebung": { label: "Żądanie podwyższenia obrotów (Klima)", states: { 0: "Brak żądania", 1: "PODWYŻSZ OBROTY" } }, //
    "CL1_Zuheizer": { label: "Żądanie dogrzewacza (PTC/Webasto)", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } }, //
    "CL1_HzgHeckscheibe": { label: "Ogrzewanie tylnej szyby (Zasilanie)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } }, //
    "CL1_HzgFrontscheibe": { label: "Ogrzewanie przedniej szyby (Zasilanie)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } }, //
    "CL1_Kompressor": { label: "Zezwolenie na start kompresora", states: { 0: "Brak zezwolenia", 1: "WŁĄCZONY" } }, //
    "CL1_Heizung_aus": { label: "Żądanie braku grzania (Temp. na MIN)", states: { 0: "Grzanie aktywne", 1: "BRAK GRZANIA" } }, //
    "CL1_Kompressormoment_alt": { label: "Przestarzała ramka: Moment kompresora", states: { 0: "Aktualna", 1: "Przestarzała (Brak danych)" } }, //
    "CL1_Kaeltemitteldruck_alt": { label: "Przestarzała ramka: Ciśnienie czynnika", states: { 0: "Aktualna", 1: "Przestarzała (Kl. 15 OFF)" } }, //
    "CL1_AussenTemp": { label: "Temperatura powietrza zasysanego (Surowa)", unit: " °C", states: { 255: "BŁĄD SENSORA" } }, //
    "CL1_KaeltemittelDruck": { label: "Ciśnienie czynnika chłodniczego", unit: " bar", states: { 255: "BŁĄD SENSORA" } }, //
    "CL1_Last_Kompressor": { label: "Moment obrotowy pobierany przez kompresor", unit: " Nm", states: { 255: "BŁĄD" } }, //
    "CL1_Geblaeselast": { label: "Wysterowanie dmuchawy nawiewu", unit: " %", states: { 255: "BŁĄD" } }, //
    "CL1_Strg_Kluefter": { label: "Żądanie wentylatora chłodnicy z klimy", unit: " %", states: { 255: "BŁĄD" } }, //
    "CL1_Temp_in_F": { label: "Jednostka wyświetlana na panelu Climatronic", states: { 0: "°C", 1: "°F" } }, //
    "CL1_AC_Schalter": { label: "Przycisk AC na panelu", states: { 0: "Wyłączony", 1: "WCIŚNIĘTY (AC ON)" } }, //
    "CL1_WAPU_Zuschaltung": { label: "Dodatkowa pompa wody obiegu ogrzewania", states: { 0: "WŁĄCZONA", 1: "WYŁĄCZONA" } }, //
    "CL1_Restwaerme": { label: "Funkcja ciepła resztkowego (REST)", states: { 0: "Nieaktywna", 1: "AKTYWNA" } }, //
    "CL1_PTC_Clima": { label: "Moc dogrzewacza elektrycznego PTC (Klima)", unit: " %", states: { 0: "0%", 25: "25%", 50: "50%", 75: "75%", 100: "100%" } }, //
    "CL1_KD_Fehler": { label: "Błąd systemu klimatyzacji", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, //
    "KL_Thermomanagement": { label: "Status zarządzania termicznego silnika", states: { 0: "Brak zezwolenia", 1: "Małe zezwolenie", 2: "Średnie zezwolenie", 3: "Pełne zezwolenie" } }, //

    // ==========================================
    // 0x3E3 - KLIMATYZACJA PARAMETRY 2 (mClima_2)
    // ==========================================
    "CL2_Sonne_links": { label: "Czujnik nasłonecznienia (Lewa strona)", unit: " W/m²", states: { 255: "BŁĄD" } }, //
    "CL2_Sonne_rechts": { label: "Czujnik nasłonecznienia (Prawa strona)", unit: " W/m²", states: { 255: "BŁĄD" } }, //
    "CL2_InnenTemp": { label: "Temperatura wewnątrz pojazdu", unit: " °C", states: { 255: "BŁĄD SENSORA" } }, //
    "CL2_SitzH_links": { label: "Podgrzewanie fotela kierowcy (Poziom)", unit: "" }, //
    "CL2_SitzH_rechts": { label: "Podgrzewanie fotela pasażera (Poziom)", unit: "" }, //
    "CL2_StSt_Info": { label: "Status systemu Start-Stop dla Klimatyzacji", states: { 0: "Silnik włączony", 1: "Zakaz wyłączenia silnika", 2: "Wymuszenie uruchomienia silnika", 3: "Błąd systemu" } }, //
    "CL2_SH": { label: "Ogrzewanie postojowe (Webasto)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } }, //
    "CL2_SL_LED": { label: "Kontrolka wentylacji postojowej", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } }, //
    "CL2_Geblaese_plus": { label: "Zwiększenie nawiewu (Ogrzewanie postojowe)", states: { 0: "Brak", 1: "AKTYWNE" } }, //
    "CL2_Umluft_Taste": { label: "Przycisk obiegu zamkniętego (Umluft)", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } }, //
    "CL2_Solltemperatur": { label: "Temperatura docelowa zadana na panelu", unit: "", states: { 0: "Klima OFF", 255: "Błąd danych" } }, //
    "CL2_Vorgabe_KWTemp": { label: "Żądana temperatura płynu chłodniczego", unit: " °C", states: { 255: "BŁĄD DANYCH" } }, //

    // ==========================================
    // 0x42B - ZARZĄDZANIE SIECIĄ INFOTAINMENT (mNM_Gateway_I)
    // ==========================================
    "NMGW_I_Receiver": { label: "Adres odbiorcy (SG_Adresse)", unit: "" },
    "NMGW_I_CmdRing": { label: "Wiadomość typu Ring", states: { 0: "Brak", 1: "Aktywna" } },
    "NMGW_I_CmdAlive": { label: "Wiadomość typu Alive", states: { 0: "Brak", 1: "Aktywna" } },
    "NMGW_I_CmdLimpHome": { label: "Tryb awaryjny (Limp Home)", states: { 0: "Brak", 1: "Aktywny" } },
    "NMGW_I_SleepInd": { label: "Wskazanie uśpienia magistrali", states: { 0: "Brak", 1: "Wskazano" } },
    "NMGW_I_SleepAck": { label: "Potwierdzenie uśpienia", states: { 0: "Brak", 1: "Potwierdzono" } },
    "NMGW_I_Kl_30_Reset": { label: "Wybudzenie: Reset zacisku 30", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_Fkt_Nachlauf": { label: "Wybudzenie: Zakończenie pracy timera", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_NWake": { label: "Wybudzenie: Wejście NWake", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_CAN": { label: "Wybudzenie: Ruch na CAN", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_Wake_Up_Ltg": { label: "Wybudzenie: Linia Wake-Up licznika", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_Komfort_CAN": { label: "Wybudzenie przez: CAN Komfort", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_Info_CAN": { label: "Wybudzenie przez: CAN Infotainment", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_Kl_15": { label: "Wybudzenie przez: Zacisk 15 (Zapłon)", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_Diag_CAN": { label: "Wybudzenie przez: CAN Diagnostyka", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_LIN1": { label: "Wybudzenie przez: LIN 1", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_LIN2": { label: "Wybudzenie przez: LIN 2", states: { 0: "Nie", 1: "TAK" } },
    "NMGW_I_WakeUp2": { label: "Wybudzenie: Rezerwa 2", unit: "" },
    "NMGW_I_WakeUp3": { label: "Wybudzenie: Rezerwa 3", unit: "" },

    // ==========================================
    // 0x470 - MODUŁ BORDNETZ / KOMFORT (mBSG_Kombi)
    // ==========================================
    "BSK_Blk_links": { label: "Kierunkowskaz lewy (kontrolka)", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BSK_Blk_rechts": { label: "Kierunkowskaz prawy (kontrolka)", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BSK_Anhaenger": { label: "Kierunkowskaz przyczepy (kontrolka)", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BSK_Warnblinker": { label: "Światła awaryjne (status)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_DWA_Akku": { label: "Bateria syreny alarmu (DWA)", states: { 0: "OK", 1: "ROZŁADOWANA" } },
    "BSK_Rueckfahrlicht": { label: "Światło wsteczne", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Sammelfehler_AKI": { label: "Zbiorczy błąd sterowników", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } },
    "BSK_Ladekontrollampe": { label: "Kontrolka ładowania (Zacisk L)", states: { 0: "OK", 1: "BRAK ŁADOWANIA" } },
    "BSK_FT_geoeffnet": { label: "Drzwi kierowcy", states: { 0: "Zamknięte", 1: "OTWARTE" } },
    "BSK_BT_geoeffnet": { label: "Drzwi pasażera", states: { 0: "Zamknięte", 1: "OTWARTE" } },
    "BSK_HL_geoeffnet": { label: "Drzwi tył-lewe", states: { 0: "Zamknięte", 1: "OTWARTE" } },
    "BSK_HR_geoeffnet": { label: "Drzwi tył-prawe", states: { 0: "Zamknięte", 1: "OTWARTE" } },
    "BSK_MH_geoeffnet": { label: "Maska silnika", states: { 0: "Zamknięta", 1: "OTWARTA" } },
    "BSK_HD_Hauptraste": { label: "Bagażnik (Zamek główny)", states: { 0: "Zamknięty", 1: "OTWARTY" } },
    "BSK_HD_Vorraste": { label: "Bagażnik (Zamek wstępny)", states: { 0: "Zamknięty", 1: "OTWARTY" } },
    "BSK_Unterspannung": { label: "Napięcie systemu", states: { 0: "OK", 1: "NAPIĘCIE KRYTYCZNE" } },
    "BSK_Display": { label: "Podświetlenie wskaźników (Dimm)", unit: " %" },
    "BSK_Display_def": { label: "Usterka zacisku 58d (Dimm)", states: { 0: "OK", 1: "BŁĄD" } },
    "BSK_Klemme_58t": { label: "Podświetlenie lokalizacyjne (58t)", unit: " %" },
    "BSK_Klemme_58t_def": { label: "Usterka zacisku 58t", states: { 0: "OK", 1: "BŁĄD" } },
    "BSK_Interlock": { label: "Kontrolka wciśnięcia sprzęgła", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BSK_Buzzer": { label: "Sygnał dźwiękowy (Gong)", states: { 0: "Cisza", 1: "AKTYWNY" } },
    "BSK_Ruecks_HL_verriegelt": { label: "Oparcie kanapy tył-lewe", states: { 0: "Zablokowane", 1: "ODBLOKOWANE" } },
    "BSK_Ruecks_HR_verriegelt": { label: "Oparcie kanapy tył-prawe", states: { 0: "Zablokowane", 1: "ODBLOKOWANE" } },
    "BSK_Def_Lampe": { label: "Awaria żarówki (Kontrolka)", states: { 0: "System OK", 1: "PRZEPALONA ŻARÓWKA" } },
    "BSK_NSL_LED_Pfad": { label: "Sterowanie kontrolką p. mgielną", states: { 0: "Przewód", 1: "CAN" } },
    "BSK_AFL_defekt": { label: "Automatyczne światła (AFL)", states: { 0: "OK", 1: "BŁĄD SYSTEMU" } },
    "BSK_BSG_defekt": { label: "Moduł Bordnetz (BSG)", states: { 0: "OK", 1: "BŁĄD MODUŁU" } },
    "BSK_Standlicht": { label: "Światła postojowe (Zacisk 58)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Parklicht_links": { label: "Światło parkingowe lewe", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Parklicht_rechts": { label: "Światło parkingowe prawe", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Abblendlicht": { label: "Światła mijania (Zacisk 56b)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Nebellicht": { label: "Światła przeciwmgielne przód", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Heckscheibenhzg": { label: "Ogrzewanie tylnej szyby", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Tankklappe": { label: "Klapka wlewu paliwa", states: { 0: "Zamknięta", 1: "OTWARTA" } },
    "BSK_FFB_Bat": { label: "Bateria pilota (Info)", states: { 0: "OK", 1: "SŁABA BATERIA" } },
    "BSK_FLA_Soft_LED": { label: "Asystent świateł (FLA)", states: { 0: "Nieaktywny", 1: "AKTYWNY" } },
    "BSK_FLA_Sensor_blockiert": { label: "Kamera FLA (Czujnik)", states: { 0: "OK", 1: "ZASŁONIĘTY/BRUDNY" } },
    "BSK_FLA_Defekt": { label: "Usterka systemu FLA", states: { 0: "OK", 1: "BŁĄD" } },
    "BCM_Remotestart_Betrieb": { label: "Zdalny rozruch", states: { 0: "Nieaktywny", 1: "AKTYWNY" } },
    "BSK_Ruhespannung": { label: "Napięcie spoczynkowe", unit: " V" },
    "BSK_Nebelschlusslicht": { label: "Światło przeciwmgielne tył", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Fernlicht": { label: "Światła drogowe (Zacisk 56a)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },
    "BSK_Tagfahrlicht": { label: "Światła do jazdy dziennej (DRL)", states: { 0: "Wyłączone", 1: "WŁĄCZONE" } },

    // ==========================================
    // 0x527 - KOMUNIKACJA LICZNIKÓW (mGW_Kombi)
    // ==========================================
    "GWK_Alt_3_Kombi": { label: "Status danych licznika (Kombi 3)", states: { 0: "Aktualne", 1: "Przestarzałe" } },
    "GWK_Alt_2_Kombi": { label: "Status danych licznika (Kombi 2)", states: { 0: "Aktualne", 1: "Przestarzałe" } },
    "GWK_Alt_1_Kombi": { label: "Status danych licznika (Kombi 1)", states: { 0: "Aktualne", 1: "Przestarzałe" } },
    "GWK_Reifenumfang_empf": { label: "Odbiór parametru obwodu opony", states: { 0: "Brak", 1: "Odebrano" } },
    "GWK_FzgGeschw_Quelle": { label: "Źródło prędkości pojazdu", states: { 0: "Impulsator skrzyni", 1: "Czujniki ABS" } },
    "GWK_FzgGeschw": { label: "Prędkość pojazdu (Wyświetlana)", unit: " km/h" },
    "GWK_Umfang_Reifen": { label: "Obwód opony (zakodowany)", unit: " mm" },
    "GWK_AussenTemp_gefiltert": { label: "Temperatura zewnętrzna (FIS)", unit: " °C" },
    "GWK_AussenTemp_ungefiltert": { label: "Temperatura zewnętrzna (Surowa)", unit: " °C" },
    "GWK_AussenTemp_Fehler": { label: "Czujnik temp. zewnętrznej", states: { 0: "OK", 1: "BŁĄD" } },
    "GWK_Warn_Heiss": { label: "Ostrzeżenie o przegrzaniu silnika", states: { 0: "Brak", 1: "OSTRZEŻENIE!" } },
    "GWK_Passiv_Autolock": { label: "Ryglowanie drzwi po ruszeniu", states: { 0: "Nieaktywne", 1: "AKTYWNE" } },
    "GWK_WFS_Schl_Ort": { label: "Lokalizacja kluczyka (Immo)", states: { 0: "Keyless", 1: "Cewka w stacyjce" } },
    "KB1_Lenkh_Lampe": { label: "Kontrolka wspomagania kierownicy", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },

    // ==========================================
    // 0x555 - SILNIK PARAMETRY DODATKOWE (mMotor7)
    // ==========================================
    "MO7_LL_Status": { label: "Podwyższone obroty jałowe (Stupeń 1)", states: { 0: "Brak żądania", 1: "Osiągnięto poziom 1" } }, 
    "MO7_V_Begrenz": { label: "Możliwość ograniczenia prędkości", states: { 0: "Brak możliwości", 1: "Możliwe" } }, 
    "MO7_V_Begr_akt": { label: "Aktywne ograniczenie prędkości", states: { 0: "Nieaktywne", 1: "AKTYWNE" } }, 
    "MO7_FehlerSp": { label: "Błąd zapisany w pamięci (Silnik)", states: { 0: "Brak błędów", 1: "ZAPISANO BŁĄD" } }, 
    "MO7_Fehler_Oel_Temp": { label: "Status czujnika temperatury oleju", states: { 0: "Sprawny (OK)", 1: "BŁĄD CZUJNIKA" } }, 
    "MO7_PTC": { label: "Status wyłączenia dogrzewacza PTC / Świec", unit: "" }, 
    "MO7_DFM": { label: "Sygnał DFM alternatora (Obciążenie)", unit: " %", states: { 255: "BŁĄD" } }, 
    "MO7_Hoeheninfo": { label: "Współczynnik korekty wysokości (Atmosf.)", unit: "", states: { 255: "BŁĄD" } }, 
    "MO7_Gradient_Drehz": { label: "Gradient obrotów silnika", unit: " obr/min", states: { 127: "Powyżej limitu (>127)" } }, 
    "MO7_Gradient_Vorz": { label: "Kierunek gradientu obrotów", states: { 0: "Rosnące (+)", 1: "Malejące (-)" } }, 
    "MO7_Ladedruckneu": { label: "Ciśnienie doładowania (Turbo)", unit: " bar", states: { 255: "BŁĄD" } }, 
    "MO7_GenLoadResp": { label: "Czas reakcji alternatora (Load Response)", unit: " s" }, 
    "MO7_PTC_bereit": { label: "Gotowość 3-stopniowej grzałki PTC", states: { 0: "Brak grzałki PTC w pojeździe" } }, 
    "MO7_Mot_weckfaehig": { label: "Wybudzanie silnika przez CAN", states: { 0: "Brak wybudzania", 1: "WYMAGANE WYBUDZENIE" } }, 
    "MO7_Zus_Kuehl": { label: "Dodatkowe chłodzenie (Bypass układu)", states: { 0: "Nie", 1: "TAK" } }, 
    "MO7_Sleep_Ind": { label: "Gotowość do uśpienia sieci (Silnik)", states: { 0: "Praca na CAN", 1: "GOTOWY DO UŚPIENIA" } }, 
    "MO7_Rueck_LLDz": { label: "Podwyższone obroty jałowe (Stupeń 2)", states: { 0: "Brak żądania", 1: "Osiągnięto poziom 2" } }, 
    "MO7_Last_abwurf": { label: "Żądanie redukcji napięcia alternatora", states: { 0: "Brak redukcji", 1: "Stupeń 1 (13.3 V)", 2: "Stupeń 2 (12.6 V)", 3: "Stupeń 3 (11.8 V)" } }, 
    "MO7_Ein_Generator": { label: "Włączenie alternatora po starcie", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } }, 
    "MO7_Lastabwurf_Heiz": { label: "Zezwolenie na systemy grzewcze po starcie", states: { 0: "Odcięcie (Brak ładowania)", 1: "Dozwolone praca" } }, 
    "MO7_Stat_Gluehk": { label: "Status podgrzewania komory (Świece żarowe)", unit: " %", states: { 15: "BŁĄD" } }, 
    "MO7_Oeltemperatur": { label: "Temperatura oleju silnikowego", unit: " °C", states: { 0: "Brak czujnika", 1: "Inicjalizacja", 255: "BŁĄD CZUJNIKA" } },

    // ==========================================
    // 0x557 - BŁĘDY MODUŁÓW W SYSTEMIE (mKD_Error)
    // ==========================================
    "EKD_Motor_A": { label: "Błąd: Sterownik silnika", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Getriebe_A": { label: "Błąd: Skrzynia biegów", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Bremse_A": { label: "Błąd: Sterownik hamulców (ABS/ESP)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Kombi_A": { label: "Błąd: Zestaw wskaźników", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_LSM_A": { label: "Błąd: Czujnik kąta skrętu kierownicy", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Airbag_A": { label: "Błąd: Sterownik Airbag", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Lenkhilfe_A": { label: "Błąd: Wspomaganie kierownicy", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_dyn_LWR_A": { label: "Błąd: Poziomowanie świateł (LWR/AFS)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Niveau_A": { label: "Błąd: Niveauregulierung (Zawieszenie)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Allrad_A": { label: "Błąd: Napęd na cztery koła", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_ADR_Sensor_A": { label: "Błąd: Radar odstępu (ACC/ADR)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_ADR_getrennt": { label: "Status fizyczny radaru ADR", states: { 0: "Podłączony", 1: "ODŁĄCZONY" } }, 
    "EKD_Parkbremse_A": { label: "Błąd: Hamulec postojowy (EPB)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_EZS_A": { label: "Błąd: Elektroniczna stacyjka", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Daempfer_A": { label: "Błąd: Regulacja amortyzatorów (DCC)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Quersperre": { label: "Błąd: Blokada mechanizmu różnicowego", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Motor_Slave_A": { label: "Błąd: Sterownik silnika 2 (Slave)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_SWA_A": { label: "Błąd: Asystent zmiany pasa (SWA)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_LDW_A": { label: "Błąd: Asystent pasa ruchu (LDW)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_RKA_Plus_A": { label: "Błąd: System monitorowania opon (RKA)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_PLA_A": { label: "Błąd: Asystent parkowania (PLA)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_WFS_KBI": { label: "Błąd: Immobilizer w liczniku", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Kombi_KBI": { label: "Błąd: Zestaw wskaźników (Kombi 2)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_BSG_K": { label: "Błąd: Bordnetz (Centralna elektryka)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_KSG_K": { label: "Błąd: Moduł komfortu", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_TSG_FT_K": { label: "Błąd: Moduł drzwi kierowcy", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_TSG_BT_K": { label: "Błąd: Moduł drzwi pasażera", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_TSG_HL_K": { label: "Błąd: Moduł drzwi tył-lewe", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_TSG_HR_K": { label: "Błąd: Moduł drzwi tył-prawe", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Memory_K": { label: "Błąd: Moduł pamięci foteli", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Dachmodul_K": { label: "Błąd: Moduł dachu", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Zentralelektrik_II_K": { label: "Błąd: Centralna elektryka II", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_RDK_K": { label: "Błąd: Reifendruck (RDK)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_SMLS_K": { label: "Błąd: Moduł kolumny kierownicy", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Gateway_K": { label: "Błąd: Gateway (Rozdzielacz CAN)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Clima_K": { label: "Błąd: Klimatyzacja (Climatronic)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_APS_K": { label: "Błąd: Czujniki parkowania (APS)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_PTC_Heizung_K": { label: "Błąd: Dogrzewacz PTC", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Standhzg_K": { label: "Błąd: Ogrzewanie postojowe", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_VSG_K": { label: "Błąd: Sterownik dachu składanego", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_RSE_I": { label: "Błąd: Rear Seat Entertainment", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Wischer_K": { label: "Błąd: Moduł wycieraczek", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_MDI_I": { label: "Błąd: Moduł MDI", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_AAG_K": { label: "Błąd: Sterownik przyczepy", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Mem_BF_K": { label: "Błąd: Pamięć fotela pasażera", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Easy_Entry_VF": { label: "Błąd: Easy-Entry Kierowcy", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Easy_Entry_VB": { label: "Błąd: Easy-Entry Pasażera", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Heckdeckel_K": { label: "Błąd: Sterownik pokrywy bagażnika", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Rearview_I": { label: "Błąd: Kamera cofania", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Sonderfahrzeug_SG_K": { label: "Błąd: Pojazd specjalny (Taxi)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Tastenmodul_I": { label: "Błąd: Moduł klawiatury", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Kompass_I": { label: "Błąd: Kompas", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_WFS_K": { label: "Błąd: Immobilizer", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_GSM_Pager_I": { label: "Błąd: Moduł GSM / Pager", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_DSP_I": { label: "Błąd: Wzmacniacz cyfrowy (DSP)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_DAB_I": { label: "Błąd: Tuner cyfrowy (DAB/SDARS)", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Telematik_I": { label: "Błąd: Telematyka", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Navigation_I": { label: "Błąd: Nawigacja", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_TV_Tuner_I": { label: "Błąd: Tuner TV", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Neigungsmodul": { label: "Błąd: Moduł przechyłu pojazdu", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Radio_I": { label: "Błąd: Radio", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 
    "EKD_Telefon_I": { label: "Błąd: Telefon", states: { 0: "Brak błędów", 1: "ZAPISANY BŁĄD" } }, 

    // ==========================================
    // 0x571 - BORDNETZ / ZASILANIE I ZARZĄDZANIE ODBIORNIKAMI (mBSG_2)
    // ==========================================
    "BS2_U_BATT": { label: "Napięcie akumulatora (Bordnetz)", unit: " V", states: { 255: "BŁĄD DANYCH" } }, 
    "BS2_Heckscheibe_aus": { label: "Żądanie wyłączenia ogrz. szyby tył", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_Frontscheibe_aus": { label: "Żądanie wyłączenia ogrz. szyby przód", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_Aussenspiegel_aus": { label: "Żądanie wyłączenia ogrz. lusterek", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_Sitzheizung_aus": { label: "Żądanie wyłączenia ogrz. foteli", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_aus_Lenkradheizung": { label: "Żądanie wyłączenia ogrz. kierownicy", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_aus_Wischwasserhzg": { label: "Żądanie wyłączenia ogrz. spryskiwaczy", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_aus_Sitzlueftung": { label: "Żądanie wyłączenia wentylacji foteli", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_Klimaanlage_aus": { label: "Żądanie wyłączenia / redukcji klimy", states: { 0: "Brak żądania", 1: "ZREDUKUJ MOC" } }, 
    "BS2_U_Start_BATT": { label: "Napięcie akumulatora rozruchowego", unit: " V", states: { 255: "BŁĄD DANYCH" } }, 
    "BS2_Lastman_aktiv": { label: "Zarządzanie obciążeniem włączone", states: { 0: "Nie", 1: "TAK" } }, 
    "BS2_Verbr_ab_aktiv": { label: "Wyłączenie odbiorników aktywne", states: { 0: "Nie", 1: "TAK" } }, 
    "BS2_Notstart": { label: "Start awaryjny pojazdu", states: { 0: "Nie", 1: "TAK" } }, 
    "BS2_aus_Sitzhzg_H": { label: "Żądanie wyłączenia ogrz. kanapy z tyłu", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_aus_Steckdosen": { label: "Żądanie wyłączenia gniazd (12V)", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_aus_Zusatz_Verbr": { label: "Żądanie wyłączenia dod. urządzeń", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_aus_Infotainment": { label: "Żądanie redukcji mocy Infotainment", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_Wake_Up_ACAN": { label: "Wymuszenie wybudzenia CAN Napęd", states: { 0: "Brak wybudzania", 1: "WYBUDŹ SIEĆ" } }, 
    "BS2_aus_PTC_Clima": { label: "Redukcja grzałki elektrycznej PTC", unit: " %", states: { 0: "0% Redukcji", 25: "Ograniczenie do 75%", 50: "Ograniczenie do 50%", 75: "Ograniczenie do 25%", 100: "Wyłączone (100% redukcji)" } }, 
    "BS2_KlimaLeistRed": { label: "Zażądano redukcji mocy klimatyzacji", states: { 0: "Brak redukcji", 1: "Redukcja: Poziom 1", 2: "Redukcja: Poziom 2", 3: "Redukcja: Poziom 3" } }, 
    "BS2_red_Heckscheibe": { label: "Ograniczenie mocy ogrzewania szyby tył", states: { 0: "Brak", 1: "OGRANICZENIE MOCY" } }, 
    "BS2_aus_Ablage_Wischer": { label: "Wyłączenie podgrz. piór wycieraczek", states: { 0: "Brak żądania", 1: "WYŁĄCZ ODBIORNIK" } }, 
    "BS2_aus_Innen_Bel": { label: "Wyłączenie / redukcja ośw. wnętrza", states: { 0: "Brak żądania", 1: "ZREDUKUJ" } }, 
    "BS2_Warn_Steckdosen": { label: "Ostrzeżenie przed wyłączeniem gniazd", states: { 0: "Brak", 1: "ZBLIŻA SIĘ WYŁĄCZENIE" } }, 
    "BS2_Warn_Infotainment": { label: "Ostrzeżenie przed wył. Infotainment", states: { 0: "Brak", 1: "ZBLIŻA SIĘ WYŁĄCZENIE" } }, 
    "BS2_Warn_Zusatz": { label: "Ostrzeżenie przed wył. u. dodatkowych", states: { 0: "Brak", 1: "ZBLIŻA SIĘ WYŁĄCZENIE" } }, 
    "BS2_Weckursache_ACAN": { label: "Przyczyna wybudzenia sieci", states: { 0: "Normalny start (Brak pre-pompy)", 1: "Rezerwa", 2: "Uruchomiono ogrzewanie postojowe", 3: "Wykryto otwarcie drzwi" } }, 
    "BS2_VB_2_Battarie": { label: "Zakodowano drugi akumulator", states: { 0: "Pojedynczy akumulator", 1: "DWA AKUMULATORY (np. Webasto)" } }, 
    "BS2_Zust_Start_Ltg": { label: "Stan przewodu rozrusznika", states: { 0: "Przewód sprawny", 1: "ZWARCIE DO MASY (Blokada Kl. 50)" } }, 
    "BS2_Mess_Start_Ltg": { label: "Pomiar przewodu rozrusznika", states: { 0: "Zakończony", 1: "W TRAKCIE (Zablokowany rozruch)" } }, 

    // ==========================================
    // 0x575 - BORDNETZ / ZASILANIE 3 (mBSG_3)
    // ==========================================
    "BS3_Klemme_S": { label: "Styk S (Kluczyk w stacyjce)", states: { 0: "Wyjęty", 1: "WŁOŻONY" } },
    "BS3_Klemme_15": { label: "Zacisk 15 (Zapłon)", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "BS3_Klemme_X": { label: "Zacisk X (Odciążenie)", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "BS3_Klemme_50": { label: "Zacisk 50 (Rozrusznik)", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "BS3_Klemme_P": { label: "Zacisk P (Światła postojowe)", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "BS3_2_Drehzahl": { label: "Żądanie podwyższonych obrotów (Stupeń 2)", states: { 0: "Brak", 1: "AKTYWNE" } },
    "BS3_Klemme_15_Motorraum": { label: "Zacisk 15 (Komora silnika)", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "BS3_Ladekontrollampe": { label: "Kontrolka ładowania (Bordnetz)", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BS3_Drehzahlanhebung": { label: "Żądanie podwyższonych obrotów (Stupeń 1)", states: { 0: "Brak", 1: "AKTYWNE" } },
    "BS3_Bordnetzbatt": { label: "Stan akumulatora sieci pokładowej", states: { 0: "OK", 1: "Krytyczny", 2: "Rozładowany", 3: "BŁĄD" } },
    "BS3_Starterbatt": { label: "Stan akumulatora rozruchowego", states: { 0: "OK", 1: "Krytyczny", 2: "Rozładowany", 3: "BŁĄD" } },
    "BS3_KD_Fehler": { label: "Błąd diagnostyczny w pamięci", states: { 0: "Brak", 1: "ZAPISANY BŁĄD" } },
    "BS3_LWR_Fehler": { label: "Błąd systemu poziomowania świateł", states: { 0: "OK", 1: "BŁĄD" } },
    "BS3_Haubenkontakt": { label: "Czujnik maski silnika", states: { 0: "Zamknięta", 1: "OTWARTA" } },
    "BS3_Coming_Home": { label: "Funkcja Coming Home", states: { 0: "Nieaktywna", 1: "AKTYWNA" } },
    "BS3_Leaving_Home": { label: "Funkcja Leaving Home", states: { 0: "Nieaktywna", 1: "AKTYWNA" } },
    "BS3_K_Luefter_ein": { label: "Wymuszenie wentylatora chłodnicy", states: { 0: "Brak żądania", 1: "WŁĄCZ WENTYLATOR" } },
    "BS3_Ab_Batterie": { label: "Odłączenie akumulatora (Wykrycie)", states: { 0: "Podłączony", 1: "ODŁĄCZONY" } },
    "BS3_VP_Taste": { label: "Przycisk Valet Parking", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "BS3_Verglasung_zu": { label: "Zamykanie szyb (Czujnik deszczu)", states: { 0: "Brak akcji", 1: "ZAMKNIJ SZYBY" } },
    "BS3_PDC_Taster": { label: "Przycisk asystenta parkowania (PDC)", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "BS3_IRUE_Taster": { label: "Przycisk nadzoru wnętrza", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "BS3_VB_Coming_Home": { label: "Dostępność Coming Home", states: { 0: "Brak", 1: "ZAKODOWANE" } },
    "BS3_VB_Tagesfahrlicht": { label: "Dostępność świateł dziennych", states: { 0: "Brak", 1: "ZAKODOWANE" } },
    "BS3_VB_Fussraumleuchten": { label: "Dostępność oświetlenia przestrzeni nóg", states: { 0: "Brak", 1: "ZAKODOWANE" } },
    "BS3_LED_Heckscheibe": { label: "Dioda: Ogrzewanie tylnej szyby", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BS3_LED_Frontscheibe": { label: "Dioda: Ogrzewanie przedniej szyby", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BS3_LED_Sitze": { label: "Dioda: Podgrzewanie foteli", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BS3_LED_Aussenspiegel": { label: "Dioda: Podgrzewanie lusterek", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "BS3_Starterlaubnis": { label: "Zezwolenie na rozruch", states: { 0: "Brak zezwolenia", 1: "START DOZWOLONY" } },

    // ==========================================
    // 0x60E - JEDNOSTKI WYŚWIETLACZA (mEinheiten)
    // ==========================================
    "EH1_Einh_Strck": { label: "Jednostka dystansu", states: { 0: "km", 1: "mi" } },
    "EH1_Einh_Temp": { label: "Jednostka temperatury", states: { 0: "°C", 1: "°F" } },
    "EH1_Einh_Vol": { label: "Jednostka objętości", states: { 0: "Litry", 1: "Galony" } },
    "EH1_Einh_Verbr": { label: "Format spalania", states: { 0: "Dystans/Objętość (np. km/l)", 1: "Objętość/Dystans (np. l/100km)" } },
    "EH1_Einh_Druck": { label: "Jednostka ciśnienia", states: { 0: "bar", 1: "psi", 2: "Nieznane", 3: "kPa" } },
    "EH1_Datum_Anzeige": { label: "Format daty", states: { 0: "DD-MM-RRRR", 1: "MM-DD-RRRR" } },
    "EH1_Uhr_Anzeige": { label: "Format czasu", states: { 0: "24h", 1: "12h" } },
    "EH1_Profil": { label: "Numer profilu użytkownika", unit: "" },
    "EH1_Wochentag": { label: "Dzień tygodnia", states: { 0: "Brak ust.", 1: "Poniedziałek", 2: "Wtorek", 3: "Środa", 4: "Czwartek", 5: "Piątek", 6: "Sobota", 7: "Niedziela" } },
    "EH1_Verstellung_Strck": { label: "Możliwość zmiany jednostki dystansu", states: { 0: "Zablokowana", 1: "DOZWOLONA" } },

    // ==========================================
    // 0x621 - LICZNIKI I WSKAŹNIKI (mKombi_K1)
    // ==========================================
    "KO1_Tankstop": { label: "Wykrycie tankowania", states: { 0: "Brak", 1: "WYKRYTO" } },
    "KO1_Tankwarnlampe": { label: "Kontrolka rezerwy paliwa", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "KO1_WaschWasser": { label: "Poziom płynu spryskiwaczy", states: { 0: "OK", 1: "NISKI POZIOM" } },
    "KO1_MH_Kontakt": { label: "Maska silnika (Info licznika)", states: { 0: "Zamknięta", 1: "OTWARTA" } },
    "KO1_FT_geoeffnet": { label: "Drzwi kierowcy (Info licznika)", states: { 0: "Zamknięte", 1: "OTWARTE" } },
    "KO1_Handbremse": { label: "Hamulec postojowy", states: { 0: "Zwolniony", 1: "ZACIĄGNIĘTY" } },
    "KO1_AFL": { label: "Przełącznik świateł w pozycji AUTO", states: { 0: "Nie", 1: "TAK" } },
    "KO1_Klemme_L": { label: "Kontrolka ładowania (Licznik)", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "KO1_Standzeit": { label: "Czas postoju pojazdu", unit: " s" },
    "KO1_Standzeit_Fehler": { label: "Błąd pomiaru czasu postoju", states: { 0: "Czas prawidłowy", 1: "BŁĄD ZASILANIA (Kl. 30)" } },
    "KO1_Tankinhalt": { label: "Poziom paliwa", unit: " L" },
    "KO1_Tankwarnung": { label: "Ostrzeżenie o rezerwie (Diagnostyka)", states: { 0: "OK", 1: "REZERWA" } },
    "KO1_WFS_Schluessel": { label: "Numer kluczyka (Immo)", unit: "" },
    "KO1_KD_Fehler_WFS": { label: "Błąd immobilizera w pamięci", states: { 0: "Brak", 1: "ZAPISANY BŁĄD" } },
    "KO1_Fernlicht": { label: "Kontrolka świateł drogowych", states: { 0: "Wyłączona", 1: "WŁĄCZONA" } },
    "KO1_Freigabe_Zuheizer": { label: "Dogrzewacz (Z menu licznika)", states: { 0: "WŁĄCZONY", 1: "WYŁĄCZONY" } },
    "KO1_MFA_vorhanden": { label: "Obecność przycisków MFA", states: { 0: "Brak", 1: "ZAMONTOWANE" } },
    "KO1_Bel_Displ": { label: "Siła podświetlenia wskaźników", unit: " %" },
    "KO1_Sta_Displ": { label: "Status obwodu podświetlenia", states: { 0: "OK", 1: "USTERKA KL. 58d" } },
    "KO1_Lichtsensor": { label: "Odczyt czujnika światła", unit: "" },

    // ==========================================
    // 0x62F - WYŚWIETLACZ MFA / FIS (mDisplay_1)
    // ==========================================
    "DY1_Display_OK": { label: "Gotowość wyświetlacza (Zacisk 15)", states: { 0: "Oczekuje", 1: "GOTOWY" } }, // 
    "DY1_Reset": { label: "Zresetowanie wyświetlacza", states: { 0: "Brak", 1: "ZRESETOWANY" } },
    "DY1_Global_Reset": { label: "Globalny reset sieci DDP", states: { 0: "Brak", 1: "RESET" } },
    "DY1_MFA_Down": { label: "Przycisk MFA: W dół", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "DY1_MFA_Up": { label: "Przycisk MFA: W górę", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "DY1_MFA_Reset": { label: "Przycisk MFA: Reset / OK", states: { 0: "Puszczony", 1: "WCIŚNIĘTY" } },
    "DY1_MFA_WippeLang": { label: "Przycisk MFA: Przytrzymany (> 2s)", states: { 0: "Brak", 1: "PRZYTRZYMANY" } },
    "DY1_Bereich1": { label: "Obszar wyświetlacza 1 (Priorytet)", unit: "" },
    "DY1_Bereich2": { label: "Obszar wyświetlacza 2 (Priorytet)", unit: "" },
    "DY1_Bereich3": { label: "Obszar wyświetlacza 3 (Priorytet)", unit: "" },

    // ==========================================
    // 0x635 - ŚCIEMNIANIE DESKI (mDimmung)
    // ==========================================
    "DI1_Display": { label: "Jasność podświetlenia wyświetlacza", unit: " %", states: { 127: "BŁĄD" } }, // 
    "DI1_Display_def": { label: "Usterka obwodu wyświetlacza (58d)", states: { 0: "OK", 1: "BŁĄD" } },
    "DI1_Schalter": { label: "Jasność podświetlenia przycisków", unit: " %", states: { 127: "BŁĄD" } },
    "DI1_Schalter_def": { label: "Usterka obwodu przycisków (58s)", states: { 0: "OK", 1: "BŁĄD" } },
    "DI1_Sensor": { label: "Czujnik zmierzchu (Dimmung)", unit: "", states: { 254: "INIT", 255: "BŁĄD" } },

    // ==========================================
    // 0x651 - FLAGI SYSTEMOWE (mSysteminfo_1)
    // ==========================================
    "SY1_CAN_Extern": { label: "CAN zewnętrzny (Diagnostyka)", states: { 0: "Odłączony", 1: "PODŁĄCZONY" } },
    "SY1_Diag_Antrieb": { label: "Diagnostyka sieci CAN-Napęd", states: { 0: "Brak", 1: "W TOKU" } },
    "SY1_Sleep_Komfort": { label: "Uśpienie sieci CAN-Komfort", states: { 0: "Aktywna", 1: "UŚPIONA" } }, // 
    "SY1_Diag_Komfort": { label: "Diagnostyka sieci CAN-Komfort", states: { 0: "Brak", 1: "W TOKU" } },
    "SY1_Sleep_Infotainment": { label: "Uśpienie sieci CAN-Infotainment", states: { 0: "Aktywna", 1: "UŚPIONA" } },
    "SY1_Diag_Infotainment": { label: "Diagnostyka sieci CAN-Infot.", states: { 0: "Brak", 1: "W TOKU" } },
    "SY1_Infotainment": { label: "Separacja fizyczna Infotainment", states: { 0: "Połączone", 1: "ODSEPAROWANE" } },
    "SY1_Verbauliste_gueltig": { label: "Lista wyposażenia (Sollverbau)", states: { 0: "Niekompletna", 1: "WAŻNA" } },
    "SY1_Klasse": { label: "Klasa pojazdu", states: { 0: "A000", 1: "A00", 2: "A0", 3: "A", 4: "B", 5: "C", 6: "D", 7: "T", 8: "LT", 9: "L" } },
    "SY1_Marke": { label: "Marka pojazdu", states: { 0: "Volkswagen", 1: "Audi", 2: "Seat", 3: "Skoda", 4: "VW Nutzfahrzeuge", 5: "Bugatti", 6: "Lamborghini", 7: "Bentley", 8: "RollsRoyce", 14: "Ford", 15: "Porsche" } },
    "SY1_Derivat": { label: "Typ nadwozia", states: { 0: "Hatchback / Multivan", 1: "Sedan / Dostawczak", 2: "Kombi", 3: "Liftback", 4: "Coupe / Sport", 5: "Cabrio / Roadster", 6: "Offroad", 7: "CityVan / PickUp", 8: "MPV", 9: "Inne", 15: "Nieznane" } },
    "SY1_Generation": { label: "Generacja pojazdu", unit: "" },
    "SY1_Erweiterung": { label: "Rozszerzenie konstrukcji", states: { 0: "Krótki rozstaw", 1: "Długi rozstaw", 2: "Zmodyfikowany przód/tył", 3: "Syncro", 4: "Mocny silnik", 5: "Otwarty dach", 6: "Zamknięty", 7: "Płaski dach", 8: "Wysoki dach", 9: "Inne", 15: "Nieznane" } },
    "SY1_Rechtslenker": { label: "Układ kierowniczy", states: { 0: "Lewostronny (LHD)", 1: "Prawostronny (RHD)" } },
    "SY1_Viertuerer": { label: "Ilość drzwi", states: { 0: "Mniej niż 4", 1: "4 lub więcej" } },
    "SY1_Transportmode": { label: "Tryb transportowy", states: { 0: "Nieaktywny", 1: "AKTYWNY" } },
    "SY1_KD_Fehler": { label: "Błąd modułu Gateway w pamięci", states: { 0: "Brak", 1: "ZAPISANY BŁĄD" } },
    "SY1_VersLowCAN_Komfort": { label: "Wersja CAN Komfort (Low)", unit: "" },
    "SY1_VersHighCAN_Komfort": { label: "Wersja CAN Komfort (High)", unit: "" },
    "SY1_VersLowCAN_Antrieb": { label: "Wersja CAN Napęd (Low)", unit: "" },
    "SY1_VersHighCAN_Antrieb": { label: "Wersja CAN Napęd (High)", unit: "" },
    "SY1_Relais_FAS_Zweig": { label: "Przekaźnik asystentów jazdy (FAS)", states: { 0: "Zamknięty (OK)", 1: "Zdalnie otwarty", 2: "Otwarty przez usterkę", 3: "Rezerwa" } },
    "SY1_ELV_Lock_Supply": { label: "Zezwolenie blokady kierownicy (ELV)", states: { 0: "Zablokowane", 1: "ODBLOKOWANE" } },
    "SY1_QRS_Messmodus": { label: "Szybki pomiar prądu (QRS)", states: { 0: "Wyłączony", 1: "WŁĄCZONY" } },
    "SY1_NWDF_gueltig": { label: "Wsparcie dla diagnostyki sieci", states: { 0: "Brak wsparcia", 1: "OBSŁUGIWANE" } },
    "SY1_NWDF": { label: "Zezwolenie na diagnostykę sieci", states: { 0: "Zablokowana", 1: "DOZWOLONA" } },
    "SY1_Notbrems_Status": { label: "Status hamowania awaryjnego", states: { 0: "Normalny", 1: "⚠️ HAMOWANIE AWARYJNE" } },

    // ==========================================
    // 0x653 - KODOWANIE REGIONU I JĘZYKA (mGateway_3)
    // ==========================================
    "GW3_Laendervariante": { label: "Wersja krajowa (Region)", states: { 0: "Niemcy", 1: "Europa", 2: "USA", 3: "Kanada", 4: "Wielka Brytania", 5: "Japonia", 6: "Arabia Saudyjska", 7: "Australia" } },
    "GW3_Alt_3_Kombi": { label: "Status danych z licznika (Kombi_3)", states: { 0: "Aktualne", 1: "Przestarzałe" } },
    "GW3_Land_Sprach_empf": { label: "Odbiór kodowania języka/regionu", states: { 0: "Brak", 1: "Odebrano" } },
    "GW3_Sprachvariante": { label: "Wersja językowa", states: { 0: "Brak", 1: "Niemiecki", 2: "Angielski", 3: "Francuski", 4: "Włoski", 5: "Hiszpański", 6: "Portugalski", 8: "Czeski", 9: "Chiński", 10: "US-Angielski", 11: "Holenderski", 12: "Japoński", 13: "Rosyjski", 14: "Koreański", 15: "Kanadyjski-Francuski", 16: "Szwedzki", 17: "Polski", 18: "Turecki" } },
    "GW3_Motortyp": { label: "Kod ilości cylindrów silnika", unit: "" },
    "GW3_Alt_5_Motor": { label: "Status danych z silnika (Motor_5)", states: { 0: "Aktualne", 1: "Przestarzałe" } },
    "GW3_Motortyp_empf": { label: "Odbiór typu silnika", states: { 0: "Brak", 1: "Odebrano" } },

    // ==========================================
    // 0x655 - LISTA MODUŁÓW SOLLVERBAU (mSollverbau_neu)
    // UWAGA: Stan 0 = Brak zakodowania, 1 = Zakodowano obecność
    // ==========================================
    "VBN_Soll_Ist_OK": { label: "Porównanie wyposażenia (Soll=Ist)", states: { 0: "⚠️ BŁĄD KONFIGURACJI", 1: "PRAWIDŁOWA" } },
    "VBN_Motor_A": { label: "Sterownik silnika", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Getriebe_A": { label: "Skrzynia biegów", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Bremse_A": { label: "Sterownik ABS / ESP", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Kombi_A": { label: "Zestaw wskaźników (Antrieb)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_LSM_A": { label: "Czujnik kąta skrętu", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Airbag_A": { label: "System Airbag", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Lenkhilfe_A": { label: "Wspomaganie kierownicy", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_dyn_LWR_A": { label: "Poziomowanie reflektorów (AFS)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Niveau_A": { label: "Zawieszenie pneumatyczne", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Allrad_A": { label: "Napęd na cztery koła (AWD)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_ADR_Sensor_A": { label: "Radar ACC", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_ADR_getrennt": { label: "Rozłączenie sprzętowe radaru", states: { 0: "Podłączony", 1: "ODŁĄCZONY" } },
    "VBN_Parkbremse_A": { label: "Hamulec postojowy (EPB)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_EZS_A": { label: "Elektroniczna stacyjka (EZS)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Daempfer_A": { label: "Regulacja amortyzatorów (DCC)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Quersperre": { label: "Blokada mechanizmu różnicowego", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Motor_Slave_A": { label: "Sterownik silnika 2 (Slave)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_SWA_A": { label: "Asystent zmiany pasa (SWA)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_LDW_A": { label: "Asystent pasa ruchu (Lane Assist)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_RKA_Plus_A": { label: "Kontrola ciśnienia opon (RKA)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_PLA_A": { label: "Asystent parkowania (PLA)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_WFS_KBI": { label: "Immobilizer w liczniku", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Kombi_KBI": { label: "Zestaw wskaźników (Komfort)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_BSG_K": { label: "Centralna elektryka (Bordnetz)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_KSG_K": { label: "Moduł komfortu", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_TSG_FT_K": { label: "Moduł drzwi kierowcy", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_TSG_BT_K": { label: "Moduł drzwi pasażera", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_TSG_HL_K": { label: "Moduł drzwi tył-lewe", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_TSG_HR_K": { label: "Moduł drzwi tył-prawe", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Memory_K": { label: "Pamięć fotela", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Dachmodul_K": { label: "Moduł dachu", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Zentralelektrik_II_K": { label: "Centralna elektryka II", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_RDK_K": { label: "Czujniki ciśnienia (TPMS/RDK)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_SMLS_K": { label: "Moduł kolumny kierownicy", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Gateway_K": { label: "Moduł Gateway", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Clima_K": { label: "Klimatyzacja (Climatronic)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_APS_K": { label: "Czujniki parkowania (PDC)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_PTC_Heizung_K": { label: "Dogrzewacz elektryczny (PTC)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Standhzg_K": { label: "Ogrzewanie postojowe (Webasto)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_VSG_K": { label: "Moduł dachu składanego (Cabrio)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_RSE_I": { label: "Zestaw multimedialny tył (RSE)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Wischer_K": { label: "Moduł wycieraczek", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_MDI_I": { label: "Interfejs multimedialny (MDI)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_AAG_K": { label: "Moduł przyczepy", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Mem_BF_K": { label: "Pamięć fotela pasażera", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Easy_Entry_VF": { label: "System Easy-Entry kierowcy", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Easy_Entry_VB": { label: "System Easy-Entry pasażera", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Heckdeckel_K": { label: "Sterownik pokrywy bagażnika", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Rearview_I": { label: "Kamera cofania", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Sonderfahrzeug_SG_K": { label: "Moduł pojazdu specjalnego (Taxi)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Tastenmodul_I": { label: "Moduł klawiatury (Infotainment)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Kompass_I": { label: "Kompas elektroniczny", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_WFS_K": { label: "Immobilizer (Gateway)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_GSM_Pager_I": { label: "Moduł Pager GSM", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_InfoElektronik": { label: "Elektronika informacyjna (Cockpit)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_DSP_I": { label: "Wzmacniacz dźwięku (DSP)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_DAB_I": { label: "Tuner cyfrowy (DAB/SDARS)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Telematik_I": { label: "Moduł Telematyki", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Navigation_I": { label: "Moduł Nawigacji", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_TV_Tuner_I": { label: "Tuner TV", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Neigungsmodul_I": { label: "Czujnik przechyłu (Alarm)", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Radio_I": { label: "Moduł Radia", states: { 0: "Brak", 1: "ZAKODOWANO" } },
    "VBN_Telefon_I": { label: "Moduł Telefonu", states: { 0: "Brak", 1: "ZAKODOWANO" } },

    // ==========================================
    // 0x65D - CZAS I PRZEBIEG (mDiagnose_1)
    // ==========================================
    "DN1_Verlernzaehler": { label: "Licznik cykli weryfikacji błędów", unit: "" },
    "DN1_KM_Stand": { label: "Przebieg całkowity pojazdu", unit: " km" },
    "DN1_Jahr": { label: "Data: Rok", unit: "" },
    "DN1_Monat": { label: "Data: Miesiąc", unit: "" },
    "DN1_Tag": { label: "Data: Dzień", unit: "" },
    "DN1_Stunde": { label: "Czas: Godzina", unit: "" },
    "DN1_Minute": { label: "Czas: Minuta", unit: "" },
    "DN1_Sekunde": { label: "Czas: Sekunda", unit: "" },
    "DN1_alt_Kilometerstand": { label: "Wiarygodność przebiegu", states: { 0: "Aktualny", 1: "Przestarzały" } },
    "DN1_alt_Zeit": { label: "Wiarygodność czasu", states: { 0: "Aktualny", 1: "Przestarzały" } },

    // ==========================================
    // 0x65F - IDENTYFIKATOR POJAZDU VIN (mFzg_Ident)
    // ==========================================
    "FI1_MUX": { label: "Indeks multipleksera (MUX)", unit: "" },
    "FI1_Geheimnis_1": { label: "Ukryty kod bezpieczeństwa 1", unit: "" },
    "FI1_Geheimnis_2": { label: "Ukryty kod bezpieczeństwa 2", unit: "" },
    "FI1_Geheimnis_3": { label: "Ukryty kod bezpieczeństwa 3", unit: "" },
    "FI1_Geheimnis_4": { label: "Ukryty kod bezpieczeństwa 4", unit: "" },
    "FI1_VIN_1": { label: "Znak VIN (Znak 1)", unit: " (ASCII)" },
    "FI1_VIN_2": { label: "Znak VIN (Znak 2)", unit: " (ASCII)" },
    "FI1_VIN_3": { label: "Znak VIN (Znak 3)", unit: " (ASCII)" },
    "FI1_VIN_4": { label: "Znak VIN (Znak 4)", unit: " (ASCII)" },
    "FI1_VIN_5": { label: "Znak VIN (Znak 5)", unit: " (ASCII)" },
    "FI1_VIN_6": { label: "Znak VIN (Znak 6)", unit: " (ASCII)" },
    "FI1_VIN_7": { label: "Znak VIN (Znak 7)", unit: " (ASCII)" },
    "FI1_VIN_8": { label: "Znak VIN (Znak 8)", unit: " (ASCII)" },
    "FI1_VIN_9": { label: "Znak VIN (Znak 9)", unit: " (ASCII)" },
    "FI1_VIN_10": { label: "Znak VIN (Znak 10)", unit: " (ASCII)" },
    "FI1_VIN_11": { label: "Znak VIN (Znak 11)", unit: " (ASCII)" },
    "FI1_VIN_12": { label: "Znak VIN (Znak 12)", unit: " (ASCII)" },
    "FI1_VIN_13": { label: "Znak VIN (Znak 13)", unit: " (ASCII)" },
    "FI1_VIN_14": { label: "Znak VIN (Znak 14)", unit: " (ASCII)" },
    "FI1_VIN_15": { label: "Znak VIN (Znak 15)", unit: " (ASCII)" },
    "FI1_VIN_16": { label: "Znak VIN (Znak 16)", unit: " (ASCII)" },
    "FI1_VIN_17": { label: "Znak VIN (Znak 17)", unit: " (ASCII)" }
});


const activeCards = Object.create(null);
const errorRegistry = Object.create(null);
const frameDataCache = Object.create(null);
const terminalBuffer = [];
const TERMINAL_MAX_LINES = 300;

let socket = null;
let __cachedFrameHex = null;
let __cachedFrameBigInt = 0n;

function getSocket() {
    return socket;
}

function setSocket(nextSocket) {
    socket = nextSocket;
}

function getCachedFrameHex() {
    return __cachedFrameHex;
}

function getCachedFrameBigInt() {
    return __cachedFrameBigInt;
}

function setCachedFrame(hex, dataBigInt) {
    __cachedFrameHex = hex;
    __cachedFrameBigInt = dataBigInt;
}

// ===== js/utils.js =====

function extractCANSignal(hexString, startBit, length, multiplier = 1, offset = 0, isSigned = false) {
    // 1. Parsowanie "01 02 0A" do BigInt tylko raz na ramkę
    let dataBigInt;
    if (typeof hexString === 'bigint') {
        dataBigInt = hexString;
    } else if (hexString === getCachedFrameHex()) {
        dataBigInt = getCachedFrameBigInt();
    } else {
        const bytes = hexString.trim().split(' ').map(x => BigInt('0x' + x));
        dataBigInt = 0n;
        for (let i = 0; i < bytes.length; i++) {
            dataBigInt |= (bytes[i] << BigInt(i * 8));
        }
        setCachedFrame(hexString, dataBigInt);
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


function parseHexToBigInt(hexString) {
    const bytes = hexString.trim().split(' ').map(x => BigInt('0x' + x));
    let dataBigInt = 0n;
    for (let i = 0; i < bytes.length; i++) {
        dataBigInt |= (bytes[i] << BigInt(i * 8));
    }
    return dataBigInt;
}

function ensureFrameBigInt(hexData) {
    if (getCachedFrameHex() !== hexData) {
        setCachedFrame(hexData, parseHexToBigInt(hexData));
    }
    return getCachedFrameBigInt();
}

function formatSignalValue(meta, value) {
    if (meta.states && meta.states[value] !== undefined) {
        return meta.states[value];
    }
    const num = (typeof value === 'number' && !Number.isInteger(value)) ? value.toFixed(2) : value;
    return `${num}${meta.unit || ""}`;
}

// ===== js/decoders/system.js =====

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
        html += `<div class="ind active-error full-width blink-fast">WYPADEK / CRASH DETECTED!</div>`;
    }

    gridContainer.innerHTML = html;
}

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
        html += `<div class="ind active-blue full-width">MAGISTRALA: USYPIANIE (SLEEP)</div>`;
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
        html += `<div class="ind active full-width">WAKE-UP: ${wakeReasons.join(', ')}</div>`;
    }

    // --- Tryb Awaryjny (Limp Home) ---
    if (fullData.NMGW_I_CmdLimpHome === 1) {
        html += `<div class="ind active-error full-width blink">TRYB AWARYJNY (LIMP HOME)!</div>`;
    }

    gridContainer.innerHTML = html;
}

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
        html += `<div class="ind active-error full-width blink">WYKRYTO BŁĘDY (DTC)!</div>`;
        
        // Wypisanie skróconej listy modułów z usterkami
        html += `<div class="ind active-error full-width">Moduły: ${activeErrors.join(', ')}</div>`;
        cardElement.style.borderColor = "var(--red)";
    } else {
        html += `<div class="ind active-green full-width">SKANOWANIE OK - BRAK BŁĘDÓW</div>`;
        cardElement.style.borderColor = "var(--green)";
    }

    gridContainer.innerHTML = html;
}

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
    const brandMeta = signalMeta.SY1_Marke?.states || {};
    const brand = (brandMeta[fullData.SY1_Marke] || "Nieznana").toUpperCase();

    let steering = fullData.SY1_Rechtslenker === 1 ? "RHD (Prawa)" : "LHD (Lewa)";
    let doors = fullData.SY1_Viertuerer === 1 ? "4/5 DRZWI" : "2/3 DRZWI";

    html += `<div class="ind active-blue full-width">ZAKODOWANO: ${brand} | ${doors} | ${steering}</div>`;

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
        html += `<div class="ind active-error full-width blink-fast">UWAGA: AWARYJNE HAMOWANIE!</div>`;
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
        html += `<div class="ind active-error full-width blink">BŁĄD GATEWAY: BRAK ODPOWIEDZI STEROWNIKA (SOLL != IST)</div>`;
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
    
    html += `<div class="ind full-width">GŁÓWNE: ${keyModules.join(', ')} ... [Kliknij by zobaczyć 64]</div>`;

    gridContainer.innerHTML = html;
}

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
        html += `<div class="ind active-orange full-width blink">SKANOWANIE VIN: ${vinString}</div>`;
        cardElement.style.borderColor = "var(--orange)";
    } else {
        html += `<div class="ind active-blue full-width">${vinString}</div>`;
        html += `<div class="ind active full-width">NUMER NADWOZIA ZWERYFIKOWANY</div>`;
        cardElement.style.borderColor = "var(--blue)";
    }

    gridContainer.innerHTML = html;
}

// ===== js/decoders/comfort.js =====

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

function decodeZASData(id, hexData, cardElement) {
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
        html += `<div class="ind active full-width">CZUJNIK ŚWIATŁA: Wartość ${fullData.DI1_Sensor}</div>`;
        cardElement.style.borderColor = "var(--blue)";
    }

    gridContainer.innerHTML = html;
}

// ===== js/decoders/drive.js =====

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
    
    html += `<div class="ind active-green full-width">BIEG: ${bieg}${shiftLockStr}</div>`;

    gridContainer.innerHTML = html;
}

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
        html += `<div class="ind active full-width">OBROTY: ${fullData.GWM_Motordrehzahl} RPM</div>`;
    }

    // --- Temperatura Płynu Chłodzącego ---
    // Według pliku błąd to raw wartość 255. Z przelicznikiem (255 * 0.75 - 48) daje to 143.25 °C.
    if (fullData.GWM_KuehlmittelTemp >= 143) {
        html += `<div class="ind active-error full-width">TEMP. PŁYNU: BŁĄD CZUJNIKA</div>`;
    } else {
        html += `<div class="ind full-width">TEMP: ${fullData.GWM_KuehlmittelTemp.toFixed(1)} °C</div>`;
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
        html += `<div class="ind active full-width">KĄT: ${Math.abs(actualAngle).toFixed(1)}° (${dirStr})</div>`;
        html += `<div class="ind full-width">PRĘDKOŚĆ OBR: ${Math.abs(actualSpeed).toFixed(1)} °/s</div>`;
    }

    // --- Status Kalibracji / Zasilania ---
    if (fullData.LW1_KL30_Ausfall === 1) {
        html += `<div class="ind active-orange full-width">WYKRYTO ODPIĘCIE AKUMULATORA (KL30)</div>`;
    } else if (fullData.LW1_ID === 0) {
        html += `<div class="ind active-orange full-width">WYMAGANA KALIBRACJA G85</div>`;
    }

    gridContainer.innerHTML = html;
}

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
        html += `<div class="ind active full-width">ZADANE TURBO: ${fullData.MO7_Ladedruckneu.toFixed(2)} bar</div>`;
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
        html += `<div class="ind full-width">TEMP. OLEJU: ${fullData.MO7_Oeltemperatur} °C</div>`;
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
        html += `<div class="ind active full-width">AKUMULATOR (GŁÓWNY): ${fullData.BS2_U_BATT.toFixed(2)} V</div>`;
    }

    // --- Drugi akumulator (opcja dla Webasto itp.) ---
    if (fullData.BS2_VB_2_Battarie === 1) {
        if (fullData.BS2_U_Start_BATT >= 17.7) {
            html += `<div class="ind active-error full-width">NAPIĘCIE (DODATKOWE): BŁĄD</div>`;
        } else {
            html += `<div class="ind active full-width">AKUMULATOR (DODATK.): ${fullData.BS2_U_Start_BATT.toFixed(2)} V</div>`;
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
            html += `<div class="ind active-error full-width">ODCIĘTO: ${cutoffs.join(', ')}</div>`;
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
        
        html += `<div class="ind active full-width">PALIWO: ${fullData.KO1_Tankinhalt} L</div>`;
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
        
        html += `<div class="ind full-width">CZAS POSTOJU: ${timeStr}</div>`;
    }

    // --- Ostrzeżenia na desce ---
    let alerts = [];
    if (fullData.KO1_Handbremse === 1) alerts.push("HAMULEC RĘCZNY"); //
    if (fullData.KO1_WaschWasser === 1) alerts.push("PŁYN SPRYSK."); //
    
    if (alerts.length > 0) {
        html += `<div class="ind active-error full-width">KONTROLKI: ${alerts.join(', ')}</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    // --- Podświetlenie Wnętrza / Zegarów ---
    // 127 = błąd
    if (fullData.KO1_Bel_Displ < 127) {
         html += `<div class="ind active">ŚCIEMNIACZ ZEGARÓW: ${fullData.KO1_Bel_Displ}%</div>`;
    }

    gridContainer.innerHTML = html;
}

// ===== js/decoders/media.js =====

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
        html += `<div class="ind active-error full-width blink">BŁĄD WSPOMAGANIA (KONTROLKA)</div>`;
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
        html += `<div class="ind active">TEMP: ${fullData.GWK_AussenTemp_gefiltert.toFixed(1)} °C</div>`;
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
        html += `<div class="ind active-error full-width blink-fast">OSTRZEŻENIE: SILNIK GORĄCY!</div>`;
        cardElement.style.borderColor = "var(--red)";
    }

    gridContainer.innerHTML = html;
}

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

    html += `<div class="ind full-width">DZIEŃ TYGODNIA: ${currentDay}</div>`;

    gridContainer.innerHTML = html;
}

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
        html += `<div class="ind active-error full-width blink">GLOBALNY RESET DDP!</div>`;
    }

    gridContainer.innerHTML = html;
}

function decodeGateway3Data(id, hexData, cardElement) {
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
        const countryMeta = signalMeta.GW3_Laendervariante?.states || {};
        const langMeta = signalMeta.GW3_Sprachvariante?.states || {};
        const country = (countryMeta[fullData.GW3_Laendervariante] || "Nieznany").toUpperCase();
        let lang = (langMeta[fullData.GW3_Sprachvariante] || "NIEZNANY").toUpperCase();
        if (lang === "BRAK") lang = "BRAK";
        
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
        
        html += `<div class="ind active full-width">SILNIK: ${cylStr}${isTurbo}</div>`;
    }

    // --- Flagi Opóźnień (Timeout) ---
    // Gateway informuje czy paczki z licznika (>100ms) i silnika się nie spóźniają 
    if (fullData.GW3_Alt_3_Kombi === 1 || fullData.GW3_Alt_5_Motor === 1) {
        html += `<div class="ind active-error full-width">OPÓŹNIENIE MAGISTRALI (TIMEOUT)!</div>`;
    }

    gridContainer.innerHTML = html;
}

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
        html += `<div class="ind active-blue full-width">ODO: ${kmFormatted} km</div>`;
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

            html += `<div class="ind active full-width">DATA: ${d}.${mo}.${y}</div>`;
            html += `<div class="ind active full-width">CZAS: ${h}:${mi}:${s}</div>`;
        } else {
            html += `<div class="ind active-error full-width">CZAS/DATA: NIEUSTAWIONE (INIT)</div>`;
        }
    }

    // --- Verlernzaehler (Licznik cykli) ---
    // 255 (FFh) oznacza błąd
    if (fullData.DN1_Verlernzaehler === 255) {
        html += `<div class="ind active-error full-width blink">BŁĄD CYKLU JAZDY</div>`;
    }

    gridContainer.innerHTML = html;
}

// ===== js/decoders/router.js =====

const frameRegistry = Object.freeze({
    "0x151": { name: "AIRBAG (mAirbag_1)", zone: "system", decoder: decodeAirbagData },
    "0x291": { name: "ZAMEK / KOMFORT (mZKE_1)", zone: "komfort", decoder: decodeZKEData },
    "0x2C1": { name: "MANETKI (mLSM_1)", zone: "komfort", decoder: decodeManetkiData },
    "0x2C3": { name: "STACYJKA (mZAS_Status)", zone: "naped", decoder: decodeZASData },
    "0x351": { name: "GATEWAY (mGateway_1)", zone: "system", decoder: decodeGateway1Data },
    "0x359": { name: "HAMULCE / BIEGI (mGW_Bremse)", zone: "naped", decoder: decodeBremseGetriebeData },
    "0x35B": { name: "SILNIK (mGW_Motor)", zone: "naped", decoder: decodeMotorData },
    "0x3C3": { name: "KĄT SKRĘTU (mLenkwinkel)", zone: "naped", decoder: decodeLenkwinkelData },
    "0x3E1": { name: "CLIMATRONIC 1 (mClima_1)", zone: "komfort", decoder: decodeClima1Data },
    "0x3E3": { name: "CLIMATRONIC 2 (mClima_2)", zone: "komfort", decoder: decodeClima2Data },
    "0x42B": { name: "SLEEP / WAKE (mNM_Gateway)", zone: "system", decoder: decodeNMGatewayIData },
    "0x470": { name: "DRZWI / ŚWIATŁA (mBSG_Kombi)", zone: "komfort", decoder: decodeBSGKombiData },
    "0x527": { name: "TEMP. ZEWN. (mGW_Kombi)", zone: "media", decoder: decodeGWKombiData },
    "0x555": { name: "TURBO / OLEJ (mMotor7)", zone: "naped", decoder: decodeMotor7Data },
    "0x557": { name: "BŁĘDY MODUŁÓW (mKD_Error)", zone: "system", decoder: decodeKDErrorData },
    "0x571": { name: "ZASILANIE / AKU (mBSG_2)", zone: "naped", decoder: decodeBSG2Data },
    "0x575": { name: "STATUS ŚWIATEŁ (mBSG_3)", zone: "komfort", decoder: decodeBSG3Data },
    "0x60E": { name: "JEDNOSTKI (mEinheiten)", zone: "media", decoder: decodeEinheitenData },
    "0x621": { name: "PALIWO / RĘCZNY (mKombi_K1)", zone: "naped", decoder: decodeKombiK1Data },
    "0x62F": { name: "WYŚWIETLACZ MFA (mDisplay_1)", zone: "media", decoder: decodeDisplay1Data },
    "0x635": { name: "ŚCIEMNIANIE DESKI (mDimmung)", zone: "komfort", decoder: decodeDimmungData },
    "0x651": { name: "FLAGI SYSTEMU (mSysteminfo)", zone: "system", decoder: decodeSysteminfo1Data },
    "0x653": { name: "REGION / JĘZYK (mGateway_3)", zone: "media", decoder: decodeGateway3Data },
    "0x655": { name: "LISTA MODUŁÓW (mVerbauliste)", zone: "system", decoder: decodeSollverbauData },
    "0x65D": { name: "CZAS / PRZEBIEG (mDiagnose_1)", zone: "media", decoder: decodeDiagnose1Data },
    "0x65F": { name: "VIN POJAZDU (mFzg_Ident)", zone: "system", decoder: decodeFzgIdentData },
});

const canDictionary = Object.freeze(
    Object.fromEntries(
        Object.entries(frameRegistry).map(([id, def]) => [id, { name: def.name, zone: def.zone }])
    )
);

const decoderRouter = Object.freeze(
    Object.fromEntries(
        Object.entries(frameRegistry).map(([id, def]) => [id, def.decoder])
    )
);

// ===== js/ui.js =====

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

function logTerminal(msg) {
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

function setupModal() {
    const modal = document.getElementById('info-modal');
    const close = document.querySelector('.close-btn');
    
    close.onclick = () => modal.classList.remove('show');
    window.onclick = (e) => { if (e.target == modal) modal.classList.remove('show'); };
}

function openModal(id) {
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

function generateSnapshot() {
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

function requestFullDtcScan() {
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

function downloadTerminalLogs() {
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

function decodeSpecificFrame(id, hexData, cardElement) {
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

// ===== js/ws.js =====

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

function connectWebSocket() {
    const socket = new WebSocket(WS_URL);
    setSocket(socket);

    socket.onopen = () => {
        updateStatus("POŁĄCZONO Z PYTHONEM", "var(--green)");
        logTerminal("SYS:JS:WS_CONNECTED");
    };

    socket.onmessage = (event) => {
        parseIncomingData(event.data);
        // Odblokowanie przycisku gdy Python zakończy skanowanie
        if (event.data.includes("AUTO-SKAN ZAKOŃCZONY")) {
            const btnScan = document.getElementById('btn-scan-all');
            if (btnScan) {
                btnScan.disabled = false;
                btnScan.style.opacity = "1";
                btnScan.textContent = "🛠️ AUTO-SKAN DTC";
            }
            updateStatus("AUTO-SKAN ZAKOŃCZONY", "var(--green)");
        }
    };

    socket.onclose = () => {
        updateStatus("UTRACO_POŁĄCZENIE Z PYTHONEM", "var(--red)");
        logError("JS", "WS_DISCONNECTED", "Brak połączenia z bridge.py");
        setTimeout(connectWebSocket, 3000); // Autoreconnect
    };

    socket.onerror = () => {
        logError("JS", "WS_ERROR", "Błąd gniazda WebSocket");
    };
}

// ===== js/main.js =====

document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    startClock();
    setupModal();

    const btnSnapshot = document.getElementById('btn-snapshot');
    if (btnSnapshot) {
        btnSnapshot.addEventListener('click', generateSnapshot);
    }

    const btnScanAll = document.getElementById('btn-scan-all');
    if (btnScanAll) {
        btnScanAll.addEventListener('click', requestFullDtcScan);
    }

    const btnDownloadLogs = document.getElementById('btn-download-logs');
    if (btnDownloadLogs) {
        btnDownloadLogs.addEventListener('click', downloadTerminalLogs);
    }
});

