import { describe, expect, it } from "vitest";
import { toCanonicalFromRevision } from "@open-filament/canonical-profile";
import {
  convertCanonicalToPrusaFilamentIni,
  pickPrusaInherits,
  suggestedPrusaFileName,
} from "./convert.js";

describe("prusa converter", () => {
  it("maps materials to Prusa templates", () => {
    expect(pickPrusaInherits("ASA")).toBe("*ABS*");
    expect(pickPrusaInherits("PETG")).toBe("*PET*");
    expect(pickPrusaInherits("TPU")).toBe("*FLEX*");
  });

  it("emits filament section with Open Filament note", () => {
    const canonical = toCanonicalFromRevision({
      title: "Flashforge ASA Burnt Titanium",
      manufacturerName: "Flashforge",
      productName: "ASA",
      variantName: "Burnt Titanium",
      materialCode: "ASA",
      primaryColorHex: "#6B5E54",
      densityGCm3: 1.07,
      nozzleTempOtherLayersC: 255,
      nozzleTempFirstLayerC: 260,
      bedTempOtherLayersC: 100,
      flowRatio: 0.95,
      maxVolumetricFlowMm3s: 28,
      isSyntheticFixture: true,
    });
    const ini = convertCanonicalToPrusaFilamentIni(canonical);
    expect(ini).toContain("[filament:Flashforge ASA Burnt Titanium]");
    expect(ini).toContain("inherits = *ABS*");
    expect(ini).toContain("temperature = 255");
    expect(ini).toContain("filament_max_volumetric_speed = 28");
    expect(ini).toContain("Open Filament user preset");
    expect(suggestedPrusaFileName(canonical)).toBe(
      "Flashforge ASA Burnt Titanium.ini",
    );
  });
});
