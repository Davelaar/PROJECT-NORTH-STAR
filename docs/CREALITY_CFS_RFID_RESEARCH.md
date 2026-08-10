# Creality CFS RFID research notes

**Status:** Protocol implemented in-repo from community reverse engineering. See **[CREALITY_CFS_RFID.md](./CREALITY_CFS_RFID.md)** for the working format, keys, and test vectors.

## KNOWN (community-verified)

- MIFARE Classic 1K, Sector 1, blocks 4–5–6, AES-128-ECB payload encryption
- 48-byte ASCII field layout and generic material codes (PLA…ASA…)
- Data key and UID→Key A derivation (public community docs + matching ciphertext/UID vectors)
- Open Filament ships working encode/decrypt/simulate in `@open-filament/rfid-cfs` and the Rust bridge

## OBSERVED (this machine / fixtures)

- Software round-trips against published HyperPLA ciphertext and UID Key A vectors
- Local Creality Print 7.0 user filament wrappers inform slicer install (separate from RFID)

## INFERRED

- Printer acceptance of third-party tags depends on firmware material/supplier tables and successful sector auth — validate on hardware when available

## UNKNOWN / remaining

- Full vendor-specific material ID catalog beyond generics
- Production firmware edge cases
- **PC/SC / NFC hardware write** in Open Filament (simulate path only today)

## Historical note

Earlier Open Filament versions shipped a 16-byte research stub. That stub is removed; do not use stub payloads.
