import { describe, expect, it } from "vitest";
import { nearestByHex, normalizeHex } from "./color";
import { publicAbsoluteUrl, variantIdentityUri } from "./site-url";

describe("color helpers", () => {
  it("normalizes hex", () => {
    expect(normalizeHex("6b5e54")).toBe("#6B5E54");
    expect(normalizeHex("#6B5E54")).toBe("#6B5E54");
    expect(normalizeHex("nope")).toBeNull();
  });

  it("finds nearest catalog color", () => {
    const hit = nearestByHex("#6C5F55", [
      { uuid: "a", hex: "#6B5E54" },
      { uuid: "b", hex: "#FF0000" },
    ]);
    expect(hit?.uuid).toBe("a");
  });
});

describe("site-url", () => {
  it("keeps paths relative without origin", () => {
    expect(publicAbsoluteUrl("/f/abc", "")).toBe("/f/abc");
  });

  it("joins origin without baking a hardcoded domain into helpers", () => {
    expect(publicAbsoluteUrl("/f/abc", "https://example.test")).toBe(
      "https://example.test/f/abc",
    );
    expect(variantIdentityUri("33333333-3333-4333-8333-333333333301")).toBe(
      "openfilament://variant/33333333-3333-4333-8333-333333333301",
    );
  });
});
