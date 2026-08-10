# Testing

| Area | Tool |
|------|------|
| Domain, adapters, RFID stub, API | Vitest |
| Bridge | `cargo check` / future `cargo test` |
| CI | `.github/workflows/ci.yml` |

## Conventions

- Aggregation tests cover null-skipping and IQR outlier behavior.
- RFID tests round-trip **stub** fixtures only.
- Slicer tests assert `UNKNOWN` for unverified vendor/CFS fields.
- API health test uses a temp SQLite file + seed.

```bash
pnpm test
cargo check -p open-filament-bridge
```
