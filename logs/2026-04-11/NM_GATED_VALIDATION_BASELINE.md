# NM Gated Validation Baseline (A->B->C)

## Cel

Stały baseline walidacji bramkowej dla logów historycznych `v01-v05` zgodnie z planem po raporcie.

## Zastosowana sekwencja bram

1. **Brama A**: `sleep-path` + `no-hang`
2. **Brama B** (dopiero po A): `no-hang` + `resilience`
3. **Brama C** (pomocnicza): `no-hang` + kontrola `0x661` poza serialem (sniffer)

Reguły werdyktu końcowego:

- PASS skryptu + FAIL systemowy = FAIL końcowy.
- Urwanie komunikacji bez `ERR:CAN:HANG` = FAIL krytyczny (maskowanie awarii).

## Komenda bazowa

```powershell
$files = Get-ChildItem "logs/2026-04-11" -Filter "v*.txt" | Sort-Object Name
foreach ($f in $files) {
  if ($f.Name -match "_A_") { $checks = @("--check","sleep-path","--check","no-hang") }
  elseif ($f.Name -match "_B_") { $checks = @("--check","no-hang","--check","resilience") }
  elseif ($f.Name -match "_C_") { $checks = @("--check","no-hang") }
  else { $checks = @("--check","no-hang") }
  python scripts/validate_nm_serial_log.py "$($f.FullName)" @checks
}
```

## Wyniki skryptu (2026-04-11)

| Log | Brama | Wynik skryptu | Werdykt końcowy |
|---|---|---|---|
| `v01_A_swiatla_sleep_ok_2026-04-11.txt` | A | PASS | PASS |
| `v01_A_zamek_sleep_ok_2026-04-11.txt` | A | PASS | PASS |
| `v01_B_swiatla_hang_2026-04-11.txt` | B | FAIL (`ERR:CAN:HANG`) | FAIL |
| `v01_B_zamek_hang_2026-04-11.txt` | B | FAIL (`ERR:CAN:HANG`) | FAIL |
| `v02_A_KA_swiatla_2026-04-11.txt` | A | FAIL (`sleep-path`) | FAIL |
| `v02_B_KA_swiatla_impulsy_2026-04-11.txt` | B | PASS | PASS techniczny / ryzyko E2 |
| `v03_A_KA_cisza_2026-04-11.txt` | A | FAIL (`sleep-path`) | FAIL |
| `v03_A_SC_cisza_2026-04-11.txt` | A | FAIL (`sleep-path`) | FAIL |
| `v03_B_KA_impulsy_2026-04-11.txt` | B | PASS | PASS techniczny / ryzyko E2 |
| `v03_B_SC_impulsy_2026-04-11.txt` | B | PASS | PASS techniczny / ryzyko E2 |
| `v03_C_KA_pompa_2026-04-11.txt` | C | PASS (`no-hang`) | C nierozstrzygnięte bez sniffera |
| `v03_C_SC_pompa_2026-04-11.txt` | C | PASS (`no-hang`) | C nierozstrzygnięte bez sniffera |
| `v04_1_A_sleep_gate_cisza_2026-04-11.txt` | A | PASS | PASS |
| `v04_1_B_impulsy_po_Apass_2026-04-11.txt` | B | FAIL (`ERR:CAN:HANG`) | FAIL |
| `v04_A_sleep_gate_cisza_2026-04-11.txt` | A | PASS | FAIL systemowy (E3 flapping) |
| `v05_A_sleep_gate_recovery_2026-04-11.txt` | A | FAIL (`sleep-path`) + no-hang PASS | FAIL krytyczny (E4 maskowanie) |

## Status baseline

- **Brama A**: historycznie osiągana, ale niepowtarzalna między wersjami.
- **Brama B**: stabilna w v02/v03, ale regresyjna w v01/v4.1.
- **Brama C**: wymaga równoległego sniffera do twardego werdyktu.

## Warunek wejścia do kolejnej iteracji

Nowy firmware przechodzi dalej tylko, jeśli:

1. na tym samym buildzie ma **A PASS i B PASS**,
2. brak przypadków E3/E4,
3. C potwierdza brak regresji `0x661` w korelacji ze stanem NM.

