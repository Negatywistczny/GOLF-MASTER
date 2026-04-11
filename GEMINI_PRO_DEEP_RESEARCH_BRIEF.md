# Gemini Pro Deep Research Brief

## 1) Objective

Find the root cause and robust solution for CAN/NM communication instability in a VW PQ35 infotainment setup, where we must satisfy both:
- **Test A (sleep-path):** bus can enter proper sleep sequence.
- **Test B (resilience):** no `ERR:CAN:HANG` after impulses post-`WAKE_END`.

The project currently shows a recurring trade-off between A and B across firmware versions.

---

## 2) System Context

Project: `GOLF-MASTER`  
Platform: VW PQ35 infotainment CAN (low-speed, 100 kbps)  
Main firmware path: `hardware/hardware.ino`

Architecture:
- **Arduino firmware** (MCP2515 + TJA1055): handles NM behavior from Gateway `0x42B`.
- **Bridge (Python)**: forwards serial/CAN to UI.
- **Web UI**: visualizes frames and diagnostics.

Important logging constraint:
- Serial log intentionally filters out **`0x40B`** (our NM TX) and **`0x661`** (radio pump TX).  
  This means we infer TX behavior indirectly from `0x42B` evolution and system events.

---

## 3) Canonical Sources (priority order)

Use this strict precedence for protocol truth:

1. `data/id_ramek.txt` (signal-level mapping used in repo)
2. `data/PQ35_46_ICAN_V3_6_9_F_20081104_ASR_V1_2.dbc`
3. `hardware/hardware.ino` behavior
4. `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md` (validation policy and conclusions)
5. `data/Arduino CAN VW Golf Plus PQ35.md` (contextual narrative; may contain wording inconsistencies)

---

## 4) Canonical Frame and Signal Facts

## 4.1 NM Gateway frame
- ID: **`0x42B`**
- Name: `mNM_Gateway_I`
- DLC: **6**
- Node token receiver: byte0 (`NMGW_I_Receiver`)
- Command/sleep bits in byte1 (canonical masks used in firmware):
  - `0x01` = `CmdRing`
  - `0x02` = `CmdAlive`
  - `0x04` = `CmdLimpHome`
  - `0x10` = `SleepInd`
  - `0x20` = `SleepAck`

## 4.2 Emulated node response
- ID used by project: **`0x40B`** (`0x400 + node 0x0B`)
- Not directly visible in serial logs (filtered).
- Expected to react to token when receiver is `0x0B`.

## 4.3 Radio/status pump
- ID: **`0x661`**
- Used as app/radio keep signal in firmware logic.
- Also filtered from serial logs.

## 4.4 Useful context IDs observed in logs
- `0x2C1`, `0x291` (user impulses in B scenarios)
- `0x65F`, `0x65D`, `0x351`, `0x527`, `0x557`, `0x651` (background traffic patterns)

---

## 5) Event Semantics Used in Logs

Firmware emits system markers:
- `SYS:CAN:WAKE_START`
- `SYS:CAN:WAKE_END`
- `SYS:CAN:SLEEP_IND`
- `SYS:CAN:NM_AUTO_ACTIVE`
- `SYS:CAN:NM_AUTO_PREP`
- `SYS:CAN:NM_AUTO_SILENT`
- `SYS:CAN:NM_RECOVERY` (in current branch behavior)
- `ERR:CAN:HANG`

`WAKE_START/WAKE_END` are derived from alive-frame wake fields in `0x42B` payload (bytes 2..4 transition nonzero<->zero).

---

## 6) Firmware Evolution and Observed Trade-offs

## 6.1 Timeline
- `v01`: A can pass, B fails (`ERR:CAN:HANG` after impulses).
- `v02`: B improves technically (no hang), A often fails (bus held active).
- `v03`: added KEEPALIVE/SLEEP_COOP modes; still A issues in field logs.
- `v04`: Auto-NM states introduced.
- `v4.1`: hard silence after sleep indication -> A pass, B fails again.
- current (v05 logs vs current firmware): recovery attempts after silence, but observed case of communication drop without HANG alarm.

