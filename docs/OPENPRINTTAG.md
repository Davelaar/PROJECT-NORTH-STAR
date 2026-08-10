# OpenPrintTag

**Spec:** [https://specs.openprinttag.org/](https://specs.openprinttag.org/)  
**Catalog that feeds UUIDs:** [https://openfilamentdatabase.org](https://openfilamentdatabase.org) ([API](https://api.openfilamentdatabase.org/))

OpenPrintTag is an **open NFC filament-tag format** (ISO/IEC 15693 / NFC-V + NDEF MIME `application/vnd.openprinttag` + CBOR regions). It is **not** Creality CFS / MIFARE Classic.

## Relationship to OpenFilament

| Concern | Role |
|---------|------|
| Open Filament Database (OFD) | Upstream MIT catalog; UUIDs imported into OpenFilament (`pnpm db:fetch-ofd` / `pnpm db:import-ofd`) |
| OpenPrintTag | RFID/NFC **adapter** that can consume OFD (and OpenFilament) brand/material/package/instance UUIDs |
| OpenFilament | Identity + community calibrations + multi-scheme adapters (CFS, OpenPrintTag, QR, …) |
| Creality CFS | Separate MIFARE Classic adapter (`@open-filament/rfid-cfs`) |

## Package status

`@open-filament/rfid-openprinttag`:

- **Done:** UUIDv5 namespace constants + derivation (`brand` / `material` / `package` / `instance`)
- **Done:** Catalog → OpenPrintTag main-field mapping helper
- **Planned:** full NDEF + CBOR binary encode/write and browser Web NFC path for ISO 15693

API preview: `GET /api/v1/variants/{uuid}/openprinttag` returns mapped fields with `status: fields_ready_encode_planned`.

## UUID namespaces (from the spec)

| Kind | Namespace UUID |
|------|----------------|
| brand | `5269dfb7-1559-440a-85be-aba5f3eff2d2` |
| material | `616fc86d-7d99-4953-96c7-46d2836b9be9` |
| package | `6f7d485e-db8d-4979-904e-a231cd6602b2` |
| instance | `31062f81-b5bd-4f86-a5f8-46367e841508` |

Derivation concatenates **binary** UUID bytes (not hyphenated strings) with UTF-8 name parts, then UUIDv5. Prefer **OFD-preserved** brand/material UUIDs when the row was imported from OFD.

## Browser notes

- Web NFC is more relevant for OpenPrintTag (NDEF) than for CFS.
- Do **not** use Web NFC for MIFARE Classic CFS writes.
- CFS and OpenPrintTag remain separate schemes in `rfid_schemes`.

## Honesty checklist

- Do not claim OpenPrintTag binary encode/write is shipped until NDEF/CBOR encode lands.
- Do not equate CFS ciphertext with OpenPrintTag payloads.
- Attribute OFD data to [Open Filament Database](https://openfilamentdatabase.org) (MIT).
