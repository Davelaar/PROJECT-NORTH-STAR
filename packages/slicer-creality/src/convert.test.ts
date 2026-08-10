import { describe, expect, it } from "vitest";
import { toCanonicalFromRevision } from "@open-filament/canonical-profile";
import { convertCanonicalToCrealityUserPreset } from "./convert.js";

describe("convertCanonicalToCrealityUserPreset", () => {
  it("produces a user preset with UNKNOWN for unmapped CFS fields", () => {
    const canonical = toCanonicalFromRevision({
      title: "TEST ASA",
      isSyntheticFixture: true,
      manufacturerName: "Flashforge",
      productName: "ASA",
      variantName: "Burnt Titanium",
      materialCode: "ASA",
      diameterMm: 1.75,
      nozzleTempOtherLayersC: 255,
      bedTempOtherLayersC: 100,
      flowRatio: 0.95,
      pressureAdvance: 0.03,
      maxVolumetricFlowMm3s: 28,
    });
    const preset = convertCanonicalToCrealityUserPreset(canonical);
    expect(preset.instantiation).toBe("user");
    expect(preset.nozzle_temperature).toBe(255);
    expect(preset.filament_flow_ratio).toBe(0.95);
    expect(preset.cfs_material_id).toBe("UNKNOWN");
    expect(preset.rfid_payload_hex).toBe("UNKNOWN");
    expect(String(preset.filament_notes)).toContain("SYNTHETIC");
  });
});
