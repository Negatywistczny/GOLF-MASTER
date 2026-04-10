# Mostek Python (bridge) — GOLF MASTER

## 1. Rola w systemie

Skrypt `bridge.py` jest pośrednikiem między warstwą sprzętową (Arduino) a interfejsem użytkownika (Web UI). Zarządza asynchronicznym przepływem danych, kolejkami komunikatów oraz logiką diagnostyczną **TP 2.0 / KWP2000**.

## 2. Wymagania i konfiguracja

Środowisko: Python 3.8+.

Zależności (wersje w pliku [requirements.txt](requirements.txt)):

```bash
pip install -r requirements.txt
```

Uruchom powyższe w katalogu `bridge/` (lub podaj pełną ścieżkę do `requirements.txt`). Opcjonalnie użyj wirtualnego środowiska (`python3 -m venv .venv` → aktywacja → `pip install -r requirements.txt`).

- `pyserial` — komunikacja USB z Arduino.
- `websockets` — połączenie z przeglądarką.
- `asyncio` — w bibliotece standardowej (brak instalacji).

**Parametry (konfigurowalne w kodzie):**

- `SERIAL_PORT` — domyślnie `COM7`.
- `BAUD_RATE` — `115200`.
- `WS_PORT` — `8765`.

## 3. Kluczowe funkcjonalności

### A. Zarządzanie energią (auto-shutdown)

- **`auto_shutdown_timer()`** — po zamknięciu ostatniego klienta UI odlicza 2 s; jeśli nikt się nie połączy, proces kończy się (`os._exit(0)`).
- **Cel** — zwolnienie portu COM i zasobów, bez „wiszących” procesów blokujących Arduino.

### B. Port szeregowy

- **`handle_serial()`** — pętla nieskończona.
  - **TX (do Arduino)** — kolejka `tx_queue`.
  - **RX (z Arduino)** — broadcast do klientów WebSocket oraz kolejka `rx_queue` pod diagnostykę.

### C. Silnik diagnostyczny (TP 2.0 / KWP2000)

**`tp20_read_dtc()`** — handshake z modułami VAG:

1. Channel setup — sesja na ID `0x200`.
2. Timing parameters — potwierdzenie (odpowiedź `A0`).
3. Żądanie KWP2000 — odczyt DTC (`0x18`).
4. Odczyt DTC i zamknięcie sesji (`A4`).

### D. Auto-skan

**`perform_full_scan()`** — sekwencyjne odpytywanie modułów; wyniki strumieniowane do przeglądarki.

## 4. Przepływ danych (przykład)

1. Web UI wysyła `CMD:REQ_FULL_SCAN`.
2. Python uruchamia `perform_full_scan`.
3. Python wysyła `TX:200…` do Arduino.
4. Arduino wypycha ramkę na CAN.
5. Odpowiedź wraca przez Arduino do Pythona.
6. Python aktualizuje UI.

## 5. Diagnostyka i logi (SYS/ERR)

Format komunikatów: [MESSAGES.md](../MESSAGES.md).

- `SYS:PY:BROWSER_CONNECTED` — nowe połączenie UI.
- `SYS:PY:SERIAL_READY` — połączenie z Arduino.
- `ERR:PY:SERIAL_LOST` — odłączenie Arduino.
- `SYS:PY:AUTO_SHUTDOWN` — zwolnienie portu COM.

---

**Uwaga:** skrypt pomija błędy dekodowania (`UnicodeDecodeError`) przy fizycznym podłączaniu lub odłączaniu USB w trakcie pracy.
