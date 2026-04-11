# Mostek Python (bridge) — GOLF MASTER

## 1. Rola w systemie

`bridge.py` jest pośrednikiem między Arduino a Web UI. Oprócz strumieniowania ramek CAN realizuje pełny auto-skan DTC przez TP2.0 z obsługą dwóch warstw aplikacyjnych:

- KWP (`0x18` ReadDTCByStatus),
- UDS (`0x19` ReadDTCInformation, sub-function `0x02`).

## 2. Wymagania i konfiguracja

Środowisko: Python 3.8+.

Instalacja:

```bash
pip install -r requirements.txt
```

Konfiguracja przez zmienne środowiskowe:

- `GOLF_SERIAL_PORT` (domyślnie `COM7`)
- `GOLF_BAUD_RATE` (domyślnie `115200`)
- `GOLF_WS_HOST` (domyślnie `localhost`)
- `GOLF_WS_PORT` (domyślnie `8765`)
- `GOLF_TP_SETUP_TIMEOUT_S` (domyślnie `1.5`)
- `GOLF_TP_TIMING_TIMEOUT_S` (domyślnie `1.0`)
- `GOLF_TP_RESPONSE_WINDOW_S` (domyślnie `1.6`)
- `GOLF_TP_IDLE_GAP_S` (domyślnie `0.35`)

## 3. Silnik DTC (stan bieżący)

### A. Sesja transportowa TP2.0

Każdy moduł przechodzi przez:

1. setup kanału (`0x200`, `C0`),
2. oczekiwanie na `D0` i negocjowany kanał TX,
3. handshake timing (`A8` -> `A0`),
4. żądanie DTC (KWP lub UDS),
5. odbiór i składanie odpowiedzi (w tym multi-frame fallback),
6. zamknięcie sesji (`A4`).

### B. Fallback protokołu

Dla modułu można skonfigurować kolejność protokołów (np. `UDS -> KWP` lub `KWP -> UDS`). Jeśli pierwszy wariant nie odpowie, bridge próbuje kolejny.

### C. Wynik skanu

Bridge zwraca:

- status per moduł (`ok`, `clean`, `comm_error`),
- licznik i listę DTC,
- surowe payloady i ramki (debug),
- kody błędów komunikacji.

## 4. Kontrakt WebSocket (DTC)

Poza klasycznymi liniami `SYS:/ERR:/0x...`, bridge wysyła strukturalne eventy JSON:

```json
{
  "type": "dtc_scan",
  "event": "start|progress|module_result|complete|error",
  "payload": {}
}
```

To pozwala UI pokazać raport per moduł bez ręcznego parsowania terminala.

## 5. Ograniczenia i interpretacja

- `stored`/`historyczne` DTC != aktywna usterka.
- Brak odpowiedzi modułu != brak błędów (może oznaczać problem sesji/routingu/busa).
- Status bitów DTC musi być interpretowany razem z kontekstem (zapłon, silnik, warunki testu).
- Odczyt CAN snapshot nie zastępuje pełnego odczytu DTC z freeze frame.

## 6. Regresja

Checklistę testów (symulator + auto) znajdziesz w:

- [DTC_REGRESSION_CHECKLIST.md](DTC_REGRESSION_CHECKLIST.md)
