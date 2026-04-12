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
- `GOLF_TP_SETUP_TIMEOUT_S` (domyślnie `2.5`)
- `GOLF_TP_TIMING_TIMEOUT_S` (domyślnie `8.0`)
- `GOLF_TP_RESPONSE_WINDOW_S` (domyślnie `1.6`)
- `GOLF_TP_IDLE_GAP_S` (domyślnie `0.35`)
- `GOLF_DTC_INTER_MODULE_GAP_S` (domyślnie `0.25`) — pauza sekundy między modułami w auto-skanie DTC
- `GOLF_DTC_KD557_FILTER` (domyślnie `1`) — gdy `1`, skan DTC obejmuje tylko moduły z ustawionym bitem błędu w ostatniej ramce **0x557** (mKD_Error), wg mapy jak `web/js/can/decoders/system.js` (`decodeKDErrorData`). Gdy brak ramki 0x557, brak bitów lub brak przecięcia z listą — **pełna** lista modułów. Ustaw `0`, aby zawsze skanować wszystkie moduły.

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

- status per moduł (`ok`, `no_dtc`, `no_data`, `comm_error`):
  - `ok` — zdekodowano co najmniej jeden kod DTC,
  - `no_dtc` — sesja TP2.0 OK, ECU zwróciło dane (ramki/payloady), ale lista kodów jest pusta,
  - `no_data` — sesja TP2.0 OK, lecz nie złapano treści odpowiedzi na żądanie Read DTC (nie mylić z „brakiem usterek”),
  - `comm_error` — niepowodzenie sesji (timeouty itd.),
- negocjowany kanał TP2.0 (`txChannel` / `txChannelHex`; przy `comm_error` wartości są `null`),
- licznik i listę DTC,
- surowe payloady i ramki (debug),
- kody błędów komunikacji (przy nieudanych próbach protokołu).

## 4. Kontrakt WebSocket (DTC)

Poza klasycznymi liniami `SYS:/ERR:/0x...`, bridge wysyła strukturalne eventy JSON:

```json
{
  "type": "dtc_scan",
  "event": "start|progress|module_result|complete|error",
  "payload": {}
}
```

To pozwala UI pokazać raport per moduł bez ręcznego parsowania terminala. Szczegóły sesji (krok [1/4] itd.) nie są duplikowane w strumieniu tekstowym — wystarczą eventy JSON i tabela wyników.

## 5. Ograniczenia i interpretacja

- `stored`/`historyczne` DTC != aktywna usterka.
- Brak odpowiedzi modułu != brak błędów (może oznaczać problem sesji/routingu/busa).
- Status bitów DTC musi być interpretowany razem z kontekstem (zapłon, silnik, warunki testu).
- Odczyt CAN snapshot nie zastępuje pełnego odczytu DTC z freeze frame.

## 6. Regresja

Checklistę testów (symulator + auto) znajdziesz w:

- [DTC_REGRESSION_CHECKLIST.md](DTC/DTC_REGRESSION_CHECKLIST.md)
