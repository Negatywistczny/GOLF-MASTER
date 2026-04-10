# Komunikaty systemowe (SYS) i błędy (ERR)

**Projekt:** GOLF MASTER (Arduino ↔ Python ↔ Web UI)  
**Wersja dokumentu:** 1.0

---

## 1. Warstwa sprzętowa (Arduino)

Komunikaty na porcie szeregowym (USB).

### System (SYS)

- **`SYS:HW:READY`** — inicjalizacja MCP2515 zakończona; Arduino gotowe. Wysyłane raz w `setup`.
- **`SYS:CAN:SLEEP_IND`** — Gateway (`0x42B`) ustawił flagę uśpienia (bajt 1, bit `0x10`, przy typie Alive w dolnym nibble). Watchdog traktuje ciszę jako dozwoloną podczas procedury uśpienia.
- **`SYS:CAN:WAKE_START`** — w ramce Alive do `0x0B` pole `wakeCombo` (bajty 2–4) przeszło z zera na wartość niezerową (początek / wznowienie sygnalizacji przyczyn wybudzenia). Zwykle zaraz potem sniffer wyświetli zmienioną linię `0x42B: …`.
- **`SYS:CAN:WAKE_END`** — `wakeCombo` wróciło do zera (brak przyczyn w tych bajtach według tej samej definicji).

### Błędy (ERR)

- **`ERR:HW:INIT_FAIL`** — brak komunikacji Arduino ↔ MCP2515 (SPI lub zasilanie).
- **`ERR:CAN:HANG`** — brak ramek >2 s przy oczekiwanej aktywności magistrali.
- **`ERR:HW:TJA`** — błąd transceivera TJA1055T (np. zwarcie CAN-L/H, pin `TJA_ERR` w LOW).
- **`ERR:HW:0x[HEX]`** — surowy kod z rejestru MCP2515 (np. przepełnienie, Error-Passive); często `0x05`.

---

## 2. Warstwa mostka (Python)

Komunikaty w konsoli i przez WebSocket do przeglądarki.

### System (SYS)

- **`SYS:PY:BROWSER_CONNECTED (Total: n)`** — nowe połączenie z UI.
- **`SYS:PY:BROWSER_DISCONNECTED (Total: n)`** — rozłączenie przeglądarki.
- **`SYS:PY:NO_CLIENTS_WAITING_2S`** — start odliczania auto-shutdown (brak klientów).
- **`SYS:PY:SHUTDOWN_CANCELLED`** — anulowanie shutdownu (nowy klient w czasie odliczania).
- **`--- SYS:PY:AUTO_SHUTDOWN ---`** — zakończenie procesu (`os._exit`), zwolnienie portu COM.

---

## 3. Warstwa interfejsu (Web)

Moduły: `app/main.js`, `app/bootstrap.js`, `app/transport/ws.js`, `ui/index.js`; bundle: `script.bundle.js`.

### Logi połączenia

- **`SYS:JS:WS_CONNECTED`** — połączenie z mostkiem Python.
- **`ERR:JS:WS_DISCONNECTED`** — utrata połączenia (mostek wyłączony lub błąd sieci).
- **`ERR:JS:WS_ERROR`** — błąd gniazda WebSocket.

### Teksty w UI (przykłady)

- **`BŁĄD WFS (IMMO) / VIN NIEZAKODOWANY!`** — ramki VIN zawierają `XXX` lub `---`.
- **`SKANOWANIE VIN...`** — zbieranie segmentów VIN z ramek MUX.

---

## 4. Format danych (RAW)

- Ramki CAN: `0x[ID]: [D0] [D1] … [D7]`  
  *Przykład:* `0x42B: 0B 02 00 00 00 00`
- Polecenie TX z PC: `TX:[ID]:[LEN]:[DATA]`
