# DOKUMENTACJA SMART UI (WEB) - GOLF MASTER

## 1. Rola modulu
Folder `web` zawiera frontend typu SPA (Vanilla JS + WebSocket) do wizualizacji ramek CAN, diagnostyki i eksportu danych.

## 2. Architektura kodu (moduly z bundlowaniem offline)
Frontend jest rozwijany modularnie (ES6), a do uruchamiania lokalnego bez serwera uzywany jest wygenerowany bundle:

- `index.html` - punkt startowy UI, laduje gotowy plik `script.bundle.js` (dziala z `file://`).
- `js/main.js` - bootstrap aplikacji (inicjalizacja UI, podpiecie przyciskow, start WebSocket).
- `js/config.js` - stale konfiguracyjne (`WS_URL`).
- `js/state.js` - wspoldzielony stan runtime (`signalMeta`, cache ramek, socket, bufor terminala).
- `js/utils.js` - funkcje narzedziowe (`extractCANSignal`, cache BigInt, formatowanie wartosci).
- `js/ws.js` - warstwa transportu WebSocket (`connectWebSocket`, parser wejscia SYS/ERR/CAN).
- `js/ui.js` - logika DOM (kafelki, modal, status, terminal, snapshot, logi).
- `js/decoders/*.js` - dekodery ramek CAN podzielone strefowo:
  - `drive.js`
  - `comfort.js`
  - `media.js`
  - `system.js`
- `js/decoders/router.js` - centralny rejestr ramek (`ID CAN -> name/zone/decoder`) oraz mapy kompatybilnosci: `canDictionary` i `decoderRouter`.
- `build_offline_bundle.py` - prosty bundler Python, scala modulowy kod do `script.bundle.js`.

## 3. Kluczowe mechanizmy runtime

- `extractCANSignal()` obsluguje Intel/Little-Endian i liczby ze znakiem.
- Konwersja `hex -> BigInt` jest cache'owana per ramka (jedno parsowanie na ramke).
- Kafelki cache'uja selektory (`.val`, `.grid`) dla mniejszej liczby zapytan DOM.
- Aktualizacja `innerHTML` kart dziala w trybie "render only on change".
- Terminal live ma ring buffer ograniczony do `300` ostatnich wpisow.

## 4. Uruchomienie lokalne (bez serwera HTTP)

1. Uruchom warstwe bridge (`bridge/bridge.py` lub `bridge/test_simulation.py`) i upewnij sie, ze nasluchuje na `ws://localhost:8765`.
2. Otworz `web/index.html` bezposrednio (double-click, adres `file://...`).
3. Sprawdz pasek statusu LIVE - po polaczeniu powinien zmienic kolor na zielony.
4. Po zmianach w plikach `web/js/*.js` przebuduj bundle:
   - `python3 web/build_offline_bundle.py`

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
1. Dodaj dekoder w odpowiednim `js/decoders/*.js`.
2. Dodaj wpis ramki do `js/decoders/router.js` (`frameRegistry`).

## 7. Standard kolorow (UI)

Ponizszy standard jest obowiazujacy dla wszystkich dekoderow (`drive`, `comfort`, `media`, `system`).

- **Zielony (`active-green`)** - stan "OK", potwierdzone zezwolenie, system sprawny.
  - Przyklady: `SYSTEM AIRBAG OK`, `SKANOWANIE OK - BRAK BLEDOW`, `ROZRUCH: ZEZWOLONO`.

- **Niebieski (`active-blue` / `active`)** - informacja i telemetria (stan roboczy bez alarmu, wartosci pomiarowe).
  - Przyklady: `PREDKOSC`, `OBROTY`, `KAT SKRETU`, `JEDNOSTKI`, `ODO`, `DATA/CZAS`, `WAKE-UP`.

- **Pomaranczowy (`active-orange`)** - ostrzezenie, stan przejsciowy lub aktywna akcja operatora.
  - Przyklady: `ABS AKTYWNY`, `ESP INTERWENIUJE`, `KIERUNKOWSKAZ`, `SWIATLO STOP WLACZONE`, `TRYB TRANSPORTOWY`.

- **Czerwony (`active-error` / `active-red`)** - blad krytyczny, alarm lub awaria.
  - Przyklady: `CRASH DETECTED`, `LIMP HOME`, `BRAK LADOWANIA`, `BLEDY DTC`, `BLEDY CZUJNIKOW`.

- **Szary (brak klasy `active-*`)** - neutralne OFF/idle/brak akcji/oczekiwanie na dane oraz informacje permanentne (konfiguracja/kodowanie).
  - Przyklady: `PILOT: BRAK AKCJI`, `KIERUNKI WYL.`, `KLIMATYZACJA: WYL`, `HAMULEC ZWOLNIONY`, `ZAKODOWANO: ...`.

### 7.1 Obramowanie kafelka (globalna reguła CSS)

Kolor obramowania nie jest juz ustawiany inline w dekoderach.
Wylicza go CSS na podstawie klas `.ind` w kafelku, z priorytetem:

`ERROR > WARNING > INFO > OK > IDLE`

- `active-error` / `active-red` -> `--red`
- `active-orange` -> `--orange`
- `active-blue` / `active` / `active-lock` -> `--accent`
- `active-green` -> `--green`
- brak `active-*` -> `--border`

### 7.2 Zasady praktyczne dla nowych stanow

1. Najpierw okresl semantyke stanu: `OK` / `INFO` / `WARNING` / `ERROR` / `IDLE`.
2. Dopiero potem wybierz klase koloru zgodnie ze standardem powyzej.
3. Dla "IDLE/OFF" preferuj szary (`ind` bez `active-*`).
4. Miganie (`blink`, `blink-fast`) stosuj tylko dla stanów wymagajacych uwagi.
