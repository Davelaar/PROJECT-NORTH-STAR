import { describe, expect, it } from "vitest";
import { applySpoolUsage, deriveRemainingPercent } from "./local-db";

describe("deriveRemainingPercent", () => {
  it("derives remaining filament from current weight minus tare", () => {
    expect(
      deriveRemainingPercent({
        initialNetWeightG: 1000,
        currentWeightG: 650,
        tareWeightG: 150,
      }),
    ).toBe(50);
  });

  it("clamps remaining percent to 0-100", () => {
    expect(
      deriveRemainingPercent({
        initialNetWeightG: 1000,
        currentWeightG: 1400,
        tareWeightG: 150,
      }),
    ).toBe(100);
    expect(
      deriveRemainingPercent({
        initialNetWeightG: 1000,
        currentWeightG: 100,
        tareWeightG: 150,
      }),
    ).toBe(0);
  });
});

describe("applySpoolUsage", () => {
  it("subtracts used grams and refreshes percentage", () => {
    expect(
      applySpoolUsage(
        {
          initialNetWeightG: 1000,
          currentWeightG: 650,
          tareWeightG: 150,
          remainingPercent: 50,
        },
        100,
      ),
    ).toEqual({ currentWeightG: 550, remainingPercent: 40 });
  });
});
