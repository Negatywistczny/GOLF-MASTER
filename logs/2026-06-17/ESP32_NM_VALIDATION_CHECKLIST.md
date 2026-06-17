# ESP32 NM validation checklist — `hardware/esp32.ino`

**Data sesji:** 2026-06-17  
**Firmware:** `esp32.ino` (`FW_BUILD_ID` z logu `SYS:FW:BUILD_ID`)  
**Odniesienie:** [`logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`](../2026-04-11/NM_COMMUNICATION_VALIDATION.md)

---

## Przygotowanie

- [ ] Wgrany aktualny `esp32.ino` (OTA lub USB).
- [ ] Połączenie BLE UART + zapis logu terminala (`ZAPISZ LOGI` w UI).
- [ ] W logu startowym: `SYS:HW:READY` + `SYS:FW:BUILD_ID:2026-06-17-p0` (lub bieżący ID).
- [ ] Auto zgaszony / zapłon OFF na start Testu A; kierownica i multimedia jak w scenariuszu.

---

## Test A — sleep-path (wyłączenie auta)

**Cel:** Po wyłączeniu zapłonu i ciszy CAN firmware przechodzi w idle shutdown / light sleep bez zawieszenia watchdoga.

| # | Kryterium | PASS | FAIL | Uwagi |
|---|-----------|------|------|-------|
| A1 | Po ~10 s ciszy CAN pojawia się `SYS:CAN:IDLE_SHUTDOWN` | ☐ | ☐ | |
| A2 | Następnie `SYS:HW:LIGHT_SLEEP_ENTER` (opcjonalnie `LIGHT_SLEEP_WAKE` po impulsie CAN) | ☐ | ☐ | |
| A3 | Brak `ERR:CAN:HANG` podczas legalnej procedury snu | ☐ | ☐ | |
| A4 | W logu CAN widać `SleepInd` / `0x42B` ze `SleepInd` przed lub w trakcie uśpienia | ☐ | ☐ | opcjonalnie |

**Werdykt Test A:** ☐ PASS / ☐ FAIL

---

## Test B — impulsy po `WAKE_END` (odporność)

**Cel:** Po `SYS:CAN:WAKE_END` krótkie impulsy (światła, zamek, ACC) nie powodują `ERR:CAN:HANG`.

| # | Kryterium | PASS | FAIL | Uwagi |
|---|-----------|------|------|-------|
| B1 | W logu występuje para `SYS:CAN:WAKE_START` → `SYS:CAN:WAKE_END` | ☐ | ☐ | |
| B2 | Po `WAKE_END` wykonaj 2–3 impulsy użytkownika (np. pilot, światła pozycyjne) | ☐ | ☐ | |
| B3 | Brak `ERR:CAN:HANG` w ciągu 30 s po impulsach | ☐ | ☐ | |
| B4 | Kolejne `WAKE_START` po impulsie — opcjonalnie | ☐ | ☐ | |

**Werdykt Test B:** ☐ PASS / ☐ FAIL

---

## Test C — pompa `0x661` tylko w `AUTO_ACTIVE`

**Cel:** Ramka `0x661` (status radia) nie jest nadawana poza stanem aktywnym NM.

| # | Kryterium | PASS | FAIL | Uwagi |
|---|-----------|------|------|-------|
| C1 | Po `WAKE_END` / w ciszy — brak ciągłego strumienia `0x661` w terminalu | ☐ | ☐ | filtr sniffera ukrywa echo własnego TX |
| C2 | Przy aktywnym wake (`WAKE_START`, ruch CAN) — `0x661` może pojawiać się okresowo | ☐ | ☐ | |
| C3 | Po `SLEEP_IND` / idle — brak pompy `0x661` | ☐ | ☐ | |

**Werdykt Test C:** ☐ PASS / ☐ FAIL

---

## Regresja OTA / diagnostyka (P0)

| # | Kryterium | PASS | FAIL | Uwagi |
|---|-----------|------|------|-------|
| R1 | OTA kończy się `SYS:OTA:END` bez broken pipe | ☐ | ☐ | `scripts/ota_upload.sh` |
| R2 | Po OTA w logu nowy `SYS:FW:BUILD_ID` | ☐ | ☐ | |
| R3 | Przy `BUS_OFF` log zawiera `TEC=` i `REC=` | ☐ | ☐ | |

---

## Podsumowanie sesji

| Test | Wynik | Plik logu |
|------|-------|-------------|
| A | | |
| B | | |
| C | | |
| R (OTA/diag) | | |

**Tester:** _______________  
**Pojazd / warunki:** _______________
