# DOKUMENTACJA KODU ARDUINO - VAG PQ35 INFOTAINMENT CAN

## 1. ZASADA DZIAŁANIA KOMUNIKACJI CAN (LOGIKA NM OSEK)
Oprogramowanie realizuje obsługę **Network Management (NM)** stosowanego w grupie VAG. Kod analizuje ramki Gatewaya (`0x42B`) i stosuje **logikę zero-jedynkową**: pełna aktywność NM i podtrzymanie radia włączają się wyłącznie wtedy, gdy Gateway w ramce **Alive** (Bajt kontrolny `0x02`) raportuje **niezerową przyczynę wybudzenia** w **Bajcie 2** (*Weckursache* — m.in. CAN, Wake, Timer jako bity maski).

* **Weckursache (Bajt 2 ramki `0x42B`, tylko Alive):** Wartość Bajtu 2 jest zapamiętywana **wyłącznie** z ramek typu Alive (`rxBuf[1] == 0x02`). Dzięki temu puste lub niepełne payloady z ramek Ring nie zerują stanu i nie powodują migotania odpowiedzi `0x40B` ani pompy `0x661`.
* **Tryb zero-jedynkowy:** Odpowiedź w ringu (`0x40B`) oraz cykliczna ramka podtrzymania radia (`0x661`, co 150 ms) działają **tylko** gdy `lastBajt2 != 0x00`, czyli gdy Gateway sygnalizuje aktywny co najmniej jeden powód wybudzenia (np. CAN / Wake / Timer w polu Weckursache). Gdy wszystkie przyczyny wygasną (`Bajt 2 == 0`), Arduino **natychmiast** przestaje nadawać — to celowe milczenie, które umożliwia magistrali przejście w uśpienie.
* **Aktywne Podtrzymanie (Ring):** Na odpytanie z Gatewaya (Bajt 0 = `0x0B`), przy `lastBajt2 != 0x00`, węzeł `0x0B` odpowiada ramką `0x40B` (Ring `0x02`, ewentualnie Alive `0x01` przy bicie Limp Home w Bajcie 1).
* **Procedura Uśpienia (Sleep Mode) i watchdog:** Flaga **SLEEP_INDICATION** (`0x10` w Bajcie 1 ramki Gatewaya) jest śledzona przy ramkach **Alive** skierowanych do węzła `0x0B`, aby **watchdog zawieszenia** (`ERR:CAN:HANG`) nie raportował błędu, gdy sieć jest już w procedurze uśpienia. Po wygaśnięciu przyczyn wybudzenia Arduino nie podtrzymuje NM ani radia, co sprzyja wyciszeniu magistrali i dalszej sekwencji uśpienia po stronie Gatewaya.

## 2. KONFIGURACJA SPRZĘTOWA
* **TJA1055T (Transiwer):** Układ pracuje w trybie ciągłej gotowości. Piny `STB` oraz `EN` są na stałe podciągnięte do stanu wysokiego (`HIGH`). Nie ingerujemy sprzętowo w stany uśpienia transiwera – uśpienie realizowane jest w 100% programowo (brak nadawania = uśpienie z punktu widzenia Gatewaya). Monitorowany jest fizyczny pin `TJA_ERR` w celu wykrycia usterek elektrycznych na liniach CAN.
* **MCP2515 (Kontroler CAN):** Pracuje z prędkością 100 kbps (Standard VAG Low-Speed). Kluczowym ustawieniem jest modyfikacja rejestru `0x0F` (ustawienie bitu na `0x08`), co włącza tryb **One-Shot**. W tym trybie, jeśli ramka nie uzyska potwierdzenia (ACK) od innych modułów, kontroler nie próbuje jej retransmitować w nieskończoność. Zapobiega to całkowitemu blokowaniu i zawieszaniu magistrali.

## 3. OPIS FUNKCJI PROGRAMU

### `setup()`
Inicjalizuje port szeregowy (115200 baud). Ustawia kierunki pinów sterujących, załącza na sztywno TJA1055T i próbuje zainicjować MCP2515. Wypuszcza komunikat systemowy `SYS:HW:READY` lub blokuje program w nieskończonej pętli z błędem `ERR:HW:INIT_FAIL`.

### `processSerial()`
Funkcja realizująca nadawanie ramek na żądanie. Nasłuchuje portu Serial. Jeśli odbierze łańcuch znaków w formacie `TX:ID:LEN:PAYLOAD` (np. `TX:40B:6:2B0200000000`), dekoduje go z formatu szesnastkowego (HEX) na bajty i bezzwłocznie wypycha na magistralę CAN.

