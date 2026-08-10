import { describe, expect, it } from "vitest";
import sharp from "sharp";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { storeEvidenceImage } from "./store.js";

describe("storeEvidenceImage", () => {
  it("re-encodes png to jpeg and strips metadata", async () => {
    const png = await sharp({
      create: { width: 32, height: 32, channels: 3, background: "#336699" },
    })
      .png()
      .toBuffer();
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "of-ev-"));
    const stored = await storeEvidenceImage(png, "image/png", dir);
    expect(stored.mimeType).toBe("image/jpeg");
    expect(stored.byteSize).toBeGreaterThan(0);
    const buf = await fs.readFile(path.join(dir, stored.storageKey));
    const meta = await sharp(buf).metadata();
    expect(meta.format).toBe("jpeg");
    // EXIF should be absent / empty after strip
    expect(!meta.exif || meta.exif.length === 0).toBe(true);
  });

  it("rejects disallowed mime", async () => {
    await expect(
      storeEvidenceImage(Buffer.from("x"), "application/pdf"),
    ).rejects.toThrow(/Unsupported MIME/);
  });
});
