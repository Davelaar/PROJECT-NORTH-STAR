/**
 * Creality CFS RFID codec — RESEARCH STUB ONLY.
 *
 * Documented stub format (NOT claimed as real CFS):
 *   byte 0      : version (0x01)
 *   bytes 1..8  : ASCII material code, space-padded (8 chars)
 *   bytes 9..15 : ASCII color token, space-padded (7 chars)
 *
 * Real CFS material IDs, color IDs, auth, and sector layout are UNKNOWN.
 */

export const STUB_FORMAT_VERSION = 0x01;
export const STUB_PAYLOAD_LENGTH = 16;
export const STUB_MATERIAL_LEN = 8;
export const STUB_COLOR_LEN = 7;

/** Explicit placeholders — not real CFS constants. */
export const UNKNOWN_CFS_CONSTANTS = {
  materialIdTable: "UNKNOWN",
  colorIdTable: "UNKNOWN",
  authKey: "UNKNOWN",
  sectorLayout: "UNKNOWN",
  crcPolynomial: "UNKNOWN",
  tagCapacityBytes: "UNKNOWN",
} as const;

export type StubEncodeInput = {
  materialCode: string;
  colorToken: string;
};

export type StubDecodeResult = {
  version: number;
  materialCode: string;
  colorToken: string;
  format: "open-filament-cfs-research-stub-v1";
  warnings: string[];
};

export class CrealityCfsCodec {
  readonly name = "creality-cfs-research-stub";
  readonly status = "research_stub" as const;

  /** Real CFS constants are not available — all UNKNOWN. */
  getUnknownConstants() {
    return { ...UNKNOWN_CFS_CONSTANTS };
  }

  encode(input: StubEncodeInput): {
    payload: Uint8Array;
    hex: string;
    warnings: string[];
  } {
    const warnings = [
      "Payload uses Open Filament research stub format — NOT verified Creality CFS bytes",
      "Do not write this payload to CFS hardware expecting printer recognition",
      `Unknown CFS constants: ${Object.keys(UNKNOWN_CFS_CONSTANTS).join(", ")}`,
    ];

    const material = padAscii(input.materialCode, STUB_MATERIAL_LEN);
    const color = padAscii(input.colorToken, STUB_COLOR_LEN);
    const payload = new Uint8Array(STUB_PAYLOAD_LENGTH);
    payload[0] = STUB_FORMAT_VERSION;
    payload.set(material, 1);
    payload.set(color, 1 + STUB_MATERIAL_LEN);

    return { payload, hex: toHex(payload), warnings };
  }

  decode(payload: Uint8Array | string): StubDecodeResult {
    const bytes =
      typeof payload === "string" ? fromHex(payload) : new Uint8Array(payload);
    if (bytes.length !== STUB_PAYLOAD_LENGTH) {
      throw new Error(
        `Stub payload must be ${STUB_PAYLOAD_LENGTH} bytes, got ${bytes.length}`,
      );
    }
    const version = bytes[0]!;
    if (version !== STUB_FORMAT_VERSION) {
      throw new Error(
        `Unsupported stub version 0x${version.toString(16)}; expected 0x${STUB_FORMAT_VERSION.toString(16)}`,
      );
    }
    const materialCode = asciiFrom(
      bytes.subarray(1, 1 + STUB_MATERIAL_LEN),
    ).trim();
    const colorToken = asciiFrom(
      bytes.subarray(1 + STUB_MATERIAL_LEN, STUB_PAYLOAD_LENGTH),
    ).trim();

    return {
      version,
      materialCode,
      colorToken,
      format: "open-filament-cfs-research-stub-v1",
      warnings: [
        "Decoded research stub format only — not a claim of real CFS field meanings",
      ],
    };
  }
}

function padAscii(input: string, len: number): Uint8Array {
  const cleaned = (input ?? "").toUpperCase().replace(/[^\x20-\x7E]/g, "");
  const truncated = cleaned.slice(0, len);
  const out = new Uint8Array(len);
  out.fill(0x20);
  for (let i = 0; i < truncated.length; i++) {
    out[i] = truncated.charCodeAt(i);
  }
  return out;
}

function asciiFrom(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes);
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
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
