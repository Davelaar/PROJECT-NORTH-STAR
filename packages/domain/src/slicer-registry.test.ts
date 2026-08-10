import { describe, expect, it } from "vitest";
import {
  SLICER_REGISTRY,
  buildExportFilename,
  getSlicerEntry,
  listDownloadableSlicers,
  sanitizeFilenamePart,
} from "./slicer-registry.js";

describe("slicer-registry", () => {
  it("lists four downloadable slicers plus interchange JSON", () => {
    expect(listDownloadableSlicers()).toHaveLength(4);
    expect(SLICER_REGISTRY.some((e) => e.id === "openfilamentprofile")).toBe(
      true,
    );
    expect(getSlicerEntry("openfilamentprofile")?.status).toBe("interchange");
  });

  it("marks slicer adapters as beta until manual verification is recorded", () => {
    for (const id of ["creality", "orca", "prusaslicer", "bambu"] as const) {
      const e = getSlicerEntry(id)!;
      expect(e.status).toBe("beta");
      expect(e.downloadEnabled).toBe(true);
      expect(e.includes.filament).toBe(true);
      expect(e.includes.printer).toBe(false);
      expect(e.includes.process).toBe(false);
      expect(e.docsPath).toMatch(/^\/docs\/slicers\//);
    }
  });

  it("does not classify OpenFilament JSON as a slicer preset", () => {
    const ofp = getSlicerEntry("openfilamentprofile")!;
    expect(ofp.group).toBe("interchange");
    expect(ofp.importMethod.toLowerCase()).toMatch(/backup|not import/);
  });

  it("sanitizes filename parts against path injection", () => {
    expect(sanitizeFilenamePart("../etc/passwd")).toBe("etc-passwd");
    expect(sanitizeFilenamePart("Flashforge ASA")).toBe("flashforge-asa");
  });

  it("builds openfilament-prefixed export filenames", () => {
    const name = buildExportFilename({
      formatId: "creality",
      manufacturerName: "Flashforge",
      productName: "ASA",
      variantName: "Burnt Titanium",
      printerModel: "K2 Plus",
      nozzleDiameterMm: 0.6,
    });
    expect(name).toBe(
      "openfilament-flashforge-asa-burnt-titanium-k2-plus-0-6mm-creality-print.json",
    );
    expect(name).not.toContain("/");
    expect(name).not.toContain("..");
  });
});
