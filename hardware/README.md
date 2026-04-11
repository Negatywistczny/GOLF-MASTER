# Kod Arduino — VAG PQ35 Infotainment CAN — GOLF MASTER

## 1. Komunikacja CAN (NM OSEK)

Oprogramowanie realizuje **Network Management (NM)** grupy VAG, sterowane zdarzeniami z `0x42B` (`mNM_Gateway_I`).
Aktualny firmware (`hardware/hardware.ino`) używa dwóch warstw stanu:

- **NetState**: `NET_SLEEP`, `NET_ACTIVE`, `NET_GRACE`, `NET_SLEEP_READY`
- **AutoNmState**: `AUTO_ACTIVE`, `AUTO_SLEEP_PREP`, `AUTO_SILENT_LISTEN`

Wnioski i polityka walidacyjna dla tych stanów są utrzymywane w:
- `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`
- `logs/2026-04-11/NM_STATE_SITUATION_CATALOG.md`

- **Detekcja wake/sleep (logika):**
  - `SYS:CAN:WAKE_START` / `SYS:CAN:WAKE_END` są wyznaczane z przejść `wakeCombo` (bajty 2-4 w Alive `0x42B` do `0x0B`).
  - `SYS:CAN:SLEEP_IND` pojawia się na zboczu `SleepInd` (`0x10` w bajcie 1 `0x42B`).
- **Odpowiedź NM (`0x40B`):**
  - tylko gdy token jest adresowany do `0x0B`,
  - typ odpowiedzi zależy od `CmdRing`/`CmdAlive`/`CmdLimpHome`,
  - w fazach `AUTO_*` odpowiedź jest ograniczana zgodnie z polityką snu/recovery.
- **Pompa `0x661`:**
  - wysyłana tylko w `NET_ACTIVE` (nie po `WAKE_END`).
- **Watchdog `ERR:CAN:HANG`:**
  - oparty o brak ramek `0x42B -> 0x0B` przez >2 s,
  - zasady legalnego tłumienia alarmu są opisane w `NM_COMMUNICATION_VALIDATION.md`.

## 2. Konfiguracja sprzętowa

- **TJA1055T** — tryb ciągłej gotowości; piny `STB` i `EN` na stałe w stanie wysokim. Uśpienie transceivera wyłącznie programowo (brak nadawania). Monitorowany pin `TJA_ERR`.
- **MCP2515** — 100 kbps (Low-Speed VAG). Rejestr `0x0F` z bitem `0x08` włącza tryb **One-Shot** (brak nieskończonej retransmisji przy braku ACK).

## 3. Funkcje programu

### `setup()`

Inicjalizacja Serial (115200), piny, TJA1055T, MCP2515. Komunikat `SYS:HW:READY` lub pętla z `ERR:HW:INIT_FAIL`.

### `processSerial()`

Obsługa poleceń `TX:ID:LEN:PAYLOAD` — dekodowanie HEX i wypchnięcie na CAN.

### `handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len)`

Ramka `0x42B`: dekoduje token, bity `Cmd*`/`Sleep*`, prowadzi przejścia `WAKE_*` i `SLEEP_IND`, aktualizuje stany Auto-NM oraz decyduje o odpowiedzi `0x40B` (w tym ścieżce recovery przy `CmdLimpHome` po `WAKE_END`).

### `checkHardwareErrors()`

- **MCP2515** — `checkError()`, kody `ERR:HW:MCP:0x…`; przy `0x1D` reset rejestrów `0x30`, `0x40`, `0x50`.
- **TJA1055T** — pin `TJA_ERR` LOW → `ERR:HW:TJA` z throttlingiem (~5 s).

### `isDiagFrame(uint32_t id)`

Filtr statyczny: zakresy `0x200–0x27F`, `0x300` (TP 2.0), `0x700–0x7FF` (UDS/KWP2000).

### `isDelta(uint32_t id, uint8_t len, uint8_t *data)`

