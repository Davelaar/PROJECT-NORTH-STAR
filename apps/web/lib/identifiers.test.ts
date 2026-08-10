import { describe, expect, it } from "vitest";
import { isPlaceholderId } from "./identifiers";

describe("isPlaceholderId", () => {
  it("treats all-zero EAN as placeholder", () => {
    expect(isPlaceholderId("0000000000000")).toBe(true);
  });

  it("keeps real identifiers", () => {
    expect(isPlaceholderId("8712345678901")).toBe(false);
  });
});
