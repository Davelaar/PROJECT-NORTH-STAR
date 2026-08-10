import { describe, expect, it } from "vitest";
import {
  calculateTemplateFilamentValues,
  selectGenericPrinterTemplate,
} from "./printer-templates.js";

describe("generic printer templates", () => {
  it("classifies Creality K2 Plus as high-speed enclosed CoreXY direct-drive", () => {
    const template = selectGenericPrinterTemplate({
      manufacturerName: "Creality",
      model: "K2 Plus",
      technology: "fff",
      kinematics: "corexy",
      extruderType: "direct_drive",
      chamberCapable: true,
    });
    expect(template.id).toBe("high_speed_enclosed_corexy_direct");
    const values = calculateTemplateFilamentValues({
      materialCode: "PLA",
      printer: { chamberCapable: true },
      template,
    });
    expect(values.maxVolumetricFlowMm3s).toBe(18);
    expect(values.flowRatio).toBe(1);
  });

  it("uses longer retraction for open Bowden bedslingers", () => {
    const template = selectGenericPrinterTemplate({
      technology: "fff",
      kinematics: "bedslinger",
      extruderType: "bowden",
      chamberCapable: false,
    });
    expect(template.id).toBe("open_bedslinger_bowden");
    expect(template.retractionDistanceMm).toBeGreaterThan(3);
  });

  it.each([
    ["Flashforge", "Adventurer 5M Pro", "high_speed_enclosed_corexy_direct"],
    ["Bambu Lab", "X1 Carbon", "high_speed_enclosed_corexy_direct"],
    ["Qidi", "Q1 Pro", "high_speed_enclosed_corexy_direct"],
    ["Prusa Research", "MK4S", "open_bedslinger_direct"],
    ["Bambu Lab", "A1", "open_bedslinger_direct"],
    ["Elegoo", "Neptune 4 Pro", "open_bedslinger_direct"],
    ["Creality", "Ender 3 V2", "open_bedslinger_bowden"],
    ["Flsun", "V400", "delta_fff"],
    ["Anycubic", "Kobra S1", "high_speed_enclosed_corexy_direct"],
  ] as const)(
    "infers %s %s as %s from brand/model when detailed metadata is missing",
    (manufacturerName, model, expectedTemplateId) => {
      const template = selectGenericPrinterTemplate({
        manufacturerName,
        model,
      });
      expect(template.id).toBe(expectedTemplateId);
      expect(template.calculated).toBe(true);
      expect(template.tested).toBe(false);
    },
  );
});
