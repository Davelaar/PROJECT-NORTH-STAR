import { describe, expect, it } from "vitest";
import { computeQualityScore } from "./quality.js";

describe("computeQualityScore", () => {
  it("scores empty low and full high", () => {
    const empty = computeQualityScore({});
    expect(empty.score).toBeLessThan(0.5);
    const full = computeQualityScore({
      nozzleTempOtherLayersC: 255,
      flowRatio: 0.95,
      pressureAdvance: 0.03,
      maxVolumetricFlowMm3s: 28,
      filamentDryingState: "dried",
      hasEvidence: true,
      confirmationCount: 5,
      exactPrinterMatch: true,
      exactNozzleMatch: true,
    });
    expect(full.score).toBe(1);
  });
});
