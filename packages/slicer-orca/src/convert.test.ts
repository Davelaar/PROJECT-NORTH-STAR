import { describe, expect, it } from "vitest";
import { toCanonicalFromRevision } from "@open-filament/canonical-profile";
import { convertCanonicalToOrcaFilamentPreset } from "./convert.js";

describe("convertCanonicalToOrcaFilamentPreset", () => {
  it("maps known fields and marks inherits as UNKNOWN", () => {
    const canonical = toCanonicalFromRevision({
      title: "TEST PETG",
      manufacturerName: "Flashforge",
      productName: "ASA",
      materialCode: "ASA",
      nozzleTempOtherLayersC: 255,
      flowRatio: 0.95,
      isSyntheticFixture: true,
    });
    const preset = convertCanonicalToOrcaFilamentPreset(canonical);
    expect(preset.type).toBe("filament");
    expect(preset.instantiation).toBe("user");
    expect(preset.inherits).toBe("UNKNOWN");
    expect(preset.nozzle_temperature).toBe(255);
    expect(String(preset.filament_notes)).toContain("SYNTHETIC");
  });
});
