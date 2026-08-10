# Testing

| Area | Tool |
|------|------|
| Domain, adapters, RFID codec, API | Vitest |
| Bridge | `cargo test -p open-filament-bridge` |
| CI | `.github/workflows/ci.yml` |

## Conventions

- Aggregation tests cover null-skipping and IQR outlier behavior.
- RFID tests round-trip CFS fixtures + published community ciphertext/UID vectors.
- Slicer tests assert Creality/Orca wrapper structure (string arrays, inherits) without `UNKNOWN` placeholders.
- API health test uses a temp SQLite file + seed.
- Bridge preset install tests use `OF_BRIDGE_FILAMENT_ROOT_OVERRIDE` / tempfile.

```bash
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"
pnpm -r --filter './packages/*' build
pnpm test
cargo test -p open-filament-bridge
```
