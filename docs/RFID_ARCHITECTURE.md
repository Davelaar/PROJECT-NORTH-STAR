# RFID architecture

**Doctrine:** RFID is a first-class identification method alongside QR and manual selection. Implementation is **browser-first**; native helpers are exceptions.

## Layers

- Codec packages:
  - `@open-filament/rfid-cfs` — working CFS-compatible codec (MIFARE Classic / AES; Node crypto — API/bridge)
  - `@open-filament/rfid-openprinttag` — OpenPrintTag UUID derivation + catalog field mapping + NDEF/CBOR encode
- API: `GET /rfid/schemes`, `POST /rfid/encode`, `POST /rfid/verify`, resolve/mapping routes, `GET /variants/{uuid}/openprinttag`, `POST /variants/{uuid}/openprinttag/encode`
- Web UI: CFS encode + resolve; browser write+verify via `apps/web/lib/rfid/browser-transport.ts`; OpenPrintTag Web NFC write path where `NDEFReader` is available
- Optional helper: simulate-write + policy-gated PC/SC write
- Details: [`RFID_BROWSER_TRANSPORT.md`](./RFID_BROWSER_TRANSPORT.md), [`OPENPRINTTAG.md`](./OPENPRINTTAG.md), [`CREALITY_CFS_RFID.md`](./CREALITY_CFS_RFID.md)

## Schemes (do not conflate)

| Scheme | Tag tech | Status |
|--------|----------|--------|
| Creality CFS Compatible | ISO 14443-A / MIFARE Classic | Encode / verify / browser write path shipped |
| OpenPrintTag | ISO 15693 + NDEF MIME `application/vnd.openprinttag` | UUIDs + fields + NDEF/CBOR encode + Web NFC write path shipped in software; physical compatibility remains browser/tag dependent |

Catalog UUIDs for OpenPrintTag preferably come from [Open Filament Database](https://openfilamentdatabase.org) ([spec](https://specs.openprinttag.org/)).

## Browser flow (CFS — shipped)

Connect (explicit click) → encode (API) → write ciphertext → read-back → byte compare → verify (API) → success only after verify.

## Browser APIs (selection rule)

> OpenFilament selects recommended RFID hardware based on reliable browser compatibility, required tag capabilities and maintainability.

| API | Role for OpenFilament |
|-----|------------------------|
| Web Serial (OF1) | Primary hardware path for OF1-capable adapters (CFS ciphertext) |
| WebUSB (OF1) | Experimental bulk OF1 path |
| WebHID | Detected; OF1 HID profile not shipped |
| Web NFC | Relevant for **OpenPrintTag NDEF** where browser/tag support exists; **not** a general MIFARE Classic / CFS solution |
| PC/SC via optional helper | Compatibility fallback (e.g. ACR122U) for CFS |

## Codec (CFS)

`CrealityCfsCodec` builds the community-documented 48-byte ASCII layout, AES-128-ECB encrypts blocks for Sector 1, and can derive UID Key A. See `docs/CREALITY_CFS_RFID.md`.

## Hardware status (honest)

| Path | Status |
|------|--------|
| CFS encode / decrypt verify (software) | Done |
| CFS browser memory write + verify | Done |
| CFS OF1 Web Serial / WebUSB write + verify | Done (needs OF1 firmware + tags to validate physically) |
| PC/SC physical write | Optional helper + `FEATURE_RFID_WRITE` |
| Device CFS recognition of third-party tags | Hardware/firmware-dependent — **blocked outside software** |
| OpenPrintTag UUID + field mapping | Done (`@open-filament/rfid-openprinttag`) |
| OpenPrintTag NDEF/CBOR encode + Web NFC write | Done in software; hardware/browser validation still required |
