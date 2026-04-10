# Kod Arduino — VAG PQ35 Infotainment CAN — GOLF MASTER

## 1. Komunikacja CAN (NM OSEK)

Oprogramowanie realizuje **Network Management (NM)** grupy VAG. Analizowana jest ramka Gatewaya (`0x42B`). Zachowanie nadawania (`0x40B`, `0x661`) jest zsynchronizowane ze **szkicem Fazy 4** (`hardware/test/Faza_4_Hybryda`): **bit `0x80` w bajcie 2** ostatniej ramki **Alive** do węzła `0x0B` oznacza okno, w którym Gateway oczekuje aktywności węzła Infotainment — wtedy Arduino odpowiada w ringu i pompuje `0x661`. W logach z jazdy często występuje `0B 02 00 40 00 00` (bajt 2 = `0x00`, bity wybudzenia w wyższych polach) — wtedy **pompa i `0x40B` są wyłączone**, bo nie ma bitu `0x80` (OEM sam utrzymuje magistralę).

- **Bajt 2 z Alive (tylko `0x42B` → `0x0B`, typ wiadomości w dolnym nibble bajtu 1 = `0x02`)** — zapamiętywany jest **wyłącznie** z ramek Alive; ramki **Ring** (`0x01`) **nie nadpisują** bajtu 2, więc odpowiedź `0x40B` nadal działa między Alive a Ring w tym samym cyklu.
- **Wykrycie początku wybudzenia (log)** — z Alive odczytywane są bajty 2–4 jako `wakeCombo`. Przy przejściu z „brak przyczyn” na „jest przyczyna” wypisywane jest **`SYS:CAN:WAKE_START`** (tuż przed zwykłą linią sniffera z `0x42B`, jeśli ramka przechodzi filtr `isDelta` / diag). Przejście z powrotem na zero: **`SYS:CAN:WAKE_END`**. Ramki **`0x42B` nie są ukrywane** — trafiają do dashboardu / mostka tak jak pozostałe ID (z ograniczeniem co do powtarzalnych identycznych payloadów: `isDelta`).
- **Nadawanie** — `0x40B` i `0x661` tylko gdy **`lastWakeCauseByte & 0x80`** (ostatni Alive). Po zaniku bitu `0x80` Arduino **milczy na CAN** do następnego cyklu z tym bitem (np. kolejne wybudzenie komfortem).
- **Uśpienie i watchdog** — **SLEEP_INDICATION** (`0x10` w bajcie 1) jest sprawdzane przy Alive **niezależnie** od pełnej wartości bajtu 1 (`0x12` = Alive + Sleep): używany jest **`buf[1] & 0x0F`** jako typ wiadomości oraz **`buf[1] & 0x10`** jako sleep.

## 2. Konfiguracja sprzętowa

- **TJA1055T** — tryb ciągłej gotowości; piny `STB` i `EN` na stałe w stanie wysokim. Uśpienie transceivera wyłącznie programowo (brak nadawania). Monitorowany pin `TJA_ERR`.
- **MCP2515** — 100 kbps (Low-Speed VAG). Rejestr `0x0F` z bitem `0x08` włącza tryb **One-Shot** (brak nieskończonej retransmisji przy braku ACK).

## 3. Funkcje programu

### `setup()`

Inicjalizacja Serial (115200), piny, TJA1055T, MCP2515. Komunikat `SYS:HW:READY` lub pętla z `ERR:HW:INIT_FAIL`.

### `processSerial()`

Obsługa poleceń `TX:ID:LEN:PAYLOAD` — dekodowanie HEX i wypchnięcie na CAN.

### `handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len)`

Ramka `0x42B`: przy Alive — `lastWakeCauseByte`, krawędzie `wakeCombo` → `SYS:CAN:WAKE_*`, `SLEEP_IND`; przy aktywnym bicie `0x80` w ostatnim Alive — odpowiedź `0x40B` na Alive/Ring.

### `checkHardwareErrors()`

