# Browser RFID transport (OF1)

OpenFilament’s **browser-first** RFID path moves **already-encrypted** CFS payloads between the web app and a reader. AES/CFS crypto stays on the API (`POST /api/v1/rfid/encode`, `POST /api/v1/rfid/verify`).

## Transports in `apps/web/lib/rfid/browser-transport.ts`

| Kind | Status | Notes |
|------|--------|-------|
| **memory** | Done | In-page write→read→verify; no hardware |
| **web-serial** | Done (OF1) | User picks a serial port after a click |
| **web-usb** | Experimental (OF1) | Bulk IN/OUT + OF1 text; rejects typical CCID readers |
| **web-hid** | Detected only | No OF1 HID profile shipped yet |
| **PC/SC helper** | Optional fallback | ACR122U-class — see [`LOCAL_BRIDGE.md`](./LOCAL_BRIDGE.md) |

## Success contract

1. Explicit user gesture → Connect  
2. Encode via API  
3. Write ciphertext to transport  
4. Read back ciphertext  
5. Compare bytes  
6. Verify via API  
7. Only then report success  

## OF1 line protocol

UTF-8 lines ending in `\n` (optional `\r`).

| Direction | Line |
|-----------|------|
| Host → device | `HELLO` |
| Device → host | `OF1 READY` |
| Host → device | `WRITE <96-hex-chars>` (48-byte CFS ciphertext) |
| Device → host | `OK` or `ERR …` |
| Host → device | `READ` |
| Device → host | `DATA <96-hex-chars>` |

Baud (Serial): **115200**.

Firmware must perform MIFARE Classic sector auth/write using the CFS layout (sector 1 / blocks 4–6) as documented in `CREALITY_CFS_RFID.md`. The browser does not speak PC/SC APDUs directly.

## Hardware selection rule

> OpenFilament selects recommended RFID hardware based on reliable browser compatibility, required tag capabilities and maintainability.

Prefer OF1-capable Web Serial/USB adapters. Do **not** claim Web NFC works for MIFARE Classic CFS. Keep ACR122U on the optional PC/SC helper until a web-compatible product is validated.

## CFS printer recognition

Whether a Creality CFS / K2 Plus accepts a rewritten third-party tag is **device/firmware dependent** and cannot be closed in software alone. Software acceptance covers encode → write → read-back → verify.