### `checkHardwareErrors()`
Moduł autodiagnostyki sprzętowej monitorujący dwa poziomy:
1.  **Kontroler MCP2515:** Wykorzystuje funkcję `checkError()`. Wypisuje surowe kody błędów (`ERR:HW:MCP:0x...`). Jeżeli wykryty zostanie błąd `0x1D` (przepełnienie buforów lub tryb Error-Passive), funkcja twardo nadpisuje rejestry `0x30`, `0x40`, `0x50` zrzucając zawieszone pakiety i wymusza powrót układu do trybu `MCP_NORMAL`.
2.  **Transiwer TJA1055T:** Monitoruje stan fizycznego pinu `TJA_ERR`. Jeśli pin przejdzie w stan niski (`LOW`), system zgłasza fizyczną usterkę linii (np. zwarcie do masy/zasilania lub przerwanie linii) unikalnym komunikatem `ERR:HW:TJA`.

### `isDiagFrame(uint32_t id)`
Filtr statyczny. Priorytetyzuje ramki diagnostyczne VAG. Wymusza przepuszczenie każdej ramki znajdującej się w zakresach `0x200-0x27F` (oraz `0x300`) dla protokołu TP 2.0 oraz `0x700-0x7FF` dla protokołu UDS/KWP2000.

### `isDelta(uint32_t id, uint8_t len, uint8_t *data)`
Filtr dynamiczny oszczędzający przepustowość portu Serial. Utrzymuje w pamięci RAM tablicę do 50 najnowszych unikalnych ramek CAN. Przyrównuje każdą nową ramkę do jej poprzedniego stanu. Zwraca `true` wyłącznie wtedy, gdy dany identyfikator pojawia się po raz pierwszy lub gdy uległ zmianie przynajmniej jeden bajt wewnątrz jego payloadu.

### `loop()` - Przepływ Główny
Pętla programu jest w pełni asynchroniczna (brak `delay`), co gwarantuje natychmiastową reakcję na zdarzenia:
* **Odczyt TX:** Sprawdzenie zbuforowanych komend z PC (`processSerial()`).
* **Odbiór CAN:** Reakcja na przerwanie sprzętowe (`CAN_INT_PIN`). Pętla `while` opróżnia cały bufor odbiorczy MCP2515. Zapisywany jest czas ostatniej udanej transmisji (`lastRxTime`) oraz zerowana flaga zawieszenia (`isHanging`).
* **Logika OSEK:** Detekcja ramki `0x42B`. Bajt 2 (*Weckursache*) aktualizowany tylko z Alive; odpowiedź `0x40B` i warunek pompy `0x661` gdy `lastBajt2 != 0x00`. Flaga uśpienia `0x10` w Bajcie 1 (Alive → `0x0B`) steruje `isSleepIndicated` dla watchdogu.
* **Sniffer:** Przekazanie do terminala odebranych danych po przefiltrowaniu (ignorowane są cykliczne ramki generujące duży ruch: `0x531`, `0x661`, `0x40B`).
* **Watchdog (isHanging):** Zabezpieczenie przed zamrożeniem magistrali. Jeżeli minęło ponad 2000 ms od odbioru ostatniej ramki, a Gateway nie wysłał flagi uśpienia (`SLEEP_IND`), układ zgłasza błąd `ERR:CAN:HANG`.
* **Pompka Radia:** Gdy `lastBajt2 != 0x00` (aktywna Weckursache z Alive), timer wysyła ramkę `0x661` co 150 ms.
* **Watchdog Sprzętowy:** Wywołanie `checkHardwareErrors()` dokładnie co 1000 ms.

## 4. FORMAT DANYCH WYJŚCIOWYCH (SERIAL)
Wyjście z mikrokontrolera jest w pełni surowe i zoptymalizowane pod parsowanie maszynowe. Występują tylko trzy kategorie wiadomości:

* **Ramki danych:** Format `0x[ID_HEX]: [BAJT_1] [BAJT_2] ...` (np. `0x42B: 0B 02 00 00 00 00`).
* **Zdarzenia systemowe:** `SYS:HW:READY` oraz `SYS:CAN:SLEEP_IND`.
* **Zdarzenia błędów:** `ERR:HW:INIT_FAIL`, `ERR:CAN:HANG`, `ERR:HW:TJA` oraz `ERR:HW:0x[KOD]`.