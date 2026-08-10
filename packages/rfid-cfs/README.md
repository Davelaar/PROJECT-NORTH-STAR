# @open-filament/rfid-cfs

Research stub for Creality CFS-compatible RFID encoding.

## Important

**Real Creality CFS RFID protocol is not verified in this repository.**

This package implements a **documented research stub format** only:

| Offset | Size | Field |
|--------|------|--------|
| 0 | 1 | Version byte (`0x01` for stub v1) |
| 1 | 8 | ASCII material code, space-padded |
| 9 | 7 | ASCII color token, space-padded |

Total payload: **16 bytes**.

Constants that would be required for real CFS (material IDs, color IDs, auth keys, sector layout, CRC) are marked **`UNKNOWN`**. Encode/decode APIs round-trip the stub format only.

Hardware write support requires **Phase 10 research**. See `docs/CREALITY_CFS_RFID_RESEARCH.md` and `docs/RFID_ARCHITECTURE.md`.
