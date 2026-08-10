#!/usr/bin/env bash
# Fetch the Open Filament Database dump and import into SQLite.
# Local:  ./scripts/bootstrap-catalog.sh
# Docker: docker compose exec api ./scripts/bootstrap-catalog.sh
set -euo pipefail
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -n "${DATABASE_URL:-}" && "$DATABASE_URL" == file:/data/* ]]; then
  export OFD_DATASET_DIR="${OFD_DATASET_DIR:-/data/external}"
fi

./scripts/fetch-ofd-catalog.sh
pnpm db:import-ofd
pnpm --filter @open-filament/db import-ofd-starters
pnpm --filter @open-filament/db seed-printers
./scripts/fetch-open-printer-catalog.sh || true
if [[ -f data/external/open-3d-printer-catalog.json ]]; then
  pnpm --filter @open-filament/db import-open-printers
fi

echo "Catalog bootstrap complete."
echo "Try: curl -s \"\${WEB_ORIGIN:-http://127.0.0.1:3000}/api/v1/search?q=esun\" | head"