## 6.2 Core recurring conflict
- If node is too responsive: bus may not sleep naturally.
- If node is too silent: ring can break after `WAKE_END` impulses -> HANG.

---

## 7) Complete Situation Groups (deduplicated)

This section compresses all observed logs into unique operational situations.

## S-ACTIVE: Wake + active NM traffic
Pattern:
- `SYS:CAN:WAKE_START`
- `0x42B: 0B 02 80 02 00 00` and alternating `0B 01 00 00 00 00`
Interpretation:
- Bus active, broad module traffic present.
Expected behavior:
- Respond NM for token-to-self, command-aware.

## S-POST-WAKE: after `WAKE_END`, still alive bus
Pattern:
- `SYS:CAN:WAKE_END`
- `0x42B` shifts to `0B 02 00 00 00 00` + `0B 01 00 00 00 00`
Interpretation:
- Not full sleep yet; transition phase.
Expected behavior:
- No timer-guessing; still event-driven NM reaction.

## S-SLEEP-PATH-OK: valid sleep closure
Pattern:
- `SLEEP_IND` appears
- `0x42B` includes `0B 04 ...` and `0B 14 ...`
Seen in:
- `v01_A_*`, `v04_1_A_*`
Interpretation:
- A path complete.

## S-RESILIENCE-OK: impulses post-WAKE_END but no hang
Pattern:
- post-`WAKE_END` impulses (`0x2C1`/`0x291`)
- no `ERR:CAN:HANG`
Seen in:
- `v02_B_*`, `v03_B_*`
Interpretation:
- technical continuity OK, product sleep semantics still may be wrong.

## F-HANG: explicit communication failure
Pattern:
- post-`WAKE_END` impulses + `ERR:CAN:HANG`
Seen in:
- `v01_B_*`, `v04_1_B_*`
Interpretation:
- ring continuity broken in required phase.

## F-KEPT-AWAKE: no sleep closure
Pattern:
- long post-wake traffic, no `SLEEP_IND`
Seen in:
- `v02_A_*`, `v03_A_*`, `v05_A_*`
Interpretation:
- likely over-participation in NM (or incorrect sleep semantics).

## F-FLAPPING: repeated sleep/wake loop behavior
Pattern:
- many repeated `SLEEP_IND` and `NM_AUTO_SILENT` in single run
Seen in:
- `v04_A_sleep_gate_cisza_2026-04-11.txt`
Interpretation:
- unstable state transitions despite script-level pass possibility.

## F-MASKED-FAILURE: communication drop without HANG
Pattern:
- transition to PREP/SILENT, then effective communication loss, no `ERR:CAN:HANG`
Seen in:
- `v05_A_sleep_gate_recovery_2026-04-11.txt` (annotated by operator)
Interpretation:
- watchdog suppression masking critical failure.

---

## 8) Validation Rules Already Established in Project

From `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`:
- NM state transitions must be event-driven, not timer-driven.
- Watchdog suppression allowed only after explicit full-bus-sleep confirmation.
- `PASS` validator + system-level regression = final **FAIL**.
- Communication drop without `ERR:CAN:HANG` = critical masked failure.
- A and B must both pass for production-level success.

---

## 9) Current Validation Tool: Capabilities and Gaps

Script: `scripts/validate_nm_serial_log.py`

Checks:
- `no-hang`
- `sleep-path`
- `resilience`

Gaps:
- Cannot observe TX `0x40B` or `0x661` (filtered in firmware logs).
- `resilience` checks post-`WAKE_END` continuity by line count, not semantic quality of NM ring.
- Script pass can coexist with system-level fail (already observed in project docs).

---

## 10) Data Integrity / Source Conflicts to Resolve

Potentially confusing points for external research:
- Some narrative text in `data/Arduino CAN VW Golf Plus PQ35.md` can be interpreted as different byte/bit wording; repository itself states `id_ramek.txt` is authoritative for real bit layout.
- `0x40B` is project-specific emulation choice (node `0x0B`), while other radio-related IDs may exist in extracted data files (do not conflate blindly).

---

## 11) What We Need Gemini Pro To Deliver

