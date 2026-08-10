#!/usr/bin/env bash
# Fetch the Open 3D Printer Database catalog (CC-BY-4.0).
set -euo pipefail
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${OPEN_PRINTER_CATALOG_DIR:-$ROOT/data/external}"
mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/open-3d-printer-catalog.json"

URL="${OPEN_PRINTER_CATALOG_URL:-https://raw.githubusercontent.com/swordlab/open-3d-printer-database/main/catalog.json}"

echo "Fetching Open 3D Printer Database catalog…"
curl -fsSL "$URL" -o "$OUT"
python3 - <<PY
import json
p="$OUT"
with open(p) as f:
    data=json.load(f)
assert isinstance(data, list) and len(data) > 0, "catalog must be a non-empty array"
tech={}
for row in data:
    t=str(row.get("technology") or "?")
    tech[t]=tech.get(t,0)+1
print(f"Saved {len(data)} printers → {p}")
print("Technologies:", ", ".join(f"{k}={v}" for k,v in sorted(tech.items())))
print("License: CC-BY-4.0 — https://github.com/swordlab/open-3d-printer-database")
PY
