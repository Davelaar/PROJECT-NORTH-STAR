# Open Filament Bridge (stub)

Localhost companion process intended for privileged OS actions (slicer profile install, NFC/RFID transport) in later phases.

## Current stub

- Binds **`127.0.0.1:8788` only**
- `GET /health`
- `GET /v1/slicers` — returns an empty list
- `POST /v1/auth/session` — accepts any body; **does not validate** tokens

## Security non-goals (this stub)

This stub **does not** provide:

- Authentication or authorization against the Open Filament API
- Origin / CSRF protections beyond loopback binding
- Filesystem sandboxing or path allowlists
- NFC/RFID hardware access
- TLS
- Multi-user isolation

Do **not** expose this process on a public interface. Do **not** treat stub session acceptance as a security boundary.

See `docs/LOCAL_BRIDGE.md` and `docs/SECURITY.md`.

## Run

```bash
cargo run -p open-filament-bridge
```
