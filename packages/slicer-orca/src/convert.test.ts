import { describe, expect, it } from "vitest";
import { toCanonicalFromRevision } from "@open-filament/canonical-profile";
import { convertCanonicalToOrcaFilamentPreset } from "./convert.js";

describe("convertCanonicalToOrcaFilamentPreset", () => {
  it("maps known fields with Generic ASA @K2 Plus-all inherits", () => {
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
      printerModel: "K2 Plus",
    });
    const preset = convertCanonicalToOrcaFilamentPreset(canonical);
    expect(preset.type).toBe("filament");
    expect(preset.from).toBe("User");
    expect(preset.instantiation).toBe("true");
    expect(preset.inherits).toBe("Generic ASA @K2 Plus-all");
    expect(preset.nozzle_temperature).toEqual(["255"]);
    expect(preset.filament_flow_ratio).toEqual(["0.95"]);
    expect(JSON.stringify(preset)).not.toContain("UNKNOWN");
    expect(String((preset.filament_notes as string[])[0])).toContain(
      "seed catalog data",
    );
  });
});
