# Creality CFS RFID protocol

**Status:** Working software codec (encode / decrypt / simulate verify) based on **community reverse engineering**. Not affiliated with Creality. Real NFC/PC/SC hardware write is not required for the simulate path and is the remaining hardware gap.

## Card layout

| Item | Value |
|------|--------|
| Tag | MIFARE Classic 1K |
| Sector | 1 |
| Data blocks | 4, 5, 6 (48 bytes encrypted) |
| Trailer | block 7 — Key A (UID-derived), access `FF 07 80 69`, Key B `FF…FF` |

## Plaintext (48 ASCII bytes)

`batch(3) + date(5) + supplier(3) + material(6) + color(7) + length(4) + serial(6) + reserve(14)`

Examples:

- Material ASA → `100007` (prefix `1` + generic `00007`)
- Color → `#RRGGBB` (7 chars; `0RRGGBB` also accepted when decoding)
- Length 1 kg → `0330`

## Crypto

- **Cipher:** AES-128-ECB, one encrypt per 16-byte block, no padding
- **Data key (d_key):** hex `484043466B526E7A404B4174424A7032` (ASCII `H@CFkRnz@KAtBJp2`)
- **UID Key A:** first 4 UID bytes repeated to 16 bytes → AES-ECB with **u_key** hex `713362755e74316e71665a2870662431` (ASCII `q3bu^t1nqfZ(pf$1`) → first 6 output bytes

Known vectors (also in package fixtures / Rust tests):

| Input | Output |
|-------|--------|
| Plaintext `1A5241201B3D010010000000033000000100000000000000` | Ciphertext blocks matching flamebarke README |
| UID `35B94A19` | Key A `239E7FE23653` |
| OF ASA fixture `OF1241200A2100007#A52A2A033000000100000000000000` | See `packages/rfid-cfs/fixtures/asa-burnt-titanium.json` |

## Implementations

| Location | Role |
|----------|------|
| `packages/rfid-cfs` | TypeScript source of truth + Vitest fixtures |
| `apps/bridge` `cfs` module | Rust mirror for localhost RFID endpoints |
| `apps/api` `/api/v1/rfid/encode` + `/verify` | HTTP API |

## Sources

- https://github.com/talyguryn/rfid-tool-for-spool-tags (documented field map + keys)
- https://github.com/DnG-Crafts/K2-RFID
- https://github.com/flamebarke/creality_rfid (published vectors)
- https://deusrex2k.github.io/proxmark4cfs.html

## Hardware gap

Encoding and in-memory simulate-write are complete. Writing ciphertext to a physical tag still needs a PC/SC, Proxmark, RC522, or Android writer using the same blocks/keys.
