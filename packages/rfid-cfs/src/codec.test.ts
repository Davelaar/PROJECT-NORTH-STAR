import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CrealityCfsCodec, UNKNOWN_CFS_CONSTANTS } from "./codec.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, "../fixtures");

describe("CrealityCfsCodec research stub", () => {
  const codec = new CrealityCfsCodec();

  it("exposes UNKNOWN for real CFS constants", () => {
    expect(codec.getUnknownConstants().materialIdTable).toBe("UNKNOWN");
    expect(UNKNOWN_CFS_CONSTANTS.authKey).toBe("UNKNOWN");
  });

  it("round-trips stub encode/decode", () => {
    const { payload, hex, warnings } = codec.encode({
      materialCode: "ASA",
      colorToken: "BTITAN",
    });
    expect(payload.length).toBe(16);
    expect(warnings.some((w) => w.includes("NOT verified"))).toBe(true);
    const decoded = codec.decode(hex);
    expect(decoded.materialCode).toBe("ASA");
    expect(decoded.colorToken).toBe("BTITAN");
    expect(decoded.format).toBe("open-filament-cfs-research-stub-v1");
  });

  it("round-trips fixture hex", () => {
    const fixture = JSON.parse(
      readFileSync(path.join(fixturesDir, "stub-asa-burnt-titanium.json"), "utf8"),
    ) as { hex: string; materialCode: string; colorToken: string };
    const decoded = codec.decode(fixture.hex);
    expect(decoded.materialCode).toBe(fixture.materialCode);
    expect(decoded.colorToken).toBe(fixture.colorToken);
    const again = codec.encode({
      materialCode: decoded.materialCode,
      colorToken: decoded.colorToken,
    });
    expect(again.hex).toBe(fixture.hex);
  });
});
