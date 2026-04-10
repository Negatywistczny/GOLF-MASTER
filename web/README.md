# Dokumentacja Smart UI (Web) — GOLF MASTER

## 1. Rola modułu
Folder `web` zawiera frontend typu SPA (Vanilla JS + WebSocket) do wizualizacji ramek CAN, diagnostyki i eksportu danych.

## 2. Architektura kodu (moduły z bundlowaniem offline)
Frontend jest rozwijany modularnie (ES6), a do uruchamiania lokalnego bez serwera używany jest wygenerowany bundle:

- `index.html` — punkt startowy UI, ładuje `script.bundle.js` (działa z `file://`).
- `style.css` — wygląd (layout, kolory, komponenty, modal).
- `js/app/main.js` — punkt wejścia bundlera (importuje `js/app/bootstrap.js`).
- `js/app/bootstrap.js` — inicjalizacja UI po `DOMContentLoaded`, podpięcie przycisków, start WebSocket.
- `js/app/transport/ws.js` — warstwa transportu WebSocket (`connectWebSocket`, parser SYS/ERR/CAN, stała `WS_URL`).
- `js/ui/index.js` — fasada publicznego API UI (re-export modułów z `js/ui/*.js`).
- `js/state/` — metadane i stan: `signalMeta.js`, `runtimeState.js`, barrel `index.js` (preferowany jeden import zamiast osobnych ścieżek do obu plików; szczegóły w sekcji 2.1).
- `js/shared/canUtils.js` — funkcje narzędziowe CAN (`extractCANSignal`, cache BigInt, formatowanie wartości).
- `js/ui/core.js` — rdzeń dashboardu (obsługa ramek, tworzenie kafelków, routing dekoderów).
- `js/ui/modal.js` — logika okna szczegółów ramki.
- `js/ui/statusLogs.js` — status LIVE, logowanie błędów i terminal.
- `js/ui/actions.js` — akcje użytkownika (snapshot, pełny skan DTC, eksport logów).
- `js/ui/modalColors/modalColorRules.js` — kolory wartości w modalu: override ramki, opcjonalne `stateTags` w meta sygnału, heurystyka po `displayVal`.
- `js/ui/modalColors/modalColorOverrides.js` — jawne wyjątki per `ramka → sygnał → wartość`.
- `js/can/frameRegistry.js` — centralny rejestr ramek (`ID CAN → name/zone/decoder`) oraz mapy `canDictionary` i `decoderRouter`.
- `js/can/decoders/*.js` — dekodery ramek CAN podzielone strefowo:
  - `drive.js`
  - `comfort.js`
  - `media.js`
  - `system.js`
- `bundle_tool.py` — narzędzie CLI: `build` (generuje `script.bundle.js`), `check` (szybki test po czasie modyfikacji plików — patrz poniżej).

### Reguła bundla (hybryda)

- **`script.bundle.js` jest w repozytorium** — dzięki temu UI działa od razu (`file://`, skrypty `START.*`) bez Node i bez obowiązkowego kroku budowy u każdego.
- **Po zmianach w `web/js/**/*.js`** zawsze przebuduj bundle i commituj go razem ze źródłami:
  ```bash
  python3 web/bundle_tool.py build
  ```
- **Lokalnie przed pushem** możesz szybko sprawdzić, czy bundle nie jest „na oparach” względem plików JS (heurystyka po dacie modyfikacji):
  ```bash
  python3 web/bundle_tool.py check
  ```
- **Na GitHubie** workflow uruchamia `build` i `git diff` na `script.bundle.js` — jeśli wygenerowany plik różni się od tego w commicie, job się wyłoży (wymusza zsynchronizowany bundle mimo że po `git checkout` same daty plików nie zawsze by wystarczyły).

### 2.1. Układ katalogu `js/`

