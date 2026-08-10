# Local bridge

Rust service under `apps/bridge` for **slicer preset install** and **CFS RFID encode/write/simulate**.

## Behavior

- Bind: `127.0.0.1:8788` only
- Auth: `X-OF-Bridge-Token` (env `OF_BRIDGE_TOKEN`, default `local-dev-token`)
- Origin allowlist for browser POSTs (`localhost:3000` / `:8787`)
- `GET /health` — version, features, detected slicers
- `GET /v1/slicers` — Creality Print + OrcaSlicer filament dirs
- `POST /v1/presets/install` — allowlisted write + backup
- `POST /v1/presets/list` / `rollback` / `remove`
- `POST /v1/rfid/encode` — CFS plaintext + ciphertext blocks
- `POST /v1/rfid/simulate-write` — in-memory write + verify + backup file
- `POST /v1/rfid/write` — same codec path; physical only when `FEATURE_RFID_WRITE=true` and built with `--features pcsc`
- `GET /v1/rfid/readers` — simulated (+ PC/SC when compiled)
- `POST /v1/rfid/map-install` — install slicer preset from resolve/export payload

## Test install without touching real slicer dirs

```bash
export OF_BRIDGE_FILAMENT_ROOT_OVERRIDE=/tmp/of-filament-test
mkdir -p "$OF_BRIDGE_FILAMENT_ROOT_OVERRIDE"
cargo run -p open-filament-bridge
```

## Physical RFID (optional)

```bash
FEATURE_RFID_WRITE=true cargo run -p open-filament-bridge --features pcsc
```

Without the flag, `/v1/rfid/write` falls back to the verified simulate transport (never skips verification).

Backups: `~/.open-filament/rfid-backups/` (override with `OF_BRIDGE_RFID_BACKUP_DIR`).

```bash
cargo test -p open-filament-bridge
```
