import {
  CFS_ACCESS_BYTES_HEX,
  CFS_DATA_BLOCKS,
  CFS_DEFAULT_KEY_B_HEX,
  CFS_PAYLOAD_LENGTH,
  CFS_TRAILER_BLOCK,
} from "./keys.js";
import { decryptPayload, deriveUidKeyA, fromHex, toHex } from "./crypto.js";
import { decodePlaintext } from "./payload.js";

/** In-memory MIFARE Classic 1K sector simulator for write/read/verify. */
export class MemoryTagTransport {
  readonly uid: Uint8Array;
  /** block index → 16 bytes */
  private readonly blocks = new Map<number, Uint8Array>();

  constructor(uid: Uint8Array | string = "35B94A19") {
    this.uid =
      typeof uid === "string" ? fromHex(uid.replace(/\s+/g, "")) : Uint8Array.from(uid);
    if (this.uid.length < 4) {
      throw new Error("UID must be at least 4 bytes");
    }
  }

  get keyA(): Uint8Array {
    return deriveUidKeyA(this.uid);
  }

  writeEncryptedPayload(ciphertext: Uint8Array): void {
    if (ciphertext.length !== CFS_PAYLOAD_LENGTH) {
      throw new Error(
        `Encrypted payload must be ${CFS_PAYLOAD_LENGTH} bytes, got ${ciphertext.length}`,
      );
    }
    for (let i = 0; i < CFS_DATA_BLOCKS.length; i++) {
      const blockNum = CFS_DATA_BLOCKS[i]!;
      const slice = ciphertext.subarray(i * 16, (i + 1) * 16);
      this.blocks.set(blockNum, new Uint8Array(slice));
    }
    const keyA = this.keyA;
    const trailer = new Uint8Array(16);
    trailer.set(keyA, 0);
    trailer.set(fromHex(CFS_ACCESS_BYTES_HEX), 6);
    trailer.set(fromHex(CFS_DEFAULT_KEY_B_HEX), 10);
    this.blocks.set(CFS_TRAILER_BLOCK, trailer);
  }

  readEncryptedPayload(): Uint8Array {
    const out = new Uint8Array(CFS_PAYLOAD_LENGTH);
    for (let i = 0; i < CFS_DATA_BLOCKS.length; i++) {
      const block = this.blocks.get(CFS_DATA_BLOCKS[i]!);
      if (!block) {
        throw new Error(`Block ${CFS_DATA_BLOCKS[i]} not written`);
      }
      out.set(block, i * 16);
    }
    return out;
  }

  readBlock(blockNum: number): Uint8Array | undefined {
    const b = this.blocks.get(blockNum);
    return b ? new Uint8Array(b) : undefined;
  }

  /**
   * Write encrypted blocks, read back, decrypt, and compare to expected plaintext.
   */
  writeAndVerify(plaintext: Uint8Array, ciphertext: Uint8Array): {
    ok: true;
    uidHex: string;
    keyAHex: string;
    blocksHex: { block4: string; block5: string; block6: string };
    decryptedAscii: string;
  } {
    this.writeEncryptedPayload(ciphertext);
    const readBack = this.readEncryptedPayload();
    if (toHex(readBack) !== toHex(ciphertext)) {
      throw new Error("Read-back ciphertext mismatch");
    }
    const decrypted = decryptPayload(readBack);
    if (toHex(decrypted) !== toHex(plaintext)) {
      throw new Error("Decrypted plaintext mismatch after simulate write");
    }
    const decoded = decodePlaintext(decrypted);
    return {
      ok: true,
      uidHex: toHex(this.uid.subarray(0, 4)),
      keyAHex: toHex(this.keyA),
      blocksHex: {
        block4: toHex(this.readBlock(4)!),
        block5: toHex(this.readBlock(5)!),
        block6: toHex(this.readBlock(6)!),
      },
      decryptedAscii: decoded.ascii,
    };
  }
}