- `app/` — wejście (`main.js`), bootstrap DOM, transport WebSocket (`transport/ws.js`).
- `ui/` — dashboard (`core`, `statusLogs`, `actions`, `modal`), `index.js` jako API, `modalColors/` — kolory wartości w modalu.
- `state/` — `signalMeta.js` (dane), `runtimeState.js` (cache ramek, socket, terminal, BigInt), `index.js` (re-export obu; w nowym kodzie importuj stąd).
- `can/` — `frameRegistry.js`, `decoders/` (dekodery per strefa: `drive`, `comfort`, `media`, `system`).
- `shared/` — `canUtils.js` (parsowanie sygnałów, formatowanie).

## 3. Kluczowe mechanizmy runtime

- `extractCANSignal()` obsługuje Intel/Little-Endian i liczby ze znakiem.
- Konwersja `hex → BigInt` jest cache’owana na ramkę (jedno parsowanie na ramkę).
- Kafelki cachują selektory (`.val`, `.grid`) przy mniejszej liczbie zapytań do DOM.
- Aktualizacja `innerHTML` kart działa w trybie „render only on change”.
- Terminal na żywo ma bufor pierścieniowy ograniczony do `300` ostatnich wpisów.

## 4. Uruchomienie lokalne (bez serwera HTTP)

1. Uruchom warstwę bridge (`bridge/bridge.py` lub `bridge/test_simulation.py`) i upewnij się, że nasłuchuje na `ws://localhost:8765`.
2. Otwórz `web/index.html` bezpośrednio (double-click, adres `file://...`).
3. Sprawdź pasek statusu LIVE — po połączeniu powinien zmienić kolor na zielony.
4. Po zmianach w modułach `web/js/**/*.js` przebuduj bundle:
   - `python3 web/bundle_tool.py build`
   - Opcjonalnie: `python3 web/bundle_tool.py check` (kod wyjścia `1` = trzeba przebudować).

## 5. Smoke-test (lokalnie, przed testami w aucie)

### A. Ładowanie modułów
- Otwórz DevTools → Console.
- Odśwież stronę (`Ctrl+F5`).
- Oczekiwany wynik: brak błędów typu `Failed to load module script`, `CORS`, `Cannot use import statement...`.

### B. Połączenie WebSocket
- W konsoli brak błędów `WebSocket` / `WS_ERROR`.
- W UI pojawia się status połączenia (`POŁĄCZONO Z PYTHONEM`).
- Po wyłączeniu bridge status przechodzi na błąd i po chwili następuje ponowne połączenie (ok. 3 s).

### C. Interakcje dashboardu
- Klik `🛠️ SKANUJ DTC`:
  - przycisk zmienia stan na skanowanie,
  - brak błędów referencji w konsoli.
- Klik `📸 SNAPSHOT`:
  - generuje plik CSV do pobrania.
- Klik `📝 ZAPISZ LOGI`:
  - generuje plik TXT z terminala na żywo.
- Klik dowolny kafelek CAN:
  - otwiera się modal ze szczegółami ramki.

### D. Kontrola regresji UI
- Klasy i ID pozostają niezmienione (`.ind`, `.val`, `.m-id` itd.).
- Widok kart i kolorystyka są zgodne z poprzednią wersją.

## 6. Rozszerzanie dekoderów

Przy dodawaniu nowej ramki CAN:
1. Dodaj dekoder w odpowiednim `js/can/decoders/*.js`.
2. Dodaj wpis ramki do `js/can/frameRegistry.js` (`frameRegistry`).

## 7. Standard kolorów (UI)

Poniższy standard jest obowiązujący dla wszystkich dekoderów (`drive`, `comfort`, `media`, `system`).

- **Zielony (`active-green`)** — stan „OK”, potwierdzone zezwolenie, system sprawny.
  - Przykłady: `SYSTEM AIRBAG OK`, `SKANOWANIE OK - BRAK BLEDOW`, `ROZRUCH: ZEZWOLONO`.

- **Niebieski (`active-blue` / `active`)** — informacja i telemetria (stan roboczy bez alarmu, wartości pomiarowe).
  - Przykłady: `PREDKOSC`, `OBROTY`, `KAT SKRETU`, `JEDNOSTKI`, `ODO`, `DATA/CZAS`, `WAKE-UP`.

