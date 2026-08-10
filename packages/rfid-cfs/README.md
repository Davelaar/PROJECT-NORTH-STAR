# @open-filament/rfid-cfs

Working **Creality CFS-compatible** RFID codec based on community reverse engineering.

Not affiliated with Creality. Protocol details come from public community documentation and verified ciphertext vectors (see Sources).

## What works

| Capability | Status |
|------------|--------|
| 48-byte ASCII plaintext builder/parser | Working |
| AES-128-ECB encrypt/decrypt (data key) | Working — matches published vectors |
| UID → Sector 1 Key A derivation (u_key) | Working — matches published UID vector |
| `MemoryTagTransport` write/read/verify | Working (no hardware) |
| Material / weight catalogs | Working |

Real NFC PC/SC or RC522 hardware write is **out of scope** here; use the bridge simulate endpoint or a community writer with the same ciphertext.

## Payload layout (48 ASCII bytes)

`batch(3) + date(5) + supplier(3) + material(6) + color(7) + length(4) + serial(6) + reserve(14)`

- Material ASA → `100007`
- Color → `#RRGGBB` (7 chars)
- Length 1 kg → `0330`
- Encrypted per 16-byte block with data key `484043466B526E7A404B4174424A7032`
- Stored on MIFARE Classic 1K Sector 1, blocks 4–5–6

## Usage

```ts
import { CrealityCfsCodec, MemoryTagTransport } from "@open-filament/rfid-cfs";

const codec = new CrealityCfsCodec();
const encoded = codec.encode({
  material: "ASA",
  color: "#A52A2A",
  weightOrLength: "1kg",
  uid: "35B94A19",
});
const sim = codec.simulateWrite({ material: "ASA", color: "#A52A2A" });
// sim.ok === true
```

## Sources

- [talyguryn/rfid-tool-for-spool-tags](https://github.com/talyguryn/rfid-tool-for-spool-tags) — field map, keys, write algorithm
- [DnG-Crafts/K2-RFID](https://github.com/DnG-Crafts/K2-RFID) — original community reference
- [flamebarke/creality_rfid](https://github.com/flamebarke/creality_rfid) — published plaintext↔ciphertext + UID Key A vectors
- [deusrex2k Proxmark CFS helper](https://deusrex2k.github.io/proxmark4cfs.html) — published key strings

See also `docs/CREALITY_CFS_RFID.md`.
