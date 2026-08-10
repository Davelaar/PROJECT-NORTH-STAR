# Architecture

**Doctrine (hard):** OpenFilament is **web-first** and should remain fully browser-based wherever browser capabilities make this technically reliable. Native software is **not** part of the default architecture.

**Fallback rule:** A local or native helper may only be introduced for a specific feature after the repository documents why available browser APIs cannot implement that feature reliably, securely, and with acceptable hardware compatibility. Native software must never be introduced merely because it is easier to develop.

```
OpenFilament webapp / PWA
│
├── Public filament database (API + SQLite)
├── Search and discovery
├── User accounts
├── Community profiles + calibration evidence
├── Physical spool management / stable IDs
├── QR generation and short-link resolve
├── Profile conversion and browser download/export
├── Progressive browser integrations (capability-detected)
│   ├── File System Access (optional save)
│   ├── Camera (QR scan)
│   └── WebUSB / Web Serial / WebHID (RFID); Web NFC for OpenPrintTag (planned)
│
└── Optional compatibility helper (NOT default UX)
    └── apps/bridge — PC/SC RFID or allowlisted slicer dir write
        only when a concrete browser gap is documented
```

## Invariants

1. Database / domain model is source of truth.
2. Slicer JSON and RFID bytes are derived adapters.
3. Unknown numbers are `null`, never sentinel `0`.
4. Manufacturer claims ≠ community calibrations.
5. Seed / synthetic fixtures are always flagged.
6. Core UX must work **without** installing a desktop app, OS installer, or local bridge.
7. QR, RFID, and manual selection are **equal** identification methods (product value), not a quality ranking.
8. Web NFC is **not** treated as a general MIFARE Classic / CFS solution. OpenPrintTag (ISO 15693 + NDEF) is a separate adapter — see [`OPENPRINTTAG.md`](./OPENPRINTTAG.md).
9. Catalog identity may come from [Open Filament Database](https://openfilamentdatabase.org); RFID bytes are derived adapters (CFS, OpenPrintTag, …).

## Responsibilities

| Layer | Owns |
|-------|------|
| **Server (API)** | Canonical DB, accounts, profiles, spool IDs, encode/resolve, OpenAPI |
| **Web / PWA** | UI, capability detection, downloads, progressive enhancement, offline **shell** |
| **Optional helper** | Narrow, documented gaps only (e.g. PC/SC readers) |

## Capability detection

`apps/web/lib/capabilities.ts` feature-detects: PWA install signals, camera, WebUSB, Web Serial, WebHID, Web NFC, File System Access, download, print. UI must offer honest actions and universal fallbacks (never hide core workflows).

## Decision matrix

| Functie | Primaire webmethode | Universele fallback | Native helper toegestaan? |
|---|---|---|---|
| Profiel bekijken | Webapp | Geen extra software nodig | Nee |
| Profiel exporteren | Browserdownload | Handmatige slicerimport | Nee |
| Direct profiel opslaan | File System Access | Download/import | Alleen na aantoonbare noodzaak |
| QR genereren | Browser `/label` (PNG/SVG/PDF/print) | Short link `/f/{uuid}` | Nee |
| QR scannen | Browsercamera (`/scan`) + BarcodeDetector/jsQR | URL/code handmatig invoeren | Nee |
| RFID schrijven (CFS) | Browser memory PoC + OF1 Web Serial/USB | QR of handmatig identificeren | Alleen voor specifiek incompatibel protocol (PC/SC) |
| OpenPrintTag | Veldmapping + UUID-derivatie; NDEF encode gepland | QR / handmatig; OFD catalog | Later: Web NFC waar ISO 15693 NDEF werkt |
| PWA installeren | Browserinstallatie | Website gebruiken | Nee |

A functional fallback in this table describes **technical availability**, not product ranking. QR is not subordinate to RFID.

## PWA / offline boundaries

- Manifest: `apps/web/public/manifest.webmanifest`
- Service worker: `apps/web/public/sw.js` — caches **app shell** only
- Offline page: `apps/web/public/offline.html`
- Do **not** claim the full filament database is offline
- Do **not** cache authenticated / sensitive API responses in the shared shell cache

## Slicer export flow

1. **Standard:** generate → **download** → user imports in slicer  
2. **Enhanced:** File System Access save with explicit permission (when supported)  
3. **Optional helper:** allowlisted write via `open-filament-bridge` (advanced; not primary CTA)

Do not label a control universally “Install in slicer” when the browser cannot guarantee it.

## RFID flow (target)

Connect reader → permission dialog → detect tag → prepare payload → user confirm → write → read-back → verify → success only after verify.

**Shipped:** API encode + verify; browser memory PoC; OF1 Web Serial + experimental WebUSB (`docs/RFID_BROWSER_TRANSPORT.md`). Optional PC/SC helper for ACR122U-class readers.

## Native-helper exception policy

Document for each retained helper:

- concrete device/protocol;
- browser APIs investigated;
- why insufficient;
- supported OSes;
- security model;
- maintenance cost;
- why a different web-compatible device is not a better default.

Current helper: `apps/bridge` — see [`LOCAL_BRIDGE.md`](./LOCAL_BRIDGE.md).

## Monorepo layout

- `apps/web`, `apps/api`, `apps/bridge` (optional helper)
- `packages/db`, `domain`, `canonical-profile`, `slicer-*`, `rfid-cfs`, `rfid-openprinttag`
- `schemas/` OpenFilamentProfile JSON Schema
- `docs/`

## Trust boundaries

- Public read APIs are unauthenticated.
- Profile create / confirm / failure require Bearer tokens (hashed in `api_tokens`).
- Optional bridge binds loopback only with shared-secret token + path allowlist (see SECURITY.md).
- Hardware permissions only after explicit user action.
