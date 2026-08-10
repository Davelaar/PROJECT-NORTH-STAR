import { describe, expect, it } from "vitest";
import { toCanonicalFromRevision } from "@open-filament/canonical-profile";
import { convertCanonicalToBambuFilamentPreset } from "./convert.js";

describe("convertCanonicalToBambuFilamentPreset", () => {
  it("emits Generic ASA inherits and Open Filament notes", () => {
    const canonical = toCanonicalFromRevision({
      title: "TEST ASA",
      manufacturerName: "Flashforge",
      productName: "ASA",
      variantName: "Burnt Titanium",
      materialCode: "ASA",
      nozzleTempOtherLayersC: 255,
      flowRatio: 0.95,
      maxVolumetricFlowMm3s: 25,
      isSyntheticFixture: true,
    });
    const preset = convertCanonicalToBambuFilamentPreset(canonical);
    expect(preset.type).toBe("filament");
    expect(preset.from).toBe("User");
    expect(preset.inherits).toBe("Generic ASA");
    expect(preset.nozzle_temperature).toEqual(["255"]);
    expect(String((preset.filament_notes as string[])[0])).toContain(
      "Open Filament user preset",
    );
  });
});
