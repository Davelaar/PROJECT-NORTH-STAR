import { createCipheriv, createDecipheriv } from "node:crypto";
import {
  CFS_BLOCK_SIZE,
  CFS_DATA_KEY_HEX,
  CFS_PAYLOAD_LENGTH,
  CFS_UID_KEY_HEX,
} from "./keys.js";

function keyFromHex(hex: string): Buffer {
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 16) {
    throw new Error(`AES-128 key must be 16 bytes, got ${buf.length}`);
  }
  return buf;
}

function requireBlockAligned(bytes: Uint8Array, label: string): Buffer {
  if (bytes.length === 0 || bytes.length % CFS_BLOCK_SIZE !== 0) {
    throw new Error(
      `${label} length must be a multiple of ${CFS_BLOCK_SIZE}, got ${bytes.length}`,
    );
  }
  return Buffer.from(bytes);
}

function aesEcbCrypt(
  mode: "encrypt" | "decrypt",
  keyHex: string,
  data: Uint8Array,
): Uint8Array {
  const key = keyFromHex(keyHex);
  const input = requireBlockAligned(data, mode);
  const out = Buffer.alloc(input.length);
  for (let offset = 0; offset < input.length; offset += CFS_BLOCK_SIZE) {
    const block = input.subarray(offset, offset + CFS_BLOCK_SIZE);
    const cipher =
      mode === "encrypt"
        ? createCipheriv("aes-128-ecb", key, null)
        : createDecipheriv("aes-128-ecb", key, null);
    cipher.setAutoPadding(false);
    const part = Buffer.concat([cipher.update(block), cipher.final()]);
    part.copy(out, offset);
  }
  return new Uint8Array(out);
}

/** Encrypt 48-byte (or multiple of 16) plaintext with the CFS data key. */
export function encryptPayload(
  plaintext: Uint8Array,
  dataKeyHex: string = CFS_DATA_KEY_HEX,
): Uint8Array {
  if (plaintext.length !== CFS_PAYLOAD_LENGTH) {
    throw new Error(
      `CFS plaintext must be ${CFS_PAYLOAD_LENGTH} bytes, got ${plaintext.length}`,
    );
  }
  return aesEcbCrypt("encrypt", dataKeyHex, plaintext);
}

/** Decrypt 48-byte ciphertext with the CFS data key. */
export function decryptPayload(
  ciphertext: Uint8Array,
  dataKeyHex: string = CFS_DATA_KEY_HEX,
): Uint8Array {
  if (ciphertext.length !== CFS_PAYLOAD_LENGTH) {
    throw new Error(
      `CFS ciphertext must be ${CFS_PAYLOAD_LENGTH} bytes, got ${ciphertext.length}`,
    );
  }
  return aesEcbCrypt("decrypt", dataKeyHex, ciphertext);
}

/**
 * Derive MIFARE Sector 1 Key A (6 bytes) from a 4-byte UID.
 *
 * Algorithm (community-documented):
 * 1. Take first 4 UID bytes
 * 2. Repeat to 16 bytes
 * 3. AES-128-ECB encrypt with u_key
 * 4. Use first 6 output bytes as Key A
 */
export function deriveUidKeyA(
  uid: Uint8Array | string,
  uidKeyHex: string = CFS_UID_KEY_HEX,
): Uint8Array {
  const uidBytes =
    typeof uid === "string" ? fromHex(uid.replace(/\s+/g, "")) : Uint8Array.from(uid);
  if (uidBytes.length < 4) {
    throw new Error("UID must be at least 4 bytes");
  }
  const first4 = uidBytes.subarray(0, 4);
  const buffer = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    buffer[i] = first4[i % 4]!;
  }
  const encrypted = aesEcbCrypt("encrypt", uidKeyHex, buffer);
  return encrypted.subarray(0, 6);
}

export function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, "").toLowerCase();
  if (clean.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