Filtr dynamiczny — do 60 śledzonych ID; `true` przy pierwszym wystąpieniu lub zmianie bajtów payloadu.

### `loop()` — przepływ główny

Bez `delay`: `processSerial()`, odbiór CAN (przerwanie), `handleGatewayNm()`, sniffer (z pominięciem m.in. `0x531`, `0x661`, `0x40B`; **`0x42B` jest logowany**), `hangSuppressed` zależny od stanu NM, watchdog `ERR:CAN:HANG` (>2 s bez ramki `0x42B -> 0x0B` gdy alarm nie jest tłumiony), pompa `0x661` co 150 ms tylko w `NET_ACTIVE`, `checkHardwareErrors()` co 1000 ms.

### Pominięcia sniffera na Serialu

W `loop()` ramka jest wypisywana tylko wtedy, gdy jej ID **nie** jest na liście poniżej (warunek w kodzie przed `isDiagFrame` / `isDelta`). To **nie** wyłącza odbioru CAN — tylko logowanie na Serial.

| ID | Stała w kodzie | Powód pominięcia | Web UI |
|----|----------------|------------------|--------|
| `0x531` | `CAN_ID_SNIFFER_IGNORE_A` | Ramka komfortu **mLicht_1_alt** — bardzo częsta; bez filtra zalewałaby log. | Zarejestrowana i dekodowana (`LIA_*`), jeśli dane trafią z mostka / symulatora / innego źródła. |
| `0x661` | `CAN_ID_RADIO_STATUS` | **Pompa statusu radia** — co 150 ms w `NET_ACTIVE`; w logu byłoby głównie echo własnego TX. | Brak dedykowanego dekodera w `frameRegistry` (ramka pochodzi z firmware, nie z obserwacji magistrali). |
| `0x40B` | `NM_ARDUINO_ID` | **Odpowiedź NM węzła Arduino** (Ring / Alive) — własna ramka wysyłana przez `handleGatewayNm`; pominięcie utrzymuje czytelność sniffera. | Brak wpisu w `frameRegistry` (logika NM jest po stronie `0x42B` — **mNM_Gateway**). |

**`0x42B` (Gateway)** — **nie** jest na liście pominięć: ramki trafiają na Serial (przy zmianie payloadu / diag), żeby **dashboard / aplikacja web** mogły pokazywać **mNM_Gateway**. Dodatkowo przy krawędzi `wakeCombo` wypisywane są **`SYS:CAN:WAKE_START`** / **`SYS:CAN:WAKE_END`** oraz przy uśpieniu **`SYS:CAN:SLEEP_IND`**.

W szkicach testowych (`hardware/test/…`) bywają osobne formaty logu `0x42B` (np. Faza 4 — rozbudowany tekst); **Faza 4 po poprawce** trzyma okno aktywności tak jak produkcja (`lastAliveB2` tylko z Alive, nie z Ring). Firmware produkcyjny używa standardowego formatu `0x[ID]: …` jak dla innych ramek.

## 4. Powiązane dokumenty (aktualne)

- Walidacja i reguły decyzyjne: `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`
- Katalog sytuacji i wzorców ramek: `logs/2026-04-11/NM_STATE_SITUATION_CATALOG.md`
- Brief badawczy dla LLM: `GEMINI_PRO_DEEP_RESEARCH_BRIEF.md`

## 5. Format wyjścia (Serial)

- **Ramki:** `0x[ID_HEX]: [B1] [B2] …`
- **System:** `SYS:HW:READY`, `SYS:CAN:SLEEP_IND`, `SYS:CAN:WAKE_START`, `SYS:CAN:WAKE_END` (krawędzie `wakeCombo`; ramka `0x42B` i tak pojawia się w strumieniu sniffera, gdy payload się zmienia)
- **Błędy:** `ERR:HW:INIT_FAIL`, `ERR:CAN:HANG`, `ERR:HW:TJA`, `ERR:HW:0x[KOD]`
