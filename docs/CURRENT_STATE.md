# CURRENT STATE

**Updated:** 2026-08-10 (HTTPS openfilament.nl · My Spools Cloud · AVG/privacy · richer OFD params · hardware page)

Open Filament lives at `/Users/raymonddavelaar/Projects/open-filament` (Apache-2.0). Production site: **https://openfilament.nl**.

## Product doctrine

**Web-first / PWA.** Core flows work in the browser without a desktop app, OS installer, or local bridge. The Rust bridge under `apps/bridge` is an **optional compatibility helper**, not the default architecture.

## Runtime

| Service | URL | Role |
|---------|-----|------|
| Web / PWA | http://127.0.0.1:3000 | Primary product UI |
| API | http://127.0.0.1:8787/api/v1 | Canonical data + exports |
| Bridge (optional) | http://127.0.0.1:8788 | Advanced helper only |

## Catalog sources

| Source | Status |
|--------|--------|
| Open Filament Database ([openfilamentdatabase.org](https://openfilamentdatabase.org), MIT) | **Imported** — temps, drying, chamber, diameter from sizes, traits, datasheets, slicer hints (~156 brands / ~2k products / ~14k variants) |
| OpenPrintTag ([specs.openprinttag.org](https://specs.openprinttag.org/)) | **Partial** — UUID + field mapping + NDEF/CBOR encode + Web NFC write path; hardware/browser compatibility still must be verified (not CFS) |
| Shrinkage (XY/Z) | **Schema + export ready** — rarely present in OFD; community submit/API can fill |
| SKU / EAN / GTIN + buy links | **Imported from OFD sizes/stores** — shown on variant pages; searchable |
| Variant preview | **Color swatch SVG** always; optional `preview_image_url` for photos |
| filamentcheatsheet.com | **Not imported** — no open bulk dump; `/api/` disallowed |
| 3dfilamentprofiles.com | **Not imported** — no redistributable open dataset |

See [`docs/EXTERNAL_CATALOG.md`](EXTERNAL_CATALOG.md), [`docs/FILAMENT_PARAMETERS.md`](FILAMENT_PARAMETERS.md), [`docs/OPENPRINTTAG.md`](OPENPRINTTAG.md).

## Spec status (honest)

| Area | Status |
|------|--------|
| Web foundation (search, profiles, accounts, catalog) | **Done** |
| Account privacy (sessions, export, delete, privacy prefs) | **Done** |
| Cookie consent + consent-gated GA4 | **Done** |
| My Spools local inventory | **Done** (IndexedDB; user-controlled import/export) |
| My Spools Cloud sync | **Done** (optional paid backup/sync; explicit user confirmation before upload) |
| My Spools Cloud billing | **Done** (Stripe one-time 12 months; test mode by default; live checkout gated by `MY_SPOOLS_CLOUD_LIVE_PAYMENTS`) |
| Download/import slicer export (Orca, Creality, Prusa, Bambu) | **Done** |
| File System Access optional save | **Done** (Chrome/Edge when available) |
| PWA manifest + shell service worker + offline page | **Done** |
| Browser capability detection | **Done** |
| QR short links `/f/{uuid}` | **Done** |
| QR printable label PNG/SVG/PDF + browser print | **Done** (`/label`) — QR uses **browser origin**, not `WEB_ORIGIN` |
| QR camera scan + manual code entry | **Done** (`/scan`) |
| RFID encode / resolve / verify API | **Done** |
| RFID browser write+verify (memory PoC + OF1 Web Serial/USB) | **Done** (see `RFID_BROWSER_TRANSPORT.md`) |
| WebHID OF1 profile | **Not shipped** (capability detected only) |
| PC/SC physical write via optional helper | **Implemented behind flag** |
| CFS→printer recognition on device | **Blocked on hardware / firmware** |
| OpenPrintTag UUID derivation + catalog field map | **Done** (`@open-filament/rfid-openprinttag`, `GET /variants/{uuid}/openprinttag`) |
| OpenPrintTag NDEF/CBOR encode + Web NFC write | **Done in software** (`POST /variants/{uuid}/openprinttag/encode`, `/rfid`) — physical tag compatibility depends on browser/tag hardware |
| HTTPS production (Caddy + HSTS) for openfilament.nl | **Configured in-repo** (`deploy/Caddyfile`, `docs/DEPLOYMENT.md`) |
| Browser auth hardening | **Done** (httpOnly session cookie + CSRF for web; Bearer still supported for API clients) |
| RFID/QR hardware page | **Done** (`/hardware`) |
| Default nozzle size | **0.4 mm** |

Software acceptance: `./scripts/acceptance-software.sh` → `ACCEPTANCE_SOFTWARE_OK`.

## Verified working

- Search → Flashforge ASA Burnt Titanium
- Community recommendation
- Profile **download** + optional FS Access save
- QR label downloads + camera/manual scan
- CFS encode / browser memory write+verify / resolve
- Auth, publish/revise/fork, evidence upload
- My Spools local + Cloud sync and account privacy export/delete
- Cookie consent with analytics only after consent
- OpenAPI at `/openapi.json`
- PWA shell assets

## Stack

pnpm monorepo · SQLite/Drizzle · Fastify · Next.js 15 (PWA) · optional Rust helper · Stripe Checkout · CFS AES codec · OpenPrintTag UUID helpers

## Docs

See `docs/` — especially **ARCHITECTURE.md**, **DEPLOYMENT.md**, **SECURITY.md**, **EXTERNAL_CATALOG.md**, **FILAMENT_PARAMETERS.md**, **OPENPRINTTAG.md**, **RFID_BROWSER_TRANSPORT.md**, ROADMAP, LOCAL_BRIDGE, PRODUCT_ACCESSIBILITY_AND_IDENTIFICATION.md, SLICER_ADAPTERS.
