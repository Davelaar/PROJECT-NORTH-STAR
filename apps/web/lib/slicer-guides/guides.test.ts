import { describe, expect, it } from "vitest";
import { guidesEn } from "./en";
import { getMessages } from "../messages/catalog";
import { LOCALES } from "../messages/types";
import { messages as en } from "../messages/en";
import {
  SLICER_REGISTRY,
  getSlicerEntry,
  buildExportFilename,
} from "@open-filament/domain";

describe("slicer guides", () => {
  it("has instruction guides for all four slicers", () => {
    for (const slug of [
      "creality-print",
      "orcaslicer",
      "prusaslicer",
      "bambu-studio",
    ] as const) {
      const g = guidesEn.guides[slug];
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.sections.length).toBeGreaterThanOrEqual(8);
      const ids = g.sections.map((s) => s.id);
      expect(ids).toContain("import");
      expect(ids).toContain("what");
      expect(ids).toContain("troubleshoot");
    }
  });

  it("never claims installed in English export copy", () => {
    const blob = JSON.stringify(en.export).toLowerCase();
    expect(blob).not.toContain('"installed"');
    expect(en.export.noInstallClaim.toLowerCase()).toMatch(/not installed/);
    expect(en.export.readyToImport.toLowerCase()).toMatch(/ready to import/);
  });

  it("registry docs paths match guide slugs", () => {
    for (const e of SLICER_REGISTRY.filter((x) => x.group === "slicer")) {
      expect(e.docsPath).toBe(`/docs/slicers/${e.slug}`);
      expect(getSlicerEntry(e.slug)?.id).toBe(e.id);
    }
  });

  it("builds safe creality filenames", () => {
    const name = buildExportFilename({
      formatId: "creality",
      manufacturerName: "Flashforge",
      productName: "ASA",
      variantName: "Burnt Titanium",
      printerModel: "K2 Plus",
      nozzleDiameterMm: 0.6,
    });
    expect(name.endsWith(".json")).toBe(true);
    expect(name.startsWith("openfilament-")).toBe(true);
  });
});

describe("locale export keys", () => {
  it("every locale includes downloadForSlicer", () => {
    for (const locale of LOCALES) {
      const m = getMessages(locale);
      expect(m.export.downloadForSlicer.length).toBeGreaterThan(0);
      expect(m.export.supportedSlicersLink.length).toBeGreaterThan(0);
      expect(m.export.loadProfilesTitle.length).toBeGreaterThan(0);
      expect(m.export.loadProfilesIntro.length).toBeGreaterThan(0);
      expect(m.export.readyTitle).toContain("{name}");
    }
  });
});
