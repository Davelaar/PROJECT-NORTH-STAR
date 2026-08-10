import { CFS_PAYLOAD_LENGTH } from "./keys.js";
import {
  resolveLengthCode,
  resolveMaterialCode,
  materialNameForCode,
} from "./materials.js";

export type CfsPlaintextFields = {
  batch: string;
  date: string;
  supplier: string;
  material: string;
  color: string;
  length: string;
  serial: string;
  reserve: string;
};

export type EncodePlaintextInput = {
  material: string;
  color: string;
  weightOrLength?: string | number;
  serial?: string;
  batch?: string;
  date?: string;
  supplier?: string;
  reserve?: string;
};

const FIELD_LENS = {
  batch: 3,
  date: 5,
  supplier: 3,
  material: 6,
  color: 7,
  length: 4,
  serial: 6,
  reserve: 14,
} as const;

function padField(value: string, len: number, label: string): string {
  const cleaned = (value ?? "").replace(/[^\x20-\x7E]/g, "");
  if (cleaned.length > len) {
    throw new Error(`${label} must be ≤ ${len} chars, got ${cleaned.length}`);
  }
  return cleaned.padEnd(len, "0").slice(0, len);
}

/** Normalize color to 7-char CFS field: `#` + 6 hex digits. */
export function normalizeColorField(color: string): string {
  const raw = (color ?? "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) return raw.toUpperCase();
  if (/^0[0-9A-Fa-f]{6}$/.test(raw)) {
    return `#${raw.slice(1).toUpperCase()}`;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(raw)) {
    return `#${raw.toUpperCase()}`;
  }
  throw new Error(
    `Color must be #RRGGBB, 0RRGGBB, or RRGGBB — got "${color}"`,
  );
}

function defaultDateYymdd(now = new Date()): string {
  const yy = String(now.getFullYear() % 100).padStart(2, "0");
  const m = String(now.getMonth() + 1); // YYMDD uses 1 digit for month when < 10 in community docs; keep 1–9 or A–C?
  // Community format YYMDD: month is single hex-ish digit (1-9, A=10, B=11, C=12)
  const monthMap = "123456789ABC";
  const monthChar = monthMap[now.getMonth()] ?? "1";
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${monthChar}${dd}`;
}

/**
 * Build the fixed 48-byte ASCII plaintext:
 * batch(3)+date(5)+supplier(3)+material(6)+color(7)+length(4)+serial(6)+reserve(14)
 */
export function encodePlaintext(input: EncodePlaintextInput): {
  ascii: string;
  bytes: Uint8Array;
  fields: CfsPlaintextFields;
} {
  const fields: CfsPlaintextFields = {
    batch: padField(input.batch ?? "OF1", FIELD_LENS.batch, "batch"),
    date: padField(input.date ?? defaultDateYymdd(), FIELD_LENS.date, "date"),
    supplier: padField(input.supplier ?? "0A2", FIELD_LENS.supplier, "supplier"),
    material: resolveMaterialCode(input.material),
    color: normalizeColorField(input.color),
    length: resolveLengthCode(input.weightOrLength ?? "1kg"),
    serial: padField(input.serial ?? "000001", FIELD_LENS.serial, "serial"),
    reserve: padField(
      input.reserve ?? "00000000000000",
      FIELD_LENS.reserve,
      "reserve",
    ),
  };

  const ascii =
    fields.batch +
    fields.date +
    fields.supplier +
    fields.material +
    fields.color +
    fields.length +
    fields.serial +
    fields.reserve;

  if (ascii.length !== CFS_PAYLOAD_LENGTH) {
    throw new Error(
      `Internal error: plaintext length ${ascii.length} ≠ ${CFS_PAYLOAD_LENGTH}`,
    );
  }

  const bytes = new Uint8Array(CFS_PAYLOAD_LENGTH);
  for (let i = 0; i < ascii.length; i++) {
    bytes[i] = ascii.charCodeAt(i);
  }
  return { ascii, bytes, fields };
}

export function decodePlaintext(
  payload: Uint8Array | string,
): CfsPlaintextFields & {
  ascii: string;
  materialName?: string;
} {
  const ascii =
    typeof payload === "string"
      ? payload.length === CFS_PAYLOAD_LENGTH * 2 && /^[0-9a-fA-F]+$/.test(payload)
        ? Buffer.from(payload, "hex").toString("ascii")
        : payload
      : Buffer.from(payload).toString("ascii");

  if (ascii.length !== CFS_PAYLOAD_LENGTH) {
    throw new Error(
      `CFS plaintext must be ${CFS_PAYLOAD_LENGTH} chars, got ${ascii.length}`,
    );
  }

  let offset = 0;
  const take = (n: number) => {
    const part = ascii.slice(offset, offset + n);
    offset += n;
    return part;
  };

  const fields: CfsPlaintextFields = {
    batch: take(3),
    date: take(5),
    supplier: take(3),
    material: take(6),
    color: take(7),
    length: take(4),
    serial: take(6),
    reserve: take(14),
  };

  return {
    ...fields,
    ascii,
    materialName: materialNameForCode(fields.material),
  };
}
