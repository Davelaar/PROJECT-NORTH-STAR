# Optional local helper (`open-filament-bridge`)

**Status:** Optional **compatibility helper** — **not** part of the default OpenFilament architecture.

OpenFilament is web-first. Ordinary users must be able to search, download profiles, use QR/manual identification, and encode CFS payloads **without** running this service.

Use this helper only when:

1. A concrete feature cannot be done reliably with browser APIs yet, **and**
2. The gap is documented (device/protocol, APIs investigated, why insufficient).

Current documented gaps this helper addresses:

| Feature | Why browser-primary is incomplete today | Helper role |
|---------|----------------------------------------|-------------|
| PC/SC / CCID MIFARE Classic writers (e.g. ACR122U) | No reliable cross-browser WebUSB/PC/SC equivalent for CFS sector write yet | Policy-gated physical write + simulate |
| Allowlisted slicer directory install | File System Access is per-user picker; silent auto-detect of slicer installs is not a browser capability | Optional preset install into detected dirs |

Preferred web paths remain: **download/import**, optional **File System Access**, **QR**, and future **WebUSB/Serial/HID** readers chosen for browser compatibility.

---

Rust service under `apps/bridge`.

## Behavior

- Bind: `127.0.0.1:8788` only
- Auth: `X-OF-Bridge-Token` (env `OF_BRIDGE_TOKEN`, default `local-dev-token`)
- Origin allowlist for browser POSTs (`localhost:3000` / `:8787`)
- `GET /health` — version, features, detected slicers
- `GET /v1/slicers` — filament dirs (helper convenience)
- `POST /v1/presets/install` — allowlisted write + backup
- `POST /v1/presets/list` / `rollback` / `remove`
- `POST /v1/rfid/encode` — CFS plaintext + ciphertext blocks
- `POST /v1/rfid/simulate-write` — in-memory write + verify + backup file
- `POST /v1/rfid/write` — physical only when `FEATURE_RFID_WRITE=true` and built with `--features pcsc`
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

## UI exposure

Web UI must keep helper actions behind **advanced / optional** affordances — never as the primary “Install” or “Write RFID” path for all users.
