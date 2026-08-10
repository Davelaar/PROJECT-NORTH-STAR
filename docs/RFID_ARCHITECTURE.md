# RFID architecture

## Layers

- Codec package: `@open-filament/rfid-cfs` (working CFS-compatible codec)
- API: `GET /rfid/schemes`, `POST /rfid/encode`, `POST /rfid/verify`
- Bridge: `POST /v1/rfid/encode`, `POST /v1/rfid/simulate-write` (Rust AES mirror)
- Transport: `MemoryTagTransport` for verify without hardware

## Codec

`CrealityCfsCodec` builds the community-documented 48-byte ASCII layout, AES-128-ECB encrypts blocks for Sector 1, and can derive UID Key A. See `docs/CREALITY_CFS_RFID.md`.

## Hardware

Simulate path always available. Physical tag write (PC/SC, Proxmark, RC522, Android) remains external / next step.
