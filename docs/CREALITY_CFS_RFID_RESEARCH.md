# Creality CFS RFID research notes

**Status:** Protocol **not verified**. No hardware dump campaign in this repo yet.

## KNOWN

- Creality CFS (Creality Filament System) uses spool RFID for material recognition on supported printers.
- Community interest exists in reading/writing compatible tags; public reverse-engineering is incomplete/fragmented.
- Open Filament registers a scheme row (`Creality CFS Compatible`, `research-stub-0`) for catalog wiring only.

## OBSERVED

- None in this repository. No captured tag dumps, no authenticated sector traces, no printer acceptance tests.

## INFERRED

- Tags are likely ISO14443-type NFC with vendor-specific data layout (common for AMS/CFS-class systems) — **inference only**.
- Color mapping from marketing names to vendor IDs is likely lossy.

## UNKNOWN

- Exact memory map / sector layout
- Material and color identifier tables
- Authentication keys / crypto
- CRC or checksum algorithms
- Capacity and writable regions
- Whether user-written tags are accepted by production firmware

## Stub used here

Open Filament ships `open-filament-cfs-research-stub-v1` (16-byte ASCII layout) solely so APIs and UI can be developed. **Do not write stub payloads expecting CFS hardware recognition.**

Phase 10: collect fixtures, classify evidence, then replace stub constants.
