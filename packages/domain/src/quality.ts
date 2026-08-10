export function computeQualityScore(input: {
  nozzleTempOtherLayersC?: number | null;
  flowRatio?: number | null;
  pressureAdvance?: number | null;
  maxVolumetricFlowMm3s?: number | null;
  filamentDryingState?: string | null;
  hasEvidence?: boolean;
  confirmationCount?: number;
  exactPrinterMatch?: boolean;
  exactNozzleMatch?: boolean;
}): { score: number; dimensions: Record<string, number> } {
  const dimensions: Record<string, number> = {
    thermalCalibrated: input.nozzleTempOtherLayersC != null ? 1 : 0,
    flowCalibrated: input.flowRatio != null ? 1 : 0,
    paCalibrated: input.pressureAdvance != null ? 1 : 0,
    maxFlowCalibrated: input.maxVolumetricFlowMm3s != null ? 1 : 0,
    dryingStateKnown: input.filamentDryingState ? 1 : 0,
    evidenceAvailable: input.hasEvidence ? 1 : 0,
    confirmations: Math.min(1, (input.confirmationCount ?? 0) / 5),
    exactPrinterMatch: input.exactPrinterMatch === false ? 0 : 1,
    exactNozzleMatch: input.exactNozzleMatch === false ? 0 : 1,
  };
  const values = Object.values(dimensions);
  const score = values.reduce((a, b) => a + b, 0) / values.length;
  return { score: Math.round(score * 1000) / 1000, dimensions };
}
