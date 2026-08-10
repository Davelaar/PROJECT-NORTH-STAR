import { describe, expect, it } from "vitest";
import {
  displayNameFromInput,
  matchNormalizedName,
  normalizeNameKey,
} from "./name-match.js";

describe("normalizeNameKey", () => {
  it("collapses spelling noise and suffixes", () => {
    expect(normalizeNameKey("Bambu Lab")).toBe("bambu");
    expect(normalizeNameKey("BambuLab")).toBe("bambulab");
    expect(normalizeNameKey("Prusa Research")).toBe("prusa");
    expect(normalizeNameKey("Creality 3D")).toBe("creality");
    expect(normalizeNameKey("  Elegoo  ")).toBe("elegoo");
  });
});

describe("matchNormalizedName", () => {
  const candidates = [
    {
      canonical: "Bambu Lab",
      keys: ["Bambu", "BambuLab", "Bambu Labs"],
    },
    {
      canonical: "Prusa Research",
      keys: ["Prusa", "Průša"],
    },
    { canonical: "Creality", keys: ["Creality 3D"] },
  ];

  it("matches aliases and fuzzy typos", () => {
    expect(matchNormalizedName("bambu lab", candidates).canonical).toBe(
      "Bambu Lab",
    );
    expect(matchNormalizedName("prusa", candidates).canonical).toBe(
      "Prusa Research",
    );
    expect(matchNormalizedName("Crealityy", candidates).kind).toBe("fuzzy");
    expect(matchNormalizedName("Totally New Brand XYZ", candidates).kind).toBe(
      "none",
    );
  });
});

describe("displayNameFromInput", () => {
  it("title-cases free text", () => {
    expect(displayNameFromInput("my custom printer")).toBe("My Custom Printer");
  });
});
