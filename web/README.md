# DOKUMENTACJA SMART UI (WEB) - GOLF MASTER

## 1. Rola modulu
Folder `web` zawiera frontend typu SPA (Vanilla JS + WebSocket) do wizualizacji ramek CAN, diagnostyki i eksportu danych.

## 2. Architektura ES Modules
Frontend jest podzielony na moduly ES6 (bez bundlera):

- `index.html` - punkt startowy UI, laduje `main.js` przez `type="module"`.
- `main.js` - bootstrap aplikacji (inicjalizacja UI, podpiecie przyciskow, start WebSocket).
- `config.js` - stale konfiguracyjne (`WS_URL`) i slownik `canDictionary`.
- `state.js` - wspoldzielony stan runtime (`signalMeta`, cache ramek, socket, bufor terminala).
- `utils.js` - funkcje narzedziowe (`extractCANSignal`, cache BigInt, formatowanie wartosci).
- `ws.js` - warstwa transportu WebSocket (`connectWebSocket`, parser wejscia SYS/ERR/CAN).
- `ui.js` - logika DOM (kafelki, modal, status, terminal, snapshot, logi).
- `decoders/*.js` - dekodery ramek CAN podzielone strefowo:
  - `drive.js`
  - `comfort.js`
  - `media.js`
  - `system.js`
- `decoders/router.js` - mapa `ID CAN -> funkcja decode...Data`.

## 3. Kluczowe mechanizmy runtime

- `extractCANSignal()` obsluguje Intel/Little-Endian i liczby ze znakiem.
- Konwersja `hex -> BigInt` jest cache'owana per ramka (jedno parsowanie na ramke).
- Kafelki cache'uja selektory (`.val`, `.grid`) dla mniejszej liczby zapytan DOM.
- Aktualizacja `innerHTML` kart dziala w trybie "render only on change".
- Terminal live ma ring buffer ograniczony do `300` ostatnich wpisow.

## 4. Uruchomienie lokalne

1. Uruchom warstwe bridge (`bridge/bridge.py`) i upewnij sie, ze nasluchuje na `ws://localhost:8765`.
2. Uruchom frontend przez lokalny serwer HTTP (zalecane; unikasz ograniczen `file://`):
   - przyklad: `python -m http.server 5500` w katalogu projektu,
   - nastepnie otworz `http://localhost:5500/web/`.
3. Sprawdz pasek statusu LIVE - po polaczeniu powinien zmienic kolor na zielony.

## 5. Smoke-Test checklist (lokalnie, przed testami w aucie)

### A. Ladowanie modulow
- Otworz DevTools -> Console.
- Odswiez strone (`Ctrl+F5`).
- Oczekiwany wynik: brak bledow typu `Failed to load module script`, `CORS`, `Cannot use import statement...`.

### B. Polaczenie WebSocket
- W Console brak bledow `WebSocket`/`WS_ERROR`.
- W UI pojawia sie status polaczenia (`POŁĄCZONO Z PYTHONEM`).
- Po wylaczeniu bridge status przechodzi na blad i po chwili probuje reconnect (co ok. 3 s).

### C. Interakcje dashboardu
- Klik `🛠️ SKANUJ DTC`:
  - przycisk zmienia stan na skanowanie,
  - brak bledow referencji w Console.
- Klik `📸 SNAPSHOT`:
  - generuje plik CSV do pobrania.
- Klik `📝 ZAPISZ LOGI`:
  - generuje plik TXT z terminala live.
- Klik dowolny kafelek CAN:
  - otwiera sie modal ze szczegolami ramki.

### D. Kontrola regresji UI
- Klasy i ID pozostaja niezmienione (`.ind`, `.val`, `.m-id`, itd.).
- Widok kart i kolorystyka sa zgodne z poprzednia wersja.

## 6. Rozszerzanie dekoderow

Przy dodawaniu nowej ramki CAN:
1. Dodaj definicje w `config.js` (`canDictionary`).
2. Dodaj dekoder w odpowiednim `decoders/*.js`.
3. Podepnij funkcje w `decoders/router.js`.
