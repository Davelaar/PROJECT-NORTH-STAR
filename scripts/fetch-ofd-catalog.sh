#!/usr/bin/env bash
# Download the MIT Open Filament Database bulk dump (OpenFilamentCollective).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${OFD_DATASET_DIR:-$ROOT/data/external}"
TAG="${OFD_DATASET_TAG:-dataset-v2026.08.09}"
mkdir -p "$OUT_DIR"
URL="https://github.com/OpenFilamentCollective/open-filament-database/releases/download/${TAG}/all.json.gz"
echo "Fetching $URL"
curl -fL --retry 3 --retry-delay 2 -o "$OUT_DIR/ofd-all.json.gz" "$URL"
gunzip -kf "$OUT_DIR/ofd-all.json.gz"
echo "Wrote $OUT_DIR/ofd-all.json"
