import { describe, expect, it } from "vitest";
import { compareCatalogLabels } from "./catalog-sort.js";

describe("compareCatalogLabels", () => {
  it("puts letter brands before digit brands", () => {
    expect(
      compareCatalogLabels("Flashforge", "ASA", "123-3D", "PLA"),
    ).toBeLessThan(0);
    expect(
      compareCatalogLabels("123-3D", "PLA", "Flashforge", "ASA"),
    ).toBeGreaterThan(0);
  });

  it("sorts letter brands alphabetically", () => {
    expect(
      compareCatalogLabels("Anycubic", "PLA", "Bambu Lab", "PLA"),
    ).toBeLessThan(0);
    expect(
      compareCatalogLabels("eSUN", "PLA", "Creality", "PLA"),
    ).toBeGreaterThan(0);
  });

  it("sorts digit brands among themselves", () => {
    expect(
      compareCatalogLabels("123-3D", "PLA", "3D Fuel", "PLA"),
    ).toBeLessThan(0);
  });
});
