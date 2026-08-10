import { describe, expect, it } from "vitest";
import { LOCALES } from "./messages";
import { getUsageTrackingCopy } from "./usage-tracking-copy";

describe("usage tracking copy", () => {
  it("has non-empty copy for every supported locale", () => {
    for (const locale of LOCALES) {
      const copy = getUsageTrackingCopy(locale);
      expect(copy.title, locale).toBeTruthy();
      expect(copy.centralRule, locale).toMatch(/actual|werkelijk|tatsäch|réel|real|фактич|фактичес|实际/i);
      expect(copy.cloudDisclosures.length, locale).toBeGreaterThanOrEqual(6);
      expect(copy.statusLabels.unverified, locale).toBeTruthy();
    }
  });

  it("does not overclaim automatic actual usage from estimates", () => {
    const allCopy = LOCALES.map((locale) =>
      JSON.stringify(getUsageTrackingCopy(locale)),
    ).join("\n");
    expect(allCopy).not.toMatch(/exact usage/i);
    expect(allCopy).not.toMatch(/automatic actual usage/i);
    expect(allCopy).not.toMatch(/automatically measure actual/i);
  });
});
