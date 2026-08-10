# RFID architecture

RFID is an **adapter layer** over filament variants + schemes.

## Components

- DB: `rfid_schemes`, `rfid_mappings`
- Codec package: `@open-filament/rfid-cfs` (research stub today)
- API: `GET /rfid/schemes`, `POST /rfid/encode`
- Future: bridge `TagTransport` HAL for physical readers

## Current codec

`CrealityCfsCodec` implements a **documented research stub** (version byte + ASCII material + color). It is **not** claimed to be real Creality CFS.

Real CFS material/color IDs, auth keys, sector layout: **UNKNOWN** until Phase 10 research produces verified fixtures.

See `CREALITY_CFS_RFID_RESEARCH.md`.