- **MCP2515** — `checkError()`, kody `ERR:HW:MCP:0x…`; przy `0x1D` reset rejestrów `0x30`, `0x40`, `0x50`.
- **TJA1055T** — pin `TJA_ERR` LOW → `ERR:HW:TJA` z throttlingiem (~5 s).

### `isDiagFrame(uint32_t id)`

Filtr statyczny: zakresy `0x200–0x27F`, `0x300` (TP 2.0), `0x700–0x7FF` (UDS/KWP2000).

### `isDelta(uint32_t id, uint8_t len, uint8_t *data)`

Filtr dynamiczny — do 60 śledzonych ID; `true` przy pierwszym wystąpieniu lub zmianie bajtów payloadu.

### `loop()` — przepływ główny

Bez `delay`: `processSerial()`, odbiór CAN (przerwanie), `handleGatewayNm()`, sniffer (z pominięciem m.in. `0x531`, `0x661`, `0x40B`; **`0x42B` jest logowany**), watchdog `ERR:CAN:HANG` (>2 s bez ramki przy braku uśpienia), pompa `0x661` co 150 ms przy **`lastWakeCauseByte & 0x80`**, `checkHardwareErrors()` co 1000 ms.

### Pominięcia sniffera na Serialu

W `loop()` ramka jest wypisywana tylko wtedy, gdy jej ID **nie** jest na liście poniżej (warunek w kodzie przed `isDiagFrame` / `isDelta`). To **nie** wyłącza odbioru CAN — tylko logowanie na Serial.

| ID | Stała w kodzie | Powód pominięcia | Web UI |
|----|----------------|------------------|--------|
| `0x531` | `CAN_ID_SNIFFER_IGNORE_A` | Ramka komfortu **mLicht_1_alt** — bardzo częsta; bez filtra zalewałaby log. | Zarejestrowana i dekodowana (`LIA_*`), jeśli dane trafią z mostka / symulatora / innego źródła. |
| `0x661` | `CAN_ID_RADIO_STATUS` | **Podtrzymanie radia** — tę ramkę co 150 ms **nadaje to samo Arduino** przy aktywnej Weckursache; w logu byłoby tylko echo własnego TX. | Brak dedykowanego dekodera w `frameRegistry` (ramka pochodzi z firmware, nie z obserwacji magistrali). |
| `0x40B` | `NM_ARDUINO_ID` | **Odpowiedź NM węzła Arduino** (Ring / Alive) — własna ramka wysyłana przez `handleGatewayNm`; pominięcie utrzymuje czytelność sniffera. | Brak wpisu w `frameRegistry` (logika NM jest po stronie `0x42B` — **mNM_Gateway**). |

**`0x42B` (Gateway)** — **nie** jest na liście pominięć: ramki trafiają na Serial (przy zmianie payloadu / diag), żeby **dashboard / aplikacja web** mogły pokazywać **mNM_Gateway**. Dodatkowo przy krawędzi `wakeCombo` wypisywane są **`SYS:CAN:WAKE_START`** / **`SYS:CAN:WAKE_END`** oraz przy uśpieniu **`SYS:CAN:SLEEP_IND`**.

W szkicach testowych (`hardware/test/…`) bywają osobne formaty logu `0x42B` (np. Faza 4 — rozbudowany tekst); firmware produkcyjny używa standardowego formatu `0x[ID]: …` jak dla innych ramek.

## 4. Format wyjścia (Serial)

- **Ramki:** `0x[ID_HEX]: [B1] [B2] …`
- **System:** `SYS:HW:READY`, `SYS:CAN:SLEEP_IND`, `SYS:CAN:WAKE_START`, `SYS:CAN:WAKE_END` (krawędzie `wakeCombo`; ramka `0x42B` i tak pojawia się w strumieniu sniffera, gdy payload się zmienia)
- **Błędy:** `ERR:HW:INIT_FAIL`, `ERR:CAN:HANG`, `ERR:HW:TJA`, `ERR:HW:0x[KOD]`
