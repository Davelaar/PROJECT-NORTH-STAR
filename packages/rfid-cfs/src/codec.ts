import { encryptPayload, decryptPayload, deriveUidKeyA, toHex, fromHex } from "./crypto.js";
import { encodePlaintext, decodePlaintext, type EncodePlaintextInput } from "./payload.js";
import { MemoryTagTransport } from "./transport.js";
import {
  CFS_DATA_KEY_HEX,
  CFS_UID_KEY_HEX,
  CFS_PAYLOAD_LENGTH,
  CFS_SECTOR,
  CFS_DATA_BLOCKS,
} from "./keys.js";
import { MATERIAL_CATALOG, WEIGHT_LENGTH_CODES } from "./materials.js";

export type CfsEncodeResult = {
  format: "creality-cfs-v1";
  plaintextAscii: string;
  plaintextHex: string;
  ciphertextHex: string;
  blocksHex: { block4: string; block5: string; block6: string };
  fields: ReturnType<typeof encodePlaintext>["fields"];
  uidKeyAHex?: string;
  notes: string[];
};

/**
 * Working Creality CFS-compatible codec based on community reverse engineering.
 * Not affiliated with Creality. Implements AES-128-ECB payload crypto and
 * plaintext field layout verified against public community tools/docs.
 */
export class CrealityCfsCodec {
  readonly name = "creality-cfs";
  readonly status = "community_verified" as const;

  encodePlaintext(input: EncodePlaintextInput) {
    return encodePlaintext(input);
  }

  encryptPayload(plaintext: Uint8Array) {
    return encryptPayload(plaintext);
  }

  decryptPayload(ciphertext: Uint8Array) {
    return decryptPayload(ciphertext);
  }

  decodePlaintext(payload: Uint8Array | string) {
    return decodePlaintext(payload);
  }

  deriveUidKeyA(uid: Uint8Array | string) {
    return deriveUidKeyA(uid);
  }

  /** Full encode: plaintext fields → encrypted 48-byte sector payload. */
  encode(
    input: EncodePlaintextInput & { uid?: string },
  ): CfsEncodeResult {
    const { ascii, bytes, fields } = encodePlaintext(input);
    const ciphertext = encryptPayload(bytes);
    const result: CfsEncodeResult = {
      format: "creality-cfs-v1",
      plaintextAscii: ascii,
      plaintextHex: toHex(bytes),
      ciphertextHex: toHex(ciphertext),
      blocksHex: {
        block4: toHex(ciphertext.subarray(0, 16)),
        block5: toHex(ciphertext.subarray(16, 32)),
        block6: toHex(ciphertext.subarray(32, 48)),
      },
      fields,
      notes: [
        "CFS-compatible payload (community reverse engineering)",
        `Sector ${CFS_SECTOR} blocks ${CFS_DATA_BLOCKS.join(",")}`,
        "Simulate path does not require NFC hardware",
      ],
    };
    if (input.uid) {
      result.uidKeyAHex = toHex(deriveUidKeyA(input.uid));
    }
    return result;
  }

  /** Decrypt ciphertext hex/bytes and parse plaintext fields. */
  verify(ciphertext: Uint8Array | string): {
    ok: true;
    plaintextAscii: string;
    fields: ReturnType<typeof decodePlaintext>;
  } {
    const bytes =
      typeof ciphertext === "string" ? fromHex(ciphertext) : ciphertext;
    const plain = decryptPayload(bytes);
    const fields = decodePlaintext(plain);
    return { ok: true, plaintextAscii: fields.ascii, fields };
  }

  /** In-memory write → read → decrypt verify (no hardware). */
  simulateWrite(
    input: EncodePlaintextInput & { uid?: string },
  ): ReturnType<MemoryTagTransport["writeAndVerify"]> & CfsEncodeResult {
    const encoded = this.encode(input);
    const transport = new MemoryTagTransport(input.uid ?? "35B94A19");
    const verified = transport.writeAndVerify(
      fromHex(encoded.plaintextHex),
      fromHex(encoded.ciphertextHex),
    );
    return { ...encoded, ...verified, uidKeyAHex: verified.keyAHex };
  }

  getConstants() {
    return {
      payloadLength: CFS_PAYLOAD_LENGTH,
      dataKeyHex: CFS_DATA_KEY_HEX,
      uidKeyHex: CFS_UID_KEY_HEX,
      sector: CFS_SECTOR,
      dataBlocks: [...CFS_DATA_BLOCKS],
      materials: MATERIAL_CATALOG,
      weightLengthCodes: { ...WEIGHT_LENGTH_CODES },
    };
  }
}
