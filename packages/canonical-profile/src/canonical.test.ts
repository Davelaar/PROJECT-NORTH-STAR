import { describe, expect, it } from "vitest";
import { toCanonicalFromRevision } from "./from-revision.js";
import { openFilamentProfileV1Schema, SCHEMA_VERSION } from "./schema-v1.js";

describe("OpenFilamentProfile v1", () => {
  it("maps a revision without inventing zeros for unknowns", () => {
    const profile = toCanonicalFromRevision({
      uuid: "77777777-7777-4777-8777-777777777701",
      title: "TEST ASA Burnt Titanium",
      isSyntheticFixture: true,
      nozzleTempOtherLayersC: 255,
      flowRatio: 0.95,
      pressureAdvance: null,
      manufacturerName: "Flashforge",
      productName: "ASA",
      variantName: "Burnt Titanium",
      materialCode: "ASA",
    });

    expect(profile.schemaVersion).toBe(SCHEMA_VERSION);
    expect(profile.provenance.isSyntheticFixture).toBe(true);
    expect(profile.thermal.nozzleTempOtherLayersC).toBe(255);
    expect(profile.extrusion.flowRatio).toBe(0.95);
    expect(profile.extrusion.pressureAdvance).toBeNull();
    expect(profile.cooling.fanMaxPercent).toBeNull();
    expect(openFilamentProfileV1Schema.safeParse(profile).success).toBe(true);
  });

  it("rejects wrong schema version", () => {
    const bad = toCanonicalFromRevision({ title: "x" });
    const result = openFilamentProfileV1Schema.safeParse({
      ...bad,
      schemaVersion: "openfilamentprofile-v0",
    });
    expect(result.success).toBe(false);
  });
});
