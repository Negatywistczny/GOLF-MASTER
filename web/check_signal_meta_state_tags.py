#!/usr/bin/env python3
"""
Fail if any signal in web/js/state/signalMeta.js has `states` keys not mirrored in `stateTags`.
Run from repo root: python3 web/check_signal_meta_state_tags.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / "web" / "js" / "state" / "signalMeta.js"


def strip_line_comments_keep_strings(text: str) -> str:
    out = []
    for line in text.splitlines():
        i = 0
        in_s: list[str] = []
        while i < len(line):
            if i < len(line) - 1 and line[i : i + 2] == "//":
                break
            c = line[i]
            if c in '"\'':
                if not in_s or in_s[-1] != c:
                    in_s.append(c)
                elif line[i - 1] != "\\":
                    in_s.pop()
            i += 1
        out.append(line[:i])
    return "\n".join(out)


def extract_braced(s: str, start_idx: int) -> tuple[str | None, int]:
    if start_idx >= len(s) or s[start_idx] != "{":
        return None, start_idx
    depth = 0
    i = start_idx
    while i < len(s):
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return s[start_idx + 1 : i], i + 1
        i += 1
    return None, start_idx


def parse_object_keys(obj_body: str) -> list[str]:
    keys: list[str] = []
    i = 0
    n = len(obj_body)
    while i < n:
        m = re.match(r"\s*([-+]?\d+(?:\.\d+)?|\[[^\]]+\])\s*:", obj_body[i:])
        if not m:
            i += 1
            continue
        key = m.group(1)
        keys.append(key)
        i += m.end()
        if i < n and obj_body[i] in " \t\n":
            i += re.match(r"\s*", obj_body[i:]).end()
        if i >= n:
            break
        if obj_body[i] == '"':
            end = i + 1
            while end < n:
                if obj_body[end] == '"' and obj_body[end - 1] != "\\":
                    break
                end += 1
            i = end + 1
        elif obj_body[i] == "{":
            _, j = extract_braced(obj_body, i)
            i = j
        else:
            depth = 0
            while i < n:
                if obj_body[i] == "{":
                    depth += 1
                elif obj_body[i] == "}":
                    depth -= 1
                elif obj_body[i] == "," and depth == 0:
                    i += 1
                    break
                i += 1
            continue
        while i < n and obj_body[i] in " \t\n":
            i += 1
        if i < n and obj_body[i] == ",":
            i += 1
    return keys


def norm_key(k: str) -> str:
    if k.startswith("["):
        return k
    try:
        if "." in k:
            return str(float(k))
        return str(int(float(k)))
    except ValueError:
        return k


def audit(text: str) -> list[tuple[str, str, list[str]]]:
    text_nc = strip_line_comments_keep_strings(text)
    issues: list[tuple[str, str, list[str]]] = []
    pos = 0
    sig_re = re.compile(r'\n    "([A-Za-z0-9_]+)":\s*\{')
    while True:
        m = sig_re.search(text_nc, pos)
        if not m:
            break
        name = m.group(1)
        start = m.end() - 1
        body, _ = extract_braced(text_nc, start)
        if body is None:
            pos = m.end()
            continue
        sm = re.search(r"\bstates:\s*(\{)", body)
        tm = re.search(r"\bstateTags:\s*(\{)", body)
        if sm and not tm:
            sbody, _ = extract_braced(body, sm.start(1))
            if sbody is None:
                pos = m.start() + 1
                continue
            sk = parse_object_keys(sbody)
            if sk:
                issues.append((name, "has states but no stateTags", sk))
        elif sm and tm:
            sbody, _ = extract_braced(body, sm.start(1))
            tbody, _ = extract_braced(body, tm.start(1))
            if sbody is None or tbody is None:
                pos = m.start() + 1
                continue
            sk = parse_object_keys(sbody)
            tk = parse_object_keys(tbody)
            skn = [norm_key(k) for k in sk]
            tkn = {norm_key(k) for k in tk}
            missing = [k for k, kn in zip(sk, skn) if kn not in tkn and k not in tkn]
            if missing:
                issues.append((name, f"missing stateTags for keys: {missing}", sk))
        pos = m.start() + 1
    return issues


def main() -> int:
    if not META.is_file():
        print(f"Missing {META}", file=sys.stderr)
        return 2
    text = META.read_text(encoding="utf8")
    issues = audit(text)
    if not issues:
        print("signalMeta: all states keys have stateTags")
        return 0
    for name, msg, sk in issues:
        print(f"{name}: {msg}", file=sys.stderr)
        print(f"  states keys ({len(sk)}): {sk}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