- **Pomarańczowy (`active-orange`)** — ostrzeżenie, stan przejściowy lub aktywna akcja operatora.
  - Przykłady: `ABS AKTYWNY`, `ESP INTERWENIUJE`, `KIERUNKOWSKAZ`, `SWIATLO STOP WLACZONE`, `TRYB TRANSPORTOWY`.

- **Czerwony (`active-error` / `active-red`)** — błąd krytyczny, alarm lub awaria.
  - Przykłady: `CRASH DETECTED`, `LIMP HOME`, `BRAK LADOWANIA`, `BLEDY DTC`, `BLEDY CZUJNIKOW`.

- **Szary (brak klasy `active-*`)** — neutralne OFF/idle/brak akcji/oczekiwanie na dane oraz informacje stałe (konfiguracja/kodowanie).
  - Przykłady: `PILOT: BRAK AKCJI`, `KIERUNKI WYL.`, `KLIMATYZACJA: WYL`, `HAMULEC ZWOLNIONY`, `ZAKODOWANO: ...`.

### 7.1 Obramowanie kafelka (globalna reguła CSS)

Kolor obramowania nie jest już ustawiany inline w dekoderach.
Wylicza go CSS na podstawie klas `.ind` w kafelku, z priorytetem:

`ERROR > WARNING > INFO > OK > IDLE`

- `active-error` / `active-red` → `--red`
- `active-orange` → `--orange`
- `active-blue` / `active` / `active-lock` → `--accent`
- `active-green` → `--green`
- brak `active-*` → `--border`

### 7.2 Zasady praktyczne dla nowych stanów

1. Najpierw określ semantykę stanu: `OK` / `INFO` / `WARNING` / `ERROR` / `IDLE`.
2. Dopiero potem wybierz klasę koloru zgodnie ze standardem powyżej.
3. Dla „IDLE/OFF” preferuj szary (`ind` bez `active-*`).
4. Miganie (`blink`, `blink-fast`) stosuj tylko dla stanów wymagających uwagi.

## 8. Kolory w modalu (source of truth)

Kolorowanie wartości w tabeli modala (`.m-value`) działa warstwowo:

1. **Opcjonalny wyjątek per ramka/sygnał** (`js/ui/modalColors/modalColorOverrides.js` → `FRAME_SIGNAL_COLOR_OVERRIDES`; może być pusty).
2. **`stateTags`** przy sygnale w `signalMeta` (jak `states`, ale wartości to tagi: `missing` / `idle` / `info` / `enabled` / `warning` / `error`).
3. **Heurystyka po sformatowanym tekście** (`displayVal`).

Kolejność warstw jest zaimplementowana w `js/ui/modalColors/modalColorRules.js` (`getResolvedModalValueClass`); `js/ui/modal.js` przekazuje `meta` ze `signalMeta` i wywołuje ten helper przy renderze wierszy tabeli.

Zasada utrzymaniowa:
- etykiety stanów w `states`; jawny kolor per wartość w `stateTags`; override ramki tylko gdy semantyka zależy od kontekstu ramki.
- każdy klucz w `states` musi mieć odpowiadający wpis w `stateTags` — sprawdza to `python3 web/check_signal_meta_state_tags.py` (również w jobie „Web bundle” w CI).

Mapowanie tagów → klasy CSS (`.m-value--*`):
- `missing` / `idle` — szary (`--text-dim`): brak danych, OFF, nieaktywny, standby.
- `info` — niebieski (`--accent`): informacje i telemetria bez alarmu.
- `enabled` — zielony (`--green`): włączony / aktywny.
- `warning` — pomarańczowy (`--orange`): ostrzeżenie / uwaga.
- `error` — czerwony (`--red`): błąd / awaria.

ID ramki w override jest normalizowane do postaci `0x...` (np. `151` → `0x151`).
