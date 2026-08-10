import { describe, expect, it } from "vitest";
import {
  deriveBrandUuid,
  deriveMaterialUuid,
} from "./uuid.js";

describe("OpenPrintTag UUID derivation", () => {
  it("matches brand_uuid for Prusament", () => {
    expect(deriveBrandUuid("Prusament")).toBe(
      "ae5ff34e-298e-50c9-8f77-92a97fb30b09",
    );
  });

  it("derives material_uuid from brand bytes + name", () => {
    const brand = deriveBrandUuid("Prusament");
    const material = deriveMaterialUuid(brand, "PLA Prusa Galaxy Black");
    expect(material).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
