# SPECYFIKACJA KOMUNIKATÓW SYSTEMOWYCH (SYS) I BŁĘDÓW (ERR)
**Projekt:** GOLF MASTER (Arduino <-> Python <-> Web UI)
**Wersja dokumentu:** 1.0

---

## 1. WARSTWA SPRZĘTOWA (Arduino - hardware.ino)
Komunikaty te są wysyłane przez Arduino na port szeregowy (USB).

### Wiadomości Systemowe (SYS)
* **`SYS:HW:READY`**
    * **Opis:** Inicjalizacja MCP2515 zakończona sukcesem. Arduino jest gotowe do pracy.
    * **Kiedy:** Raz, po uruchomieniu urządzenia (w funkcji `setup`).
* **`SYS:CAN:SLEEP_IND`**
    * **Opis:** Gateway (0x42B) wysłał flagę uśpienia (Bajt 1, bit 0x10).
    * **Kiedy:** Gdy samochód oficjalnie wyłącza zasilanie magistrali Infotainment.

### Błędy (ERR)
* **`ERR:HW:INIT_FAIL`**
    * **Opis:** Brak komunikacji między Arduino a modułem MCP2515 (błąd SPI lub zasilania).
    * **Kiedy:** Podczas startu, jeśli układ CAN nie odpowiada.
* **`ERR:CAN:HANG`**
    * **Opis:** Wykryto "zamrożenie" magistrali. Zapłon powinien być aktywny, ale od >2s nie odebrano żadnej ramki.
    * **Kiedy:** Gdy występuje fizyczny problem z komunikacją przy włączonym aucie.
* **`ERR:HW:TJA`**
    * **Opis:** Błąd fizyczny transiwera TJA1055T.
    * **Kiedy:** Wykrycie zwarcia linii CAN-L lub CAN-H do masy/zasilania lub przerwanie obwodu (pin TJA_ERR w stanie LOW).
* **`ERR:HW:0x[HEX]`**
    * **Opis:** Surowy kod błędu z rejestru MCP2515.
    * **Kiedy:** Przepełnienie buforów (Overflow) lub wejście kontrolera w tryb Error-Passive. Najczęstszy kod to `0x05`.

---

## 2. WARSTWA MOSTEK (Python - bridge.py)
Komunikaty generowane przez skrypt pośredniczący, wysyłane do konsoli oraz przez WebSocket do przeglądarki.

### Wiadomości Systemowe (SYS)
* **`SYS:PY:BROWSER_CONNECTED (Total: n)`**
    * **Opis:** Nowa instancja Smart UI połączyła się z mostkiem.
* **`SYS:PY:BROWSER_DISCONNECTED (Total: n)`**
    * **Opis:** Przeglądarka zamknęła połączenie.
* **`SYS:PY:NO_CLIENTS_WAITING_2S`**
    * **Opis:** Uruchomienie procedury auto-shutdown. Brak aktywnych użytkowników.
* **`SYS:PY:SHUTDOWN_CANCELLED`**
    * **Opis:** Procedura zamykania przerwana – nowy użytkownik połączył się w ostatniej chwili.
* **`--- SYS:PY:AUTO_SHUTDOWN ---`**
    * **Opis:** Skrypt Python zabija własny proces (os._exit), aby zwolnić port COM.

---

## 3. WARSTWA INTERFEJSU (Frontend - ES Modules: main.js / ws.js / ui.js)
Komunikaty generowane w konsoli przeglądarki lub wyświetlane bezpośrednio użytkownikowi w UI.

### Statusy Połączenia (Logi UI)
* **`SYS:JS:WS_CONNECTED`** - Udane połączenie z mostkiem Python.
* **`ERR:JS:WS_DISCONNECTED`** - Utrata połączenia (mostek wyłączony lub błąd sieci).
* **`ERR:JS:WS_ERROR`** - Krytyczny błąd gniazda WebSocket.

### Błędy Logiczne (Widoczne w kartach UI)
* **`BŁĘD WFS (IMMO) / VIN NIEZAKODOWANY!`**
    * **Opis:** Wyświetlany, gdy ramki VIN z Immobilizera zawierają znaki `XXX` lub `---`.
    * **Kiedy:** Problem z dopasowaniem komponentów lub błąd odczytu VIN.
* **`SKANOWANIE VIN...`**
    * **Opis:** Status informujący o zbieraniu części składowych VIN z ramek MUX.

---

## 4. FORMAT DANYCH (RAW DATA)
Poza komunikatami statusowymi, główny strumień danych płynie w formacie:
* `0x[ID]: [D0] [D1] [D2] [D3] [D4] [D5] [D6] [D7]`
    * *Przykład:* `0x42B: 0B 02 00 00 00 00`
* `TX:[ID]:[LEN]:[DATA]` (Polecenie wysłania ramki z PC do Auta).