Provide deep-research outputs focused on **practical resolution of A+B simultaneously**:

1. **Protocol-grounded state contract**
   - Exact event sequence expectations around `WAKE_END`, `CmdLimpHome`, `SleepInd`, `SleepAck`.
   - Required vs optional node responses for maintaining ring without preventing sleep.

2. **Root-cause explanation for the observed trade-off**
   - Why "always reply" prevents sleep in this setup.
   - Why "hard silence" restores sleep-path but breaks resilience.

3. **Design pattern for balanced NM behavior**
   - Event-only transition model compliant with our constraints.
   - Recovery strategy that does not create watchdog masking.

4. **Watchdog policy recommendations**
   - Conditions for active detection vs legal suppression.
   - How to distinguish true full sleep from transition silence.

5. **Measurement strategy**
   - How to validate hidden TX (`0x40B`, `0x661`) with external sniffer and correlate with serial events.
   - Minimum additional telemetry to disambiguate failures.

6. **Decision matrix**
   - For each observed situation group (S/F above): expected gateway intent, expected node TX behavior, failure signatures.

---

## 12) Explicit Research Questions For Gemini Pro

1. In VW PQ35 NM practice, what is the expected node behavior when `CmdLimpHome` appears after `WAKE_END` but before confirmed full sleep?
2. Can a node legally stay silent after `SleepInd` without risking ring-failure in subsequent transient wake impulses?
3. What event sequence best indicates “full sleep confirmed” versus “temporary silence in transition”?
4. Which minimal response policy preserves resilience without forcing perpetual bus activity?
5. What timing assumptions are safe only as watchdog thresholds, and which are unsafe for state-driving logic?
6. Which additional raw CAN observations (especially hidden TX IDs) are mandatory to prove correctness?

---

## 13) File Index (for Gemini context ingestion)

Primary:
- `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`
- `logs/2026-04-11/NM_STATE_SITUATION_CATALOG.md`
- `hardware/hardware.ino`
- `scripts/validate_nm_serial_log.py`
- `data/id_ramek.txt`
- `data/PQ35_46_ICAN_V3_6_9_F_20081104_ASR_V1_2.dbc`
- `data/Arduino CAN VW Golf Plus PQ35.md`

Historical evidence:
- `logs/2026-04-11/v01_A_swiatla_sleep_ok_2026-04-11.txt`
- `logs/2026-04-11/v01_A_zamek_sleep_ok_2026-04-11.txt`
- `logs/2026-04-11/v01_B_swiatla_hang_2026-04-11.txt`
- `logs/2026-04-11/v01_B_zamek_hang_2026-04-11.txt`
- `logs/2026-04-11/v02_A_KA_swiatla_2026-04-11.txt`
- `logs/2026-04-11/v02_B_KA_swiatla_impulsy_2026-04-11.txt`
- `logs/2026-04-11/v03_A_KA_cisza_2026-04-11.txt`
- `logs/2026-04-11/v03_A_SC_cisza_2026-04-11.txt`
- `logs/2026-04-11/v03_B_KA_impulsy_2026-04-11.txt`
- `logs/2026-04-11/v03_B_SC_impulsy_2026-04-11.txt`
- `logs/2026-04-11/v03_C_KA_pompa_2026-04-11.txt`
- `logs/2026-04-11/v03_C_SC_pompa_2026-04-11.txt`
- `logs/2026-04-11/v04_A_sleep_gate_cisza_2026-04-11.txt`
- `logs/2026-04-11/v04_1_A_sleep_gate_cisza_2026-04-11.txt`
- `logs/2026-04-11/v04_1_B_impulsy_po_Apass_2026-04-11.txt`
- `logs/2026-04-11/v05_A_sleep_gate_recovery_2026-04-11.txt`

Supporting:
- `README.md`
- `hardware/README.md`
- `MESSAGES.md`

---

## 14) One-line Problem Statement

We need an event-driven NM response policy for node `0x0B` that simultaneously preserves post-`WAKE_END` resilience (no HANG) and allows true bus sleep-path completion, without timer-driven state guessing or watchdog masking.

