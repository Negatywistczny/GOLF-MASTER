# Kod Arduino — VAG PQ35 Infotainment CAN — GOLF MASTER

## 1. Komunikacja CAN (NM OSEK)

Oprogramowanie realizuje **Network Management (NM)** grupy VAG. Analizowana jest ramka Gatewaya (`0x42B`); stosowana jest **logika zero-jedynkowa**: pełna aktywność NM i podtrzymanie radia włączają się tylko wtedy, gdy Gateway w ramce **Alive** (bajt kontrolny `0x02`) raportuje **niezerową przyczynę wybudzenia** w **bajcie 2** (*Weckursache* — m.in. CAN, Wake, Timer jako maska bitowa).

- **Weckursache (bajt 2 ramki `0x42B`, tylko Alive)** — wartość zapamiętywana wyłącznie z ramek typu Alive (`rxBuf[1] == 0x02`). Puste payloady z ramek Ring nie zerują stanu i nie powodują migotania `0x40B` ani pompy `0x661`.
- **Tryb zero-jedynkowy** — odpowiedź w ringu (`0x40B`) oraz ramka podtrzymania radia (`0x661`, co 150 ms) działają **tylko** przy `lastWakeCauseByte != 0x00`. Gdy przyczyny wygasną (`bajt 2 == 0`), Arduino przestaje nadawać (celowe milczenie, uśpienie magistrali).
- **Ring** — na zapytanie Gatewaya (bajt 0 = `0x0B`), przy `lastWakeCauseByte != 0x00`, węzeł `0x0B` odpowiada `0x40B` (Ring `0x02`, ewentualnie Alive `0x01` przy bicie Limp Home w bajcie 1).
- **Uśpienie i watchdog** — flaga **SLEEP_INDICATION** (`0x10` w bajcie 1 ramki Gatewaya) przy ramkach **Alive** do węzła `0x0B` steruje `isSleepIndicated`, aby watchdog (`ERR:CAN:HANG`) nie raportował błędu podczas procedury uśpienia.

## 2. Konfiguracja sprzętowa

- **TJA1055T** — tryb ciągłej gotowości; piny `STB` i `EN` na stałe w stanie wysokim. Uśpienie transceivera wyłącznie programowo (brak nadawania). Monitorowany pin `TJA_ERR`.
- **MCP2515** — 100 kbps (Low-Speed VAG). Rejestr `0x0F` z bitem `0x08` włącza tryb **One-Shot** (brak nieskończonej retransmisji przy braku ACK).

## 3. Funkcje programu

### `setup()`

Inicjalizacja Serial (115200), piny, TJA1055T, MCP2515. Komunikat `SYS:HW:READY` lub pętla z `ERR:HW:INIT_FAIL`.

### `processSerial()`

Obsługa poleceń `TX:ID:LEN:PAYLOAD` — dekodowanie HEX i wypchnięcie na CAN.

### `handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len)`

Ramka `0x42B`: `lastWakeCauseByte` (tylko przy Alive), `SLEEP_IND`, warunkowe `0x40B` w ringu.

### `checkHardwareErrors()`

- **MCP2515** — `checkError()`, kody `ERR:HW:MCP:0x…`; przy `0x1D` reset rejestrów `0x30`, `0x40`, `0x50`.
- **TJA1055T** — pin `TJA_ERR` LOW → `ERR:HW:TJA` z throttlingiem (~5 s).

### `isDiagFrame(uint32_t id)`

Filtr statyczny: zakresy `0x200–0x27F`, `0x300` (TP 2.0), `0x700–0x7FF` (UDS/KWP2000).

### `isDelta(uint32_t id, uint8_t len, uint8_t *data)`

Filtr dynamiczny — do 60 śledzonych ID; `true` przy pierwszym wystąpieniu lub zmianie bajtów payloadu.

### `loop()` — przepływ główny

Bez `delay`: `processSerial()`, odbiór CAN (przerwanie), `handleGatewayNm()`, sniffer (z pominięciem m.in. `0x531`, `0x661`, `0x40B`), watchdog `ERR:CAN:HANG` (>2 s bez ramki przy braku uśpienia), pompa `0x661` co 150 ms przy aktywnej Weckursache, `checkHardwareErrors()` co 1000 ms.

### Pominięcia sniffera na Serialu

W `loop()` ramka jest wypisywana tylko wtedy, gdy jej ID **nie** jest na liście poniżej (warunek w kodzie przed `isDiagFrame` / `isDelta`). To **nie** wyłącza odbioru CAN — tylko logowanie na Serial.

| ID | Stała w kodzie | Powód pominięcia | Web UI |
|----|----------------|------------------|--------|
| `0x531` | `CAN_ID_SNIFFER_IGNORE_A` | Ramka komfortu **mLicht_1_alt** — bardzo częsta; bez filtra zalewałaby log. | Zarejestrowana i dekodowana (`LIA_*`), jeśli dane trafią z mostka / symulatora / innego źródła. |
| `0x661` | `CAN_ID_RADIO_STATUS` | **Podtrzymanie radia** — tę ramkę co 150 ms **nadaje to samo Arduino** przy aktywnej Weckursache; w logu byłoby tylko echo własnego TX. | Brak dedykowanego dekodera w `frameRegistry` (ramka pochodzi z firmware, nie z obserwacji magistrali). |
| `0x40B` | `NM_ARDUINO_ID` | **Odpowiedź NM węzła Arduino** (Ring / Alive) — własna ramka wysyłana przez `handleGatewayNm`; pominięcie utrzymuje czytelność sniffera. | Brak wpisu w `frameRegistry` (logika NM jest po stronie `0x42B` — **mNM_Gateway**). |

W szkicach testowych (`hardware/test/…`) mogą być dodatkowe wykluczenia (np. `0x42B` w Fazie 4) — tam cel jest ten sam: ograniczyć szum w logach do potrzeb danego eksperymentu.

## 4. Format wyjścia (Serial)

- **Ramki:** `0x[ID_HEX]: [B1] [B2] …`
- **System:** `SYS:HW:READY`, `SYS:CAN:SLEEP_IND`
- **Błędy:** `ERR:HW:INIT_FAIL`, `ERR:CAN:HANG`, `ERR:HW:TJA`, `ERR:HW:0x[KOD]`
