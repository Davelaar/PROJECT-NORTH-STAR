import { describe, expect, it } from "vitest";
import {
  hexToRgb,
  normalizeHexColor,
  relativeLuminance,
  rgbDistance,
} from "./color.js";

describe("color", () => {
  it("normalizes hex", () => {
    expect(normalizeHexColor("6b5e54")).toBe("#6B5E54");
    expect(normalizeHexColor("#6b5e54")).toBe("#6B5E54");
    expect(normalizeHexColor("nope")).toBeNull();
  });

  it("converts to rgb", () => {
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("computes luminance and distance", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
    expect(rgbDistance("#000000", "#FFFFFF")).toBeCloseTo(Math.sqrt(3 * 255 ** 2), 5);
  });
});
