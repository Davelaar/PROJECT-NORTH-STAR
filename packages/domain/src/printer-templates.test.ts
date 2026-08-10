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
});
