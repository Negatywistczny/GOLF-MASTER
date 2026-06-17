# GOLF MASTER v50.0 — system zarządzania magistralą CAN

**GOLF MASTER** to ekosystem inżynieryjny do monitorowania magistrali **CAN-Infotainment** (VAG PQ35) z firmware na ESP32 i dashboardem webowym.

## Aktywna architektura

1. **Hardware (`hardware/esp32.ino`)** — firmware ESP32 (TWAI 100 kbps, przekaźniki, Auto-NM, BLE UART, WiFi/OTA).
2. **Smart UI (`web/`)** — dashboard live (Vanilla JS), parser ramek CAN i logów `SYS/ERR`, połączenie z terminalem BLE UART.

## Struktura projektu

- [hardware](hardware/README.md) — aktywny firmware ESP32 i konfiguracja warstwy sprzętowej.
- [web](web/README.md) — frontend i transport BLE UART.
- [data](data/README.md) — opisy sygnałów, mapy i materiały DBC.
- [MESSAGES.md](MESSAGES.md) — słownik komunikatów SYS/ERR.
- [archiwum](archiwum/README.md) — wycofane komponenty (bridge Python, Arduino, stary transport WS).

## Uruchamianie

1. Wgraj `hardware/esp32.ino` do modułu ESP32.
2. Otwórz `web/index.html`.
3. Kliknij `POŁĄCZ BT` i wybierz urządzenie BLE UART.

## Frontend (skrót)

- `web/index.html` — punkt wejścia (`file://`), ładuje `script.bundle.js`.
- `web/js/app/transport/btTerminal.js` — transport BLE UART i parser strumienia.
- `web/bundle_tool.py` — `build` (generuje bundle), `check` (szybka walidacja spójności).

Po zmianach w `web/js/**` przebuduj bundle:

```bash
python3 web/bundle_tool.py build
```
