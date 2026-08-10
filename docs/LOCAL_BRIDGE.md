# Local bridge

Rust service under `apps/bridge` for future privileged operations (slicer install, NFC).

## Stub behavior

- Bind: `127.0.0.1:8788`
- `GET /health`
- `GET /v1/slicers` → `[]`
- `POST /v1/auth/session` → accepts without real validation

## Non-goals (stub)

No authz, no filesystem sandbox, no NFC, no TLS, no LAN bind. See `apps/bridge/README.md`.

```bash
cargo run -p open-filament-bridge
```
