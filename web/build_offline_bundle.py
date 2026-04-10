#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
ENTRY = ROOT / "js" / "app" / "main.js"
OUTPUT = ROOT / "script.bundle.js"

EXPORT_DECL_RE = re.compile(r"^\s*export\s+(?=(const|let|var|function|class)\b)")


def normalize_import_path(current_file: Path, rel_path: str) -> Path:
    if not rel_path.endswith(".js"):
        rel_path += ".js"
    return (current_file.parent / rel_path).resolve()


def iter_relative_import_paths(content: str) -> list[str]:
    paths: list[str] = []
    for m in re.finditer(r"import\s+[\s\S]*?\s+from\s+[\"']([^\"']+)[\"']", content):
        paths.append(m.group(1))
    for m in re.finditer(r"export\s*\{[\s\S]*?\}\s*from\s+[\"']([^\"']+)[\"']", content):
        paths.append(m.group(1))
    for m in re.finditer(r"^\s*import\s+[\"']([^\"']+)[\"']\s*;?", content, re.MULTILINE):
        paths.append(m.group(1))
    return paths


def collect_graph(file_path: Path, ordered: list[Path], seen: set[Path]) -> None:
    if file_path in seen:
        return
    seen.add(file_path)

    content = file_path.read_text(encoding="utf-8")
    for dep in iter_relative_import_paths(content):
        if not dep.startswith("."):
            raise RuntimeError(f"Only relative imports are supported in offline bundle: {dep}")
        dep_path = normalize_import_path(file_path, dep)
        collect_graph(dep_path, ordered, seen)

    ordered.append(file_path)


def transform_module(content: str) -> str:
    content = re.sub(r"export\s*\{[\s\S]*?\}\s*from\s+[\"'][^\"']+[\"']\s*;?", "", content)
    content = re.sub(r"import\s+[\s\S]*?\s+from\s+[\"'][^\"']+[\"']\s*;?", "", content)
    content = re.sub(r"^\s*import\s+[\"'][^\"']+[\"']\s*;?\s*$", "", content, flags=re.MULTILINE)
    content = re.sub(r"^\s*export\s*\{[^}]*\}\s*;?\s*$", "", content, flags=re.MULTILINE)

    output_lines: list[str] = []
    for line in content.splitlines():
        line = EXPORT_DECL_RE.sub("", line)
        output_lines.append(line)
    return "\n".join(output_lines).rstrip() + "\n"


def main() -> None:
    ordered: list[Path] = []
    collect_graph(ENTRY.resolve(), ordered, set())

    bundle_parts: list[str] = []
    bundle_parts.append(
        "/*\n"
        " * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.\n"
        " * Source of truth: web/js/**/*.js modules (entry: js/app/main.js).\n"
        " * Regenerate with: python3 web/build_offline_bundle.py\n"
        " */\n\n"
    )

    for module_path in ordered:
        rel = module_path.relative_to(ROOT)
        transformed = transform_module(module_path.read_text(encoding="utf-8"))
        bundle_parts.append(f"// ===== {rel.as_posix()} =====\n")
        bundle_parts.append(transformed)
        bundle_parts.append("\n")

    OUTPUT.write_text("".join(bundle_parts), encoding="utf-8")
    print(f"Offline bundle generated: {OUTPUT}")


if __name__ == "__main__":
    main()
