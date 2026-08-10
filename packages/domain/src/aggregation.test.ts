import { describe, expect, it } from "vitest";
import { aggregateMetric } from "./aggregation.js";

describe("aggregateMetric", () => {
  it("excludes the obvious outlier from the spec example", () => {
    const result = aggregateMetric(
      [29, 30, 31, 31, 45].map((value) => ({ value })),
    );
    expect(result.excludedOutlierCount).toBe(1);
    expect(result.excludedValues).toEqual([45]);
    expect(result.recommended).toBe(30.5);
    expect(result.observedMin).toBe(29);
    expect(result.observedMax).toBe(31);
    expect(result.confidence).toBe("high");
  });

  it("treats empty as insufficient", () => {
    const result = aggregateMetric([]);
    expect(result.recommended).toBeNull();
    expect(result.confidence).toBe("insufficient");
  });
});
