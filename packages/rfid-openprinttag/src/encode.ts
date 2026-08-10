import type { OpenPrintTagMainFields } from "./map.js";

export const OPENPRINTTAG_MIME = "application/vnd.openprinttag";

type CborValue =
  | string
  | number
  | boolean
  | null
  | CborValue[]
  | { [key: string]: CborValue | undefined };

function utf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function major(majorType: number, value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Unsupported CBOR integer: ${value}`);
  }
  const head = majorType << 5;
  if (value < 24) return Uint8Array.of(head | value);
  if (value <= 0xff) return Uint8Array.of(head | 24, value);
  if (value <= 0xffff) return Uint8Array.of(head | 25, value >> 8, value & 0xff);
  return Uint8Array.of(
    head | 26,
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  );
}

function cbor(value: CborValue): Uint8Array {
  if (value === null) return Uint8Array.of(0xf6);
  if (typeof value === "boolean") return Uint8Array.of(value ? 0xf5 : 0xf4);
  if (typeof value === "number") {
    if (Number.isInteger(value) && value >= 0) return major(0, value);
    if (Number.isInteger(value) && value < 0) return major(1, Math.abs(value) - 1);
    const buf = new ArrayBuffer(9);
    const view = new DataView(buf);
    view.setUint8(0, 0xfb);
    view.setFloat64(1, value);
    return new Uint8Array(buf);
  }
  if (typeof value === "string") {
    const bytes = utf8(value);
    return concat([major(3, bytes.length), bytes]);
  }
  if (Array.isArray(value)) {
    return concat([major(4, value.length), ...value.map(cbor)]);
  }
  const entries = Object.entries(value)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return concat([
    major(5, entries.length),
    ...entries.flatMap(([key, v]) => [cbor(key), cbor(v as CborValue)]),
  ]);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function encodeOpenPrintTagPayload(fields: OpenPrintTagMainFields): Uint8Array {
  return cbor(fields as unknown as { [key: string]: CborValue | undefined });
}

export function buildOpenPrintTagNdefRecord(payload: Uint8Array): Uint8Array {
  const type = utf8(OPENPRINTTAG_MIME);
  if (payload.length <= 0xff) {
    // MB | ME | SR | TNF media-type
    return concat([Uint8Array.of(0xd2, type.length, payload.length), type, payload]);
  }
  return concat([
    Uint8Array.of(
      0xc2,
      type.length,
      (payload.length >>> 24) & 0xff,
      (payload.length >>> 16) & 0xff,
      (payload.length >>> 8) & 0xff,
      payload.length & 0xff,
    ),
    type,
    payload,
  ]);
}

export function encodeOpenPrintTagNdef(fields: OpenPrintTagMainFields) {
  const payload = encodeOpenPrintTagPayload(fields);
  const ndef = buildOpenPrintTagNdefRecord(payload);
  return {
    mimeType: OPENPRINTTAG_MIME,
    payload,
    payloadHex: toHex(payload),
    payloadBase64: toBase64(payload),
    ndef,
    ndefHex: toHex(ndef),
    ndefBase64: toBase64(ndef),
  };
}
