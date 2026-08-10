import { describe, expect, it } from "vitest";
import { trackEvent, getMeasurementId } from "../analytics/ga";

describe("analytics privacy", () => {
  it("does not expose a measurement id in test env", () => {
    expect(getMeasurementId()).toBe("");
  });

  it("trackEvent is a no-op without consent/init", () => {
    expect(() =>
      trackEvent("catalog_search_submitted", {
        query: "secret-uuid-should-be-stripped",
        via: "test",
      }),
    ).not.toThrow();
  });
});
