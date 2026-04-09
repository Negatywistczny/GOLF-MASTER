# DOKUMENTACJA KODU ARDUINO - VAG PQ35 INFOTAINMENT CAN

## 1. ZASADA DZIAŁANIA KOMUNIKACJI CAN (LOGIKA NM OSEK)
Oprogramowanie realizuje pełną obsługę protokołu **Network Management (NM)** stosowanego w grupie VAG. Kod na bieżąco analizuje stan magistrali i decyduje o podtrzymaniu komunikacji lub przejściu w tryb uśpienia.

* **Analiza Aktywności (Bajt 2, bit 0x80):** Głównym wskaźnikiem podtrzymania aktywności sieci przez Gateway (ID `0x42B`) jest bit `0x80` w Bajcie 2 w ramkach typu ALIVE. Gdy w aucie występuje fizyczna aktywność (np. praca zamka centralnego), Gateway ustawia ten bit na około 5 sekund. Odpowiadamy w ringu OSEK i podtrzymujemy pompę radia (`0x661`) tylko i wyłącznie wtedy, gdy ten bit jest aktywny.
* **Aktywne Podtrzymanie (Ring):** Dopóki Gateway utrzymuje bit `0x80` w Bajcie 2, Arduino aktywnie uczestniczy w ringu OSEK. Na każde odpytanie z Gatewaya (Bajt 0 = `0x0B`), przy aktywnym bicie `0x80`, Arduino odpowiada własną ramką `0x40B`. Ustawia w niej opkod `0x02` (Ring) lub `0x01` (Alive - powrót po błędzie). Jednocześnie uruchamiany jest asynchroniczny timer, który co 150 ms wysyła ramkę `0x661` (status włączonego radia).
* **Procedura Uśpienia (Sleep Mode):** Gdy znikają powody aktywności, Gateway przestaje utrzymywać bit `0x80` w Bajcie 2. Warunek aktywności przestaje być spełniony. Arduino natychmiast przestaje wysyłać ramki `0x40B` oraz `0x661`. Całkowita cisza ze strony układu pozwala modułowi Gateway na wysłanie oficjalnej flagi uśpienia **SLEEP_INDICATION** (`0x10` w Bajcie 1) i sprzętowe wygaszenie magistrali.

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
* **Logika OSEK:** Detekcja ramki `0x42B`. Ocena stanu uśpienia (Bajt 1) oraz warunku aktywności (bit `0x80` w Bajcie 2). Ewentualne wysłanie ramki `0x40B`.
* **Sniffer:** Przekazanie do terminala odebranych danych po przefiltrowaniu (ignorowane są cykliczne ramki generujące duży ruch: `0x531`, `0x661`, `0x40B`).
* **Watchdog (isHanging):** Zabezpieczenie przed zamrożeniem magistrali. Jeżeli minęło ponad 2000 ms od odbioru ostatniej ramki, a Gateway nie wysłał flagi uśpienia (`SLEEP_IND`), układ zgłasza błąd `ERR:CAN:HANG`.
* **Pompka Radia:** Jeśli w ostatniej ramce Gateway ustawiony jest bit `0x80` w Bajcie 2, timer wysyła ramkę `0x661` co 150 ms.
* **Watchdog Sprzętowy:** Wywołanie `checkHardwareErrors()` dokładnie co 1000 ms.

## 4. FORMAT DANYCH WYJŚCIOWYCH (SERIAL)
Wyjście z mikrokontrolera jest w pełni surowe i zoptymalizowane pod parsowanie maszynowe. Występują tylko trzy kategorie wiadomości:

* **Ramki danych:** Format `0x[ID_HEX]: [BAJT_1] [BAJT_2] ...` (np. `0x42B: 0B 02 00 00 00 00`).
* **Zdarzenia systemowe:** `SYS:HW:READY` oraz `SYS:CAN:SLEEP_IND`.
* **Zdarzenia błędów:** `ERR:HW:INIT_FAIL`, `ERR:CAN:HANG`, `ERR:HW:TJA` oraz `ERR:HW:0x[KOD]`.