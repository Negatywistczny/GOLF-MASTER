# Firmware sprzętowy — VAG PQ35 Infotainment CAN — GOLF MASTER

Warstwa hardware składa się z **dwóch lustrzanych szkiców** w tym katalogu:

| Plik | Platforma | Status | Transport do bridge / UI |
|------|-----------|--------|---------------------------|
| [`arduino.ino`](arduino.ino) | Arduino (MCP2515 + TJA1055) | **Produkcja** — pełna logika CAN/NM | USB Serial (`230400` baud) |
| [`esp32.ino`](esp32.ino) | ESP32 (docelowo ten sam MCP2515 + TJA1055) | **W rozwoju** — na razie WiFi, Bluetooth i OTA | USB Serial (`115200`), Bluetooth SPP, docelowo WiFi |

**Zasada utrzymania:** `esp32.ino` ma w miarę możliwości odzwierciedlać zachowanie `arduino.ino` (NM, przekaźniki, format `SYS:*` / `ERR:*` / ramek `0x…`). Różnica platformowa to wyłącznie warstwa łączności (BT, WiFi, OTA) oraz mapowanie pinów ESP32.

---

## Wybór platformy

- **Arduino** — stabilny firmware referencyjny, walidowany na magistrali PQ35. Używaj przy pracy warsztatowej z `bridge/bridge.py` przez kabel USB.
- **ESP32** — docelowy moduł w aucie: podgląd logów przez Bluetooth (`VAG_ESP32_BT`), bezprzewodowe wgrywanie (OTA po WiFi), mostek USB ↔ BT już działa. Logika CAN/NM z `arduino.ino` będzie przenoszona etapami.

---

## Konfiguracja sprzętowa (wspólna)

Oba warianty zakładają ten sam układ magistrali:

- **TJA1055T** — tryb ciągłej gotowości; piny `STB` i `EN` na stałe w stanie wysokim. Uśpienie transceivera wyłącznie programowo (brak nadawania). Monitorowany pin `TJA_ERR`.
- **MCP2515** — 100 kbps (Low-Speed VAG). Rejestr `0x0F` z bitem `0x08` włącza tryb **One-Shot** (brak nieskończonej retransmisji przy braku ACK).
- **Przekaźniki radia (active-low)** — w `arduino.ino`: `D7` = ACC, `D8` = ILL, `D9` = BACK. W `esp32.ino` numery GPIO zostaną zmapowane przy przenoszeniu logiki CAN.

---

## `arduino.ino` — komunikacja CAN (NM OSEK)

Firmware realizuje **Network Management (NM)** grupy VAG, sterowane zdarzeniami z `0x42B` (`mNM_Gateway_I`).
Używa dwóch warstw stanu:

- **NetState**: `NET_SLEEP`, `NET_ACTIVE`, `NET_GRACE`, `NET_SLEEP_READY`
- **AutoNmState**: `AUTO_ACTIVE`, `AUTO_SLEEP_PREP`, `AUTO_SILENT_LISTEN`

Wnioski i polityka walidacyjna dla tych stanów są utrzymywane w:

- `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`
- `logs/2026-04-11/NM_STATE_SITUATION_CATALOG.md`

- **Detekcja wake/sleep (logika):**
  - `SYS:CAN:WAKE_START` / `SYS:CAN:WAKE_END` są wyznaczane z przejść `wakeCombo` (bajty 2–4 w Alive `0x42B` do `0x0B`).
  - `SYS:CAN:SLEEP_IND` pojawia się na zboczu `SleepInd` (`0x10` w bajcie 1 `0x42B`).
- **Odpowiedź NM (`0x40B`):**
  - tylko gdy token jest adresowany do `0x0B`,
  - typ odpowiedzi zależy od `CmdRing` / `CmdAlive` / `CmdLimpHome`,
  - w fazach `AUTO_*` odpowiedź jest ograniczana zgodnie z polityką snu/recovery.
- **Pompa `0x661`:**
  - wysyłana tylko w `NET_ACTIVE` (nie po `WAKE_END`).
- **Watchdog `ERR:CAN:HANG`:**
  - oparty o brak ramek `0x42B → 0x0B` przez >2 s,
  - zasady legalnego tłumienia alarmu są opisane w `NM_COMMUNICATION_VALIDATION.md`.

### Logika przekaźników (`arduino.ino`)

Wyjścia przekaźnikowe są aktualizowane na podstawie ramek CAN:

- **ACC (`D7`)** — z `0x2C3` (`mZAS_Status`), sygnał `ZS1_ZAS_Kl_15` (bit 1 bajtu 0).
- **ILL (`D8`)** — z `0x635` (`mDimmung`), sygnał `DI1_Display` (bity 0..6 bajtu 0, aktywne gdy `>0`) oraz walidacja `DI1_Display_def` (bit 7; przy błędzie `ILL` wymuszane na OFF).
- **BACK (`D9`)** — z `0x531` (`mLicht_1_alt`), sygnał `LIA_Rueckfahrlicht` (bit 5 bajtu 0).

Mechanizm bezpieczeństwa: jeśli nie pojawi się żadna ramka CAN przez 5 minut (`300000 ms`), wszystkie przekaźniki są wyłączane (`SYS:RELAYS:FORCED_OFF_BY_SILENCE`).

