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

export { signalMeta, activeCards, errorRegistry, frameDataCache, terminalBuffer, TERMINAL_MAX_LINES, getSocket, setSocket, getCachedFrameHex, getCachedFrameBigInt, setCachedFrame };
