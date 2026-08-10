# ROADMAP

OpenFilament is **web-first / PWA**. OS installers and a general desktop app are **not** on the default roadmap. Optional native helpers only after a documented browser gap.

## Product phases (current doctrine)

| Phase | Focus | Status |
|-------|--------|--------|
| **1 — Web foundation** | Filament DB, search, profiles, accounts, responsive webapp, spool IDs | **Done** (SQLite; Postgres later) |
| **2 — Universal browser flows** | Profile download/import, QR labels, camera scan, capability detection | **Done** |
| **3 — PWA** | Manifest, installability, safe shell cache, offline page, update flow | **Done** (shell-only) |
| **4 — Browser-native integrations** | File System Access, OF1 Web Serial/USB RFID write+verify, memory PoC | **Done** (WebHID OF1 still open; hardware validation ongoing) |
| **5 — Limited compatibility helpers** | PC/SC / allowlisted install only where browsers cannot | **Partial** — `apps/bridge` optional |

## Remaining

- Deploy/verify HTTPS on openfilament.nl with Compose `--profile proxy` + rotated secrets
- Validate OF1 firmware against real blank MIFARE tags + selected Web Serial/USB hardware
- WebHID OF1 profile if a maintainable HID reader is chosen
- Creality CFS / K2 Plus acceptance of third-party rewritten tags (**hardware/firmware**)
- OpenPrintTag NDEF + CBOR encode/write and Web NFC path ([spec](https://specs.openprinttag.org/), OFD UUIDs from [openfilamentdatabase.org](https://openfilamentdatabase.org))
- Broader community shrinkage / full slicer-param coverage as measurements land
- Postgres + FTS for multi-user production
- Broader slicers (e.g. SuperSlicer) as needed

## Non-goals

- General desktop app / Electron / Tauri as default distribution
- Required OS installers for core product use
- Automatic silent local slicer detection as a promised browser feature
- Claiming Web NFC as a MIFARE Classic CFS solution
- Treating OpenPrintTag and CFS as the same RFID format

## Acceptance

```bash
./scripts/acceptance-software.sh
pnpm --filter @open-filament/web typecheck
pnpm --filter @open-filament/web test
pnpm --filter @open-filament/web build
```
