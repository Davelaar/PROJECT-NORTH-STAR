# Creality Integration

How Open Filament integrates with **Creality Print** and the **Creality Filament System (CFS)**.

Not affiliated with Creality.

## Architecture

```
Canonical calibration (DB)
        │
        ▼
Creality user filament preset JSON (+ .info)
        │
        ▼
OpenFilament Bridge (localhost)
        │
        ├── install into allowlisted Creality Print user filament dir
        │     (backup → write → validate readable JSON)
        │
        └── CFS RFID encode / simulate / optional PC/SC write
```

## Preset install (verified on Creality Print 7.x macOS)

**User filament directory** (example):

`~/Library/Application Support/Creality/Creality Print/7.0/user/<userId>/filament/`

Open Filament writes:

1. `{Name} @Creality K2 Plus 0.6 nozzle.json` — user wrapper (string arrays, `from: User`, `inherits` system preset)
2. Matching `.info` sidecar (`user_id`, `setting_id`, `base_id`, `updated_time`)

**Inherits** prefer nozzle-specific system presets when present, e.g.:

- `HP-ASA @Creality K2 Plus 0.6 nozzle`
- fallbacks: `Generic ASA @Creality K2 Plus 0.4 nozzle`

After install, restart or refresh Creality Print so user presets reload.

## Bridge operations

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/slicers` | Detect Creality Print / Orca paths |
| `POST /v1/presets/install` | Backup + install |
| `POST /v1/presets/rollback` | Restore backup |
| `POST /v1/presets/remove` | Remove OF-installed preset after backup |
| `POST /v1/rfid/*` | CFS encode / simulate / hardware when available |

Token: `X-OF-Bridge-Token` (default `local-dev-token`).

Dry-run installs: `OF_BRIDGE_FILAMENT_ROOT_OVERRIDE=/tmp/...`

## CFS RFID

See [CREALITY_CFS_RFID.md](./CREALITY_CFS_RFID.md).

Software path (always):

encode → encrypt sector blocks → simulate write/read/verify

Hardware path (when PC/SC reader + `FEATURE_RFID_WRITE=true`):

detect → read → backup → encode → write → read-back → verify

## CFS → profile mapping

1. Decode tag (or encode fields)
2. `GET/POST /api/v1/rfid/resolve` → filament variant UUID + recommended profile
3. Export Creality `bridgeInstallPayload`
4. Bridge `POST /v1/presets/install`

This is the software half of “tag spool → community preset without recalibrating.”

## Safety

- Never modify Creality **system** presets
- Allowlisted directories only
- Per-file backups before overwrite
- RFID write gated by feature flag
- Loopback bind only

## Research notes

Longer observations: [CREALITY_PRINT_RESEARCH.md](./CREALITY_PRINT_RESEARCH.md).
