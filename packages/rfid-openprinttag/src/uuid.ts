import { createHash } from "node:crypto";

/** OpenPrintTag UUID namespaces (RFC 4122 §4.3 / UUIDv5). */
export const OPT_NS = {
  brand: "5269dfb7-1559-440a-85be-aba5f3eff2d2",
  material: "616fc86d-7d99-4953-96c7-46d2836b9be9",
  package: "6f7d485e-db8d-4979-904e-a231cd6602b2",
  instance: "31062f81-b5bd-4f86-a5f8-46367e841508",
} as const;

function parseUuidBytes(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32) throw new Error(`Invalid UUID: ${uuid}`);
  return Buffer.from(hex, "hex");
}

function formatUuid(bytes: Buffer): string {
  const h = bytes.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** UUIDv5 over binary-concatenated name parts (OpenPrintTag derivation). */
export function uuidv5Parts(namespace: string, ...parts: Buffer[]): string {
  const hash = createHash("sha1");
  hash.update(parseUuidBytes(namespace));
  for (const part of parts) hash.update(part);
  const digest = hash.digest();
  const out = Buffer.from(digest.subarray(0, 16));
  out[6] = (out[6]! & 0x0f) | 0x50;
  out[8] = (out[8]! & 0x3f) | 0x80;
  return formatUuid(out);
}

export function deriveBrandUuid(brandName: string): string {
  return uuidv5Parts(OPT_NS.brand, Buffer.from(brandName, "utf8"));
}

export function deriveMaterialUuid(brandUuid: string, materialName: string): string {
  return uuidv5Parts(
    OPT_NS.material,
    parseUuidBytes(brandUuid),
    Buffer.from(materialName, "utf8"),
  );
}

export function derivePackageUuid(brandUuid: string, gtin: string | number): string {
  return uuidv5Parts(
    OPT_NS.package,
    parseUuidBytes(brandUuid),
    Buffer.from(String(gtin), "utf8"),
  );
}

/** NFC-V UID: 8 bytes, MSB first (first byte typically 0xE0 for SLIX2). */
export function deriveInstanceUuid(nfcTagUid: Uint8Array | Buffer): string {
  return uuidv5Parts(OPT_NS.instance, Buffer.from(nfcTagUid));
}
