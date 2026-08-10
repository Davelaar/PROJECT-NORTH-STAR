import { describe, expect, it } from "vitest";
import { toCanonicalFromRevision } from "@open-filament/canonical-profile";
import {
  convertCanonicalToCrealityUserPreset,
  buildCrealityInfoFile,
  suggestCompatiblePrinter,
} from "./convert.js";

describe("convertCanonicalToCrealityUserPreset", () => {
  it("produces a Creality Print-style user wrapper with string arrays", () => {
    const canonical = toCanonicalFromRevision({
      title: "TEST ASA",
      isSyntheticFixture: true,
      manufacturerName: "Flashforge",
      productName: "ASA",
      variantName: "Burnt Titanium",
      materialCode: "ASA",
      diameterMm: 1.75,
      primaryColorHex: "#A52A2A",
      nozzleTempOtherLayersC: 255,
      nozzleTempMaxC: 270,
      bedTempOtherLayersC: 100,
      flowRatio: 0.95,
      pressureAdvance: 0.03,
      maxVolumetricFlowMm3s: 25,
      nozzleDiameterMm: 0.6,
      printerModel: "K2 Plus",
    });

    const preset = convertCanonicalToCrealityUserPreset(canonical);

    expect(preset.from).toBe("User");
    expect(preset.is_custom_defined).toBe("0");
    expect(preset.base_id).toBe("GFSA04");
    expect(preset.inherits).toBe("HP-ASA @Creality K2 Plus 0.6 nozzle");
    expect(preset.name).toBe(
      "Flashforge ASA Burnt Titanium @Creality K2 Plus 0.6 nozzle",
    );
    expect(preset.filament_settings_id).toEqual([preset.name]);
    expect(preset.filament_vendor).toEqual(["Flashforge"]);
    expect(preset.filament_max_volumetric_speed).toEqual(["25"]);
    expect(preset.nozzle_temperature_range_high).toEqual(["270"]);
    expect(preset.textured_plate_temp).toEqual(["100"]);
    expect(preset).not.toHaveProperty("cfs_material_id");
    expect(preset).not.toHaveProperty("rfid_payload_hex");
    expect(JSON.stringify(preset)).not.toContain("UNKNOWN");
    expect(String((preset.filament_notes as string[])[0])).toContain(
      "Open Filament",
    );
  });

  it("falls back to Generic ASA @ 0.4 when nozzle unknown", () => {
    const canonical = toCanonicalFromRevision({
      title: "ASA",
      materialCode: "ASA",
      manufacturerName: "Iemai",
      productName: "ASA",
    });
    const preset = convertCanonicalToCrealityUserPreset(canonical);
    expect(preset.inherits).toBe("Generic ASA @Creality K2 Plus 0.4 nozzle");
  });

  it("builds companion .info file", () => {
    const text = buildCrealityInfoFile({
      userId: "9731329878",
      settingId: "abc123def456",
      baseId: "GFSA04",
      updatedTime: 1785595117,
    });
    expect(text).toContain("user_id = 9731329878");
    expect(text).toContain("setting_id = abc123def456");
    expect(text).toContain("base_id = GFSA04");
  });

  it("suggests compatible printer string", () => {
    const canonical = toCanonicalFromRevision({
      title: "x",
      materialCode: "ASA",
      nozzleDiameterMm: 0.6,
      printerModel: "K2 Plus",
    });
    expect(suggestCompatiblePrinter(canonical)).toBe(
      "Creality K2 Plus 0.6 nozzle",
    );
  });
});
