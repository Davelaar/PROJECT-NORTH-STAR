import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export type StoredEvidence = {
  storageKey: string;
  mimeType: "image/jpeg";
  byteSize: number;
  width: number;
  height: number;
};

/**
 * Validate MIME, re-encode to JPEG, strip EXIF/metadata, store under data/evidence/.
 */
export async function storeEvidenceImage(
  input: Buffer,
  declaredMime: string,
  rootDir?: string,
): Promise<StoredEvidence> {
  if (!ALLOWED.has(declaredMime)) {
    throw new Error(`Unsupported MIME type: ${declaredMime}`);
  }
  if (input.byteLength > MAX_BYTES) {
    throw new Error(`File exceeds ${MAX_BYTES} bytes`);
  }

  const root =
    rootDir ??
    path.resolve(
      process.env.EVIDENCE_ROOT ??
        path.join(process.cwd(), "../../data/evidence"),
    );
  await fs.mkdir(root, { recursive: true });

  const pipeline = sharp(input, { failOn: "error" }).rotate(); // honor orientation then strip
  const meta = await pipeline.metadata();
  // Do not call withMetadata()/keepMetadata — default re-encode drops EXIF (privacy).
  const out = await sharp(input)
    .rotate()
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const key = `${randomUUID()}.jpg`;
  const full = path.join(root, key);
  await fs.writeFile(full, out.data);

  return {
    storageKey: key,
    mimeType: "image/jpeg",
    byteSize: out.data.byteLength,
    width: out.info.width,
    height: out.info.height || meta.height || 0,
  };
}

export const EVIDENCE_LIMITS = {
  allowedMime: [...ALLOWED],
  maxBytes: MAX_BYTES,
};
