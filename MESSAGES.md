# Komunikaty systemowe (SYS) i błędy (ERR)

**Projekt:** GOLF MASTER (ESP32 BLE UART ↔ Web UI)  
**Wersja dokumentu:** 1.1 (2026-06-17)

---

## 1. Warstwa sprzętowa (ESP32)

Komunikaty na BLE UART (`VAG_ESP32_BT`) i USB Serial (115200).

### System (SYS)

| Komunikat | Opis |
|-----------|------|
| **`SYS:HW:READY`** | Inicjalizacja TWAI zakończona; ESP32 gotowe. Wysyłane raz w `setup()`. |
| **`SYS:FW:BUILD_ID:<id>`** | Identyfikator buildu firmware (np. `2026-06-17-p0`). Emitowany zaraz po `SYS:HW:READY`. |
| **`SYS:CAN:NM_MODE_AUTO`** | Auto-NM aktywne: stany `AUTO_ACTIVE` / `AUTO_SLEEP_PREP` / `AUTO_SILENT_LISTEN`. |
| **`SYS:CAN:SLEEP_IND`** | Gateway (`0x42B`) ustawił `SleepInd` (bajt 1, bit `0x10`). |
| **`SYS:CAN:WAKE_START`** | W Alive do `0x0B` pole `wakeCombo` (bajty 2–4) przeszło z zera na wartość niezerową. |
| **`SYS:CAN:WAKE_END`** | `wakeCombo` wróciło do zera. |
| **`SYS:CAN:IDLE_SHUTDOWN`** | 10 s ciszy CAN — przejście w idle shutdown i light sleep. |
| **`SYS:HW:LIGHT_SLEEP_ENTER`** | Wejście w light sleep (wakeup na `TWAI_RX_PIN`). |
| **`SYS:HW:LIGHT_SLEEP_WAKE`** | Wybudzenie z light sleep. |
| **`SYS:HW:TWAI:RECOVERING`** | Sterownik TWAI w recovery po `BUS_OFF`. |
| **`SYS:HW:TWAI:RUNNING`** | Sterownik TWAI w stanie `RUNNING`. |
| **`SYS:RELAY_ILL:OFF_BY_CAN_IDLE`** | Przekaźnik ILL wyłączony po 2 s bez ramek CAN. |
| **`SYS:RELAYS:FORCED_OFF_BY_SILENCE`** | Wszystkie przekaźniki OFF po 5 min ciszy CAN. |
| **`SYS:OTA:START`** | Rozpoczęto upload OTA; `otaInProgress` blokuje idle shutdown i light sleep. |
| **`SYS:OTA:END`** | Upload OTA zakończony. |

### Błędy (ERR)

| Komunikat | Opis |
|-----------|------|
| **`ERR:HW:INIT_FAIL`** | Błąd instalacji / startu sterownika TWAI. |
| **`ERR:CAN:HANG`** | Brak ramek `0x42B → 0x0B` >2 s przy oczekiwanej aktywności magistrali. |
| **`ERR:HW:TJA`** | Błąd transceivera TJA1055T (pin `TJA_ERR` w LOW). |
| **`ERR:HW:TWAI:BUS_OFF:TEC=…:REC=…:BUS=…:RXQ=…:TXQ=…`** | Kontroler TWAI w `BUS_OFF` z licznikami `twai_status_info_t`. |
| **`ERR:HW:TWAI:RECOVERY_START_FAIL`** | `twai_initiate_recovery()` nie powiódł się. |
| **`ERR:HW:TWAI:RESTART_FAIL`** | `twai_start()` po recovery nie powiódł się. |
| **`ERR:OTA:0x…`** | Błąd uploadu Arduino OTA (kod `ota_error_t`). |

### Polityka sleep vs OTA

Podczas trwającego OTA (`SYS:OTA:START` … `SYS:OTA:END` / błąd) firmware **nie** wywołuje `processCanIdleShutdown()` ani `wejdzWTrybLekkiegoSnu()`. Na czas OTA ustawiane jest `WiFi.setSleep(false)`.

### Polityka timerów przekaźników (kompromis produktowy)

Oprócz zdarzeń NM (`WAKE_*`, `SLEEP_IND`) firmware używa **timerów idle** dla przekaźników i zasilania:

- ILL OFF po 2 s ciszy CAN (`SYS:RELAY_ILL:OFF_BY_CAN_IDLE`),
- idle shutdown + light sleep po 10 s ciszy (`SYS:CAN:IDLE_SHUTDOWN`),
- wymuszone OFF wszystkich przekaźników po 5 min ciszy (`SYS:RELAYS:FORCED_OFF_BY_SILENCE`).

To jest świadomy kompromis (oszczędzanie energii + sterowanie radiem), odrębny od ścisłej polityki NM event-driven opisanej w `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`.

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

Moduły: `app/main.js`, `app/bootstrap.js`, `app/transport/btTerminal.js`, `app/messageCatalog.js`, `ui/esp32Runtime.js`, `ui/statusLogs.js`; bundle: `script.bundle.js`.

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
