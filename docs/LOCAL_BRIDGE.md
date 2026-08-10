# Local bridge

Rust service under `apps/bridge` for **slicer preset install** and **CFS RFID encode/simulate**.

## Behavior

- Bind: `127.0.0.1:8788`
- Auth: `X-OF-Bridge-Token` (env `OF_BRIDGE_TOKEN`, default `local-dev-token`)
- `GET /health` — version, features, detected slicers
- `GET /v1/slicers` — Creality Print + OrcaSlicer filament dirs (macOS/Windows/Linux paths)
- `POST /v1/presets/install` — allowlisted write + backup
- `POST /v1/presets/list`
- `POST /v1/rfid/encode` / `/v1/rfid/simulate-write`

## Test install without touching real slicer dirs

```bash
export OF_BRIDGE_FILAMENT_ROOT_OVERRIDE=/tmp/of-filament-test
mkdir -p "$OF_BRIDGE_FILAMENT_ROOT_OVERRIDE"
cargo run -p open-filament-bridge
```

When unset, installs use the first detected real user filament directory.

## Non-goals

No unrestricted filesystem, no LAN bind, no PC/SC hardware write. See `apps/bridge/README.md`.

```bash
cargo run -p open-filament-bridge
cargo test -p open-filament-bridge
```
