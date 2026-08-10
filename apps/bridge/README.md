# Open Filament Bridge

Localhost companion for slicer preset install and CFS RFID encode/simulate.

Binds **127.0.0.1:8788** only. Does **not** expose unrestricted filesystem access — installs write only into detected slicer filament directories (or `OF_BRIDGE_FILAMENT_ROOT_OVERRIDE`).

## Auth

All routes except `GET /health` require header:

```
X-OF-Bridge-Token: <token>
```

Token from env `OF_BRIDGE_TOKEN`, default **`local-dev-token`**.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Status, version, detected slicers |
| GET | `/v1/slicers` | Creality Print + OrcaSlicer filament dirs |
| POST | `/v1/presets/install` | Write `.json` (+ optional `.info`) with backup |
| POST | `/v1/presets/list` | List presets in filament dir |
| POST | `/v1/rfid/encode` | CFS plaintext + AES-encrypted blocks |
| POST | `/v1/rfid/simulate-write` | In-memory write/read/verify (no NFC hardware) |
| POST | `/v1/auth/session` | Check shared-secret token |

### Install body

```json
{
  "slicer": "creality_print",
  "presetJson": { "name": "...", "from": "User", "inherits": "..." },
  "infoText": "sync_info = \\nuser_id = ...",
  "fileName": "My ASA @Creality K2 Plus 0.6 nozzle.json",
  "userId": "9731329878"
}
```

Backups go to `<filament>/.open-filament-backups/of-<timestamp>/`.

### Test / dry-run install root

```bash
export OF_BRIDGE_FILAMENT_ROOT_OVERRIDE=/tmp/of-filament-test
cargo run -p open-filament-bridge
```

When unset, the bridge uses the first detected Creality/Orca user filament directory (e.g. macOS Creality Print `…/user/<id>/filament/`).

## Run

```bash
cargo run -p open-filament-bridge
cargo test -p open-filament-bridge
```

## Security boundaries (honest)

**Does:**

- Loopback bind only
- Shared-secret header gate
- Allowlisted filament dirs + filename sanitization
- Backup before overwrite

**Does not:**

- Unrestricted FS read/write
- PC/SC / NFC hardware write (simulate path only)
- TLS / remote auth / multi-user isolation

Do not expose this process on a public interface.
