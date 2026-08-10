import { describe, expect, it } from "vitest";
import {
  DEFAULT_DENIED,
  isConsentCurrent,
  parseConsent,
} from "./types";

describe("consent model", () => {
  it("defaults optional categories to denied", () => {
    expect(DEFAULT_DENIED.analytics).toBe(false);
    expect(DEFAULT_DENIED.marketing).toBe(false);
    expect(DEFAULT_DENIED.necessary).toBe(true);
  });

  it("parses consent records and requires matching version", () => {
    const raw = JSON.stringify({
      version: "2026-08-10",
      timestamp: "2026-08-10T12:00:00.000Z",
      locale: "nl",
      categories: {
        necessary: true,
        preferences: true,
        analytics: true,
        marketing: false,
      },
    });
    const parsed = parseConsent(raw);
    expect(parsed?.categories.analytics).toBe(true);
    expect(isConsentCurrent(parsed, "2026-08-10")).toBe(true);
    expect(isConsentCurrent(parsed, "2026-09-01")).toBe(false);
  });

  it("rejects malformed consent", () => {
    expect(parseConsent("{")).toBeNull();
    expect(parseConsent(null)).toBeNull();
  });
});
