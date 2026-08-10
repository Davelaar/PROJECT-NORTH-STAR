import { describe, expect, it } from "vitest";
import {
  cmykToHex,
  materialPopularityRank,
  parseColorQuery,
} from "./color-query.js";

describe("parseColorQuery", () => {
  it("parses hex", () => {
    expect(parseColorQuery("#000000")?.hex).toBe("#000000");
    expect(parseColorQuery("000")?.hex).toBe("#000000");
    expect(parseColorQuery("#fff")?.hex).toBe("#FFFFFF");
  });

  it("parses RAL", () => {
    const r = parseColorQuery("RAL 9011");
    expect(r?.kind).toBe("ral");
    expect(r?.hex).toBe("#1C1C1C");
  });

  it("parses CMYK black", () => {
    expect(parseColorQuery("cmyk(0,0,0,100)")?.hex).toBe("#000000");
    expect(parseColorQuery("0,0,0,100")?.hex).toBe("#000000");
  });

  it("parses colour names across languages", () => {
    expect(parseColorQuery("zwart")?.hex).toBe("#000000");
    expect(parseColorQuery("black")?.hex).toBe("#000000");
    expect(parseColorQuery("schwarz")?.hex).toBe("#000000");
    expect(parseColorQuery("黑色")?.hex).toBe("#000000");
    expect(parseColorQuery("wit")?.hex).toBe("#FFFFFF");
  });

  it("returns null for brand-like text", () => {
    expect(parseColorQuery("esun pla")).toBeNull();
  });
});

describe("cmykToHex", () => {
  it("converts white and black", () => {
    expect(cmykToHex(0, 0, 0, 0)).toBe("#FFFFFF");
    expect(cmykToHex(0, 0, 0, 100)).toBe("#000000");
  });
});

describe("materialPopularityRank", () => {
  it("ranks PLA before PEEK", () => {
    expect(materialPopularityRank("PLA")).toBeLessThan(
      materialPopularityRank("PEEK"),
    );
    expect(materialPopularityRank("PETG")).toBeLessThan(
      materialPopularityRank("ABS"),
    );
    expect(materialPopularityRank("ABS")).toBeLessThan(
      materialPopularityRank("PEEK"),
    );
  });
});