### Funkcje (`arduino.ino`)

| Funkcja | Opis |
|---------|------|
| `setup()` | Serial `230400`, piny, TJA1055T, MCP2515, przekaźniki. `SYS:HW:READY` lub `ERR:HW:INIT_FAIL`. |
| `processSerial()` | Polecenia `TX:ID:LEN:PAYLOAD` — dekodowanie HEX i wypchnięcie na CAN. |
| `handleGatewayNm()` | Ramka `0x42B`: token, `Cmd*`/`Sleep*`, przejścia `WAKE_*` / `SLEEP_IND`, odpowiedź `0x40B`. |
| `checkHardwareErrors()` | MCP2515 (`ERR:HW:MCP:0x…`), TJA1055T (`ERR:HW:TJA`). |
| `updateRelaySignalsFromFrame()` | Dekoduje ACC / ILL / BACK z `0x2C3` / `0x635` / `0x531`. |
| `applyRelayOutputs()` | Active-low na `D7`/`D8`/`D9`. |
| `loop()` | Bez `delay`: Serial, odbiór CAN, NM, sniffer, watchdog, pompa `0x661`, diagnostyka HW. |

### Pominięcia sniffera na Serialu (`arduino.ino`)

Ramka jest wypisywana tylko wtedy, gdy jej ID **nie** jest na liście poniżej. To **nie** wyłącza odbioru CAN — tylko logowanie na Serial.

| ID | Stała w kodzie | Powód pominięcia |
|----|----------------|------------------|
| `0x531` | `CAN_ID_SNIFFER_IGNORE_A` | **mLicht_1_alt** — bardzo częsta; bez filtra zalewałaby log. |
| `0x661` | `CAN_ID_RADIO_STATUS` | Pompa statusu radia — echo własnego TX. |
| `0x40B` | `NM_ARDUINO_ID` | Własna odpowiedź NM węzła. |

**`0x42B` (Gateway)** — **nie** jest pomijane: ramki trafiają na Serial przy zmianie payloadu, żeby dashboard mógł pokazywać **mNM_Gateway**.

---

## `esp32.ino` — łączność bezprzewodowa

Obecny szkic to **szkielet transportu**. Nie zawiera jeszcze logiki CAN/NM z `arduino.ino`.

### Co działa teraz

- **Bluetooth Classic (SPP)** — urządzenie `VAG_ESP32_BT`; mostek dwukierunkowy USB Serial ↔ BT.
- **WiFi (STA)** — połączenie z siecią z limitem 10 s (brak WiFi nie blokuje startu; system przechodzi w tryb tylko-BT).
- **Arduino OTA** — po połączeniu WiFi hostname `VAG-Dekoder-OTA`; obsługa w `loop()`.
- **Heartbeat** — co 5 s na BT (gdy jest klient): `SYS: ESP32 działa. WiFi status: …`

### Konfiguracja przed wgraniem

W pliku `esp32.ino` uzupełnij:

```cpp
const char* ssid = "TWOJA_SIEC";
const char* password = "TWOJE_HASLO";
```

Nazwę urządzenia BT i hostname OTA można zmienić w tych samych stałych (`SerialBT.begin`, `ArduinoOTA.setHostname`).

### Docelowy kierunek (lustrzanie `arduino.ino`)

1. Przeniesienie obsługi MCP2515, NM, przekaźników i formatu logów.
2. Wspólny strumień protokołu na **Serial, Bluetooth i (opcjonalnie) WiFi** — ten sam format co w sekcji poniżej.
3. Zachowanie kompatybilności z `bridge/bridge.py` (USB) oraz możliwość podłączenia bridge przez port szeregowy BT.

---

## Format wyjścia (wspólny protokół)

Niezależnie od platformy i kanału (USB / BT) firmware emituje ten sam język komunikatów:

- **Ramki:** `0x[ID_HEX]: [B1] [B2] …`
- **System:** `SYS:HW:READY`, `SYS:CAN:SLEEP_IND`, `SYS:CAN:WAKE_START`, `SYS:CAN:WAKE_END`, `SYS:RELAYS:FORCED_OFF_BY_SILENCE`
- **Błędy:** `ERR:HW:INIT_FAIL`, `ERR:CAN:HANG`, `ERR:HW:TJA`, `ERR:HW:0x[KOD]`

Słownik w całym ekosystemie: [`MESSAGES.md`](../MESSAGES.md).

---

## Powiązane dokumenty

- Walidacja i reguły decyzyjne: `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`
- Katalog sytuacji i wzorców ramek: `logs/2026-04-11/NM_STATE_SITUATION_CATALOG.md`
- Opis magistrali PQ35: `data/Arduino CAN VW Golf Plus PQ35.md`
- Mostek Python: [`bridge/README.md`](../bridge/README.md)

### Uwaga historyczna

Starsze dokumenty i snapshoty w `logs/2026-04-11/` odwołują się do ścieżki `hardware/hardware.ino`. Od podziału na dwa szkice odpowiednikiem produkcyjnym jest **`hardware/arduino.ino`**.
