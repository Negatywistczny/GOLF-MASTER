# GOLF MASTER v50.0 — system zarządzania magistralą CAN

**GOLF MASTER** to ekosystem inżynieryjny przeznaczony do monitorowania i zarządzania magistralą **CAN-Infotainment** w samochodach grupy VAG (platforma **PQ35**, m.in. VW Golf V, Passat B6, Leon II).

System łączy precyzję sprzętową mikrokontrolera z nowoczesnym interfejsem webowym, umożliwiając bezpieczną komunikację z autem bez ryzyka rozładowania akumulatora.

---

## Architektura systemu

Projekt składa się z trzech współpracujących warstw:

1. **Hardware (MCP2515 + TJA1055)** — fizyczny mostek wpięty w kable samochodu. Dwa lustrzane szkice w [`hardware/`](hardware/README.md):
   - **`arduino.ino`** — produkcyjny firmware (Auto-NM na `0x42B`, przekaźniki, pompa `0x661`); połączenie USB Serial.
   - **`esp32.ino`** — wariant ESP32 z Bluetooth, WiFi i OTA; docelowo ta sama logika CAN, obecnie warstwa łączności.
   Zasady walidacji i anty-regresji: [logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md](logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md).
2. **Bridge (Python)** — asynchroniczny serwer zarządzający przepływem danych oraz automatyczne zwalnianie portów.
3. **Smart UI (Web)** — responsywny dashboard w czasie rzeczywistym. Szczegóły: [web/README.md](web/README.md).

---

## Struktura projektu

Każdy folder ma dedykowaną dokumentację:

- [hardware](hardware/README.md) — `arduino.ino` (produkcja) i `esp32.ino` (BT/WiFi/OTA), konfiguracja TJA1055.
- [bridge](bridge/README.md) — Python, WebSocket.
- [web](web/README.md) — interfejs użytkownika, dekodery, terminal na żywo.
- [data](data/README.md) — bazy DBC, mapy adresów, opisy sygnałów.
- [MESSAGES.md](MESSAGES.md) — słownik komunikatów SYS/ERR w całym systemie.

### Frontend (skrót)

- Warstwa Web UI: moduły ES6 w `web/js/`, uruchomienie lokalne przez `script.bundle.js`.
- `web/index.html` — punkt wejścia, ładuje `script.bundle.js` (`file://`).
- `web/js/` — `app/`, `ui/`, `state/`, `can/` (w tym `decoders/`, `frameRegistry.js`), `shared/` — pełny opis: [web/README.md](web/README.md).
- `web/bundle_tool.py` — `build` (składa bundle), `check` (szybka kontrola lokalna).
- **Hybryda bundla:** `web/script.bundle.js` jest commitowany (wygodne uruchomienie); po edycji `web/js/**` uruchom `build` i dołącz zaktualizowany bundle do tego samego commita. Na CI workflow odtwarza bundle i porównuje z repozytorium — szczegóły: [web/README.md](web/README.md).

---

## Uruchamianie (one-click)

- Windows: `START.bat`
- macOS: `START.command`

### Kroki

1. Uruchom plik startowy dla swojego systemu.
2. Wybierz tryb:
   - `1` — rzeczywisty bridge (`bridge/bridge.py`)
   - `2` — symulacja (`bridge/test_simulation.py`)
3. Skrypt: przebuduje `web/script.bundle.js`, uruchomi wybrany bridge, otworzy `web/index.html` (`file://`).

### Uwagi

- UI działa offline po dwukliku `web/index.html`.
- Po ręcznych zmianach w `web/js/**/*.js` przebuduj bundle i zacommituj go razem ze źródłami: `python3 web/bundle_tool.py build` (opcjonalnie wcześniej: `python3 web/bundle_tool.py check`).
