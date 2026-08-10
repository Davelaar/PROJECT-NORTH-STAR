import { describe, expect, it } from "vitest";
import {
  applySpoolUsage,
  buildManualUsageTransaction,
  deriveRemainingPercent,
} from "./local-db";

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

describe("buildManualUsageTransaction", () => {
  it("records used grams as a manual correction in grams", () => {
    const result = buildManualUsageTransaction({
      spool: {
        uuid: "spool-1",
        initialNetWeightG: 1000,
        currentWeightG: 650,
        tareWeightG: 150,
        remainingPercent: 50,
        materialCode: "PLA",
      },
      amountG: 100,
      mode: "used",
      now: "2026-08-10T00:00:00.000Z",
      uuid: "tx-1",
    });
    expect(result.currentWeightG).toBe(550);
    expect(result.remainingPercent).toBe(40);
    expect(result.transaction.deducted.weightG).toBe(100);
    expect(result.transaction.usageSource).toBe("manual_correction");
    expect(result.transaction.originalValues).toMatchObject({ amountG: 100, mode: "used" });
  });

  it("records added grams as a compensating adjustment", () => {
    const result = buildManualUsageTransaction({
      spool: {
        uuid: "spool-1",
        initialNetWeightG: 1000,
        currentWeightG: 550,
        tareWeightG: 150,
        remainingPercent: 40,
        materialCode: "PLA",
      },
      amountG: 50,
      mode: "added",
      uuid: "tx-2",
    });
    expect(result.currentWeightG).toBe(600);
    expect(result.remainingPercent).toBe(45);
    expect(result.transaction.deducted.weightG).toBe(-50);
  });
});
