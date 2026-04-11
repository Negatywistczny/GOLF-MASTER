#!/usr/bin/env python3
"""
Walidacja logów seriala z firmware PQ35 (zdarzenia SYS:CAN:* + ramki 0x42B).
Linie zaczynające się od „#” są pomijane — opisy PROBLEM/ZDARZENIA/notatki końcowe zapisuj jako komentarz.
Checki no-hang / resilience (Test B) to regresja techniczna względem v01 (HANG); nie oznaczają „właściwego” snu magistrali przy wpiętym węźle — patrz NM_COMMUNICATION_VALIDATION.md.

Przykłady:
  python scripts/validate_nm_serial_log.py logs/2026-04-11/v01_A_swiatla_sleep_ok_2026-04-11.txt --check sleep-path --check no-hang
  python scripts/validate_nm_serial_log.py logs/2026-04-11/v01_B_zamek_hang_2026-04-11.txt --check no-hang
  python scripts/validate_nm_serial_log.py scripts/fixtures/nm_min_sleep_path.txt --check sleep-path --check no-hang
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


# Pełna linia — unikamy RE.search() na polach PROBLEM / szablonie z tekstem „ERR:CAN:HANG”.
RE_SYS_LINE = re.compile(
    r"^(?:SYS:CAN:(WAKE_START|WAKE_END|SLEEP_IND)|ERR:CAN:HANG)\s*$"
)
RE_42B = re.compile(r"^0x42[bB]:([0-9A-Fa-f\s]+)$")


def tokenize_42b_payload(rest: str) -> list[int]:
    parts = rest.strip().split()
    out: list[int] = []
    for p in parts:
        try:
            out.append(int(p, 16))
        except ValueError:
            break
    return out


def parse_log(path: Path) -> dict:
    sys_events: list[tuple[int, str]] = []
    lines_42b: list[tuple[int, list[int]]] = []
    with path.open(encoding="utf-8", errors="replace") as f:
        for i, raw in enumerate(f, start=1):
            line = raw.strip()
            if line.startswith("#"):
                continue
            m = RE_SYS_LINE.match(line)
            if m:
                if line.startswith("ERR:CAN:HANG"):
                    sys_events.append((i, "HANG"))
                else:
                    sys_events.append((i, m.group(1)))
            m2 = RE_42B.match(line)
            if m2:
                payload = tokenize_42b_payload(m2.group(1))
                if payload:
                    lines_42b.append((i, payload))
    return {"sys": sys_events, "b42b": lines_42b}


def has_wake_pattern_before_end(rows: list[tuple[int, list[int]]], end_line: int) -> bool:
    for ln, p in rows:
        if ln > end_line:
            break
        if len(p) < 4:
            continue
        if p[0] != 0x0B:
            continue
        if (p[1] & 0x02) != 0 and p[2] == 0x80 and p[3] == 0x02:
            return True
    return False


def has_post_wake_quiet_42b(rows: list[tuple[int, list[int]]], wake_end_line: int) -> bool:
    for ln, p in rows:
        if ln <= wake_end_line:
            continue
        if len(p) < 4:
            continue
        if p[0] != 0x0B:
            continue
        if p[1] == 0x02 and p[2] == 0 and p[3] == 0:
            return True
    return False


def has_sleep_combo_after_ind(
    rows: list[tuple[int, list[int]]], sleep_ind_line: int
) -> bool:
    for ln, p in rows:
        if ln <= sleep_ind_line:
            continue
        if len(p) < 2:
            continue
        if p[0] != 0x0B:
            continue
        if (p[1] & 0x14) == 0x14:
            return True
    return False


def line_of_last_event(sys_events: list[tuple[int, str]], name: str) -> int | None:
    last = None
    for ln, ev in sys_events:
        if ev == name:
            last = ln
    return last


def check_no_hang(data: dict) -> tuple[bool, str]:
    for _, ev in data["sys"]:
        if ev == "HANG":
            return False, "found ERR:CAN:HANG"
    return True, "no ERR:CAN:HANG"


def check_sleep_path(data: dict) -> tuple[bool, str]:
    sys_ev = data["sys"]
    rows = data["b42b"]
    if not any(ev == "WAKE_START" for _, ev in sys_ev):
        return False, "missing SYS:CAN:WAKE_START"
    if not any(ev == "WAKE_END" for _, ev in sys_ev):
        return False, "missing SYS:CAN:WAKE_END"
    if not any(ev == "SLEEP_IND" for _, ev in sys_ev):
        return False, "missing SYS:CAN:SLEEP_IND"
    le = line_of_last_event(sys_ev, "WAKE_END")
    ls = line_of_last_event(sys_ev, "SLEEP_IND")
    if le is None or ls is None or ls <= le:
        return False, "SLEEP_IND must follow last WAKE_END"
    if not has_wake_pattern_before_end(rows, le):
        return False, "missing 0x42B 0B xx 80 02 active-wake pattern before WAKE_END"
    if not has_post_wake_quiet_42b(rows, le):
        return False, "missing 0x42B 0B 02 00 00 after WAKE_END"
    if not has_sleep_combo_after_ind(rows, ls):
        return False, "missing 0x42B byte1 0x14 (Limp+SleepInd) after SLEEP_IND"
    return True, "sleep path (test A) OK"


def check_resilience_after_wake_end(data: dict) -> tuple[bool, str]:
    sys_ev = data["sys"]
    ok, msg = check_no_hang(data)
    if not ok:
        return False, msg
    le = line_of_last_event(sys_ev, "WAKE_END")
    if le is None:
        return False, "missing WAKE_END"
    all_lines = [ln for ln, _ in sys_ev] + [ln for ln, _ in data["b42b"]]
    max_line = max(all_lines, default=le)
    if max_line <= le + 5:
        return False, "too few lines after WAKE_END (need longer scenario B log)"
    return True, "resilience after WAKE_END OK (traffic continues, no HANG)"


def main() -> int:
    ap = argparse.ArgumentParser(description="Walidacja logów NM / PQ35")
    ap.add_argument("log_file", type=Path, help="Plik logu (tekst z seriala)")
    ap.add_argument(
        "--check",
        action="append",
        choices=("no-hang", "sleep-path", "resilience"),
        default=[],
        help="Powtarzalna flaga; domyślnie: wszystkie trzy",
    )
    args = ap.parse_args()
    checks = args.check if args.check else ["no-hang", "sleep-path", "resilience"]

    if not args.log_file.is_file():
        print(f"FAIL: brak pliku {args.log_file}", file=sys.stderr)
        return 2

    data = parse_log(args.log_file)
    results: list[tuple[str, bool, str]] = []

    if "no-hang" in checks:
        ok, msg = check_no_hang(data)
        results.append(("no-hang", ok, msg))
    if "sleep-path" in checks:
        ok, msg = check_sleep_path(data)
        results.append(("sleep-path", ok, msg))
    if "resilience" in checks:
        ok, msg = check_resilience_after_wake_end(data)
        results.append(("resilience", ok, msg))

    all_ok = all(r[1] for r in results)
    for name, ok, msg in results:
        status = "OK" if ok else "FAIL"
        print(f"[{status}] {name}: {msg}")

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
