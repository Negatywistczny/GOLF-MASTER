# Komunikaty systemowe (SYS) i błędy (ERR)

**Projekt:** GOLF MASTER (ESP32 BLE UART ↔ Web UI)  
**Wersja dokumentu:** 1.0

---

## 1. Warstwa sprzętowa (ESP32)

Komunikaty na porcie szeregowym (USB).

### System (SYS)

- **`SYS:HW:READY`** — inicjalizacja sprzętu zakończona; ESP32 gotowe. Wysyłane raz w `setup`.
- **`SYS:CAN:SLEEP_IND`** — Gateway (`0x42B`) ustawił flagę uśpienia (bajt 1, bit `0x10`, przy typie Alive w dolnym nibble). Watchdog traktuje ciszę jako dozwoloną podczas procedury uśpienia.
- **`SYS:CAN:WAKE_START`** — w ramce Alive do `0x0B` pole `wakeCombo` (bajty 2–4) przeszło z zera na wartość niezerową (początek / wznowienie sygnalizacji przyczyn wybudzenia). Zwykle zaraz potem sniffer wyświetli zmienioną linię `0x42B: …`.
- **`SYS:CAN:WAKE_END`** — `wakeCombo` wróciło do zera (brak przyczyn w tych bajtach według tej samej definicji).

### Błędy (ERR)

- **`ERR:HW:INIT_FAIL`** — błąd inicjalizacji sterownika TWAI/CAN.
- **`ERR:CAN:HANG`** — brak ramek >2 s przy oczekiwanej aktywności magistrali.
- **`ERR:HW:TJA`** — błąd transceivera TJA1055T (np. zwarcie CAN-L/H, pin `TJA_ERR` w LOW).
- **`ERR:HW:TWAI:BUS_OFF`** — kontroler TWAI wszedł w stan `BUS_OFF`.

---

## 2. Warstwa mostka (Python) — archiwum

Komunikaty historyczne (przeniesione do `archiwum/bridge/`).

### System (SYS)

- **`SYS:PY:BROWSER_CONNECTED (Total: n)`** — nowe połączenie z UI.
- **`SYS:PY:BROWSER_DISCONNECTED (Total: n)`** — rozłączenie przeglądarki.
- **`SYS:PY:NO_CLIENTS_WAITING_2S`** — start odliczania auto-shutdown (brak klientów).
- **`SYS:PY:SHUTDOWN_CANCELLED`** — anulowanie shutdownu (nowy klient w czasie odliczania).
- **`--- SYS:PY:AUTO_SHUTDOWN ---`** — zakończenie procesu (`os._exit`), zwolnienie portu COM.

---

## 3. Warstwa interfejsu (Web)

Moduły: `app/main.js`, `app/bootstrap.js`, `app/transport/btTerminal.js`, `ui/index.js`; bundle: `script.bundle.js`.

### Logi połączenia

- **`SYS:JS:BT_CONNECT_START`** — rozpoczęcie procedury łączenia BLE UART.
- **`SYS:JS:BT_CONNECT_CANCELLED`** — anulowano wybór urządzenia BLE w pickerze.
- **`SYS:JS:BT_CONNECTED`** — połączenie z urządzeniem BLE UART.
- **`SYS:JS:BT_DISCONNECT`** — ręczne rozłączenie sesji BLE UART.
- **`ERR:JS:BT_DISCONNECTED`** — utrata połączenia BLE.
- **`ERR:JS:BT_CONNECT_FAIL`** — błąd inicjalizacji sesji BLE.
- **`ERR:JS:BT_UNSUPPORTED`** — brak wsparcia Web Bluetooth API w przeglądarce.

### Teksty w UI (przykłady)

- **`BŁĄD WFS (IMMO) / VIN NIEZAKODOWANY!`** — ramki VIN zawierają `XXX` lub `---`.
- **`SKANOWANIE VIN...`** — zbieranie segmentów VIN z ramek MUX.

---

## 4. Format danych (RAW)

- Ramki CAN: `0x[ID]: [D0] [D1] … [D7]`  
  *Przykład:* `0x42B: 0B 02 00 00 00 00`
- Polecenie TX z PC: `TX:[ID]:[LEN]:[DATA]`
