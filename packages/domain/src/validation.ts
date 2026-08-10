import { z } from "zod";

/** Unknown values must be null/absent — never 0 as a sentinel. */
export const optionalPositive = z.number().positive().nullable().optional();
export const optionalNonNegative = z.number().min(0).nullable().optional();

export const calibrationParametersSchema = z.object({
  nozzleTempFirstLayerC: z.number().min(150).max(450).nullable().optional(),
  nozzleTempOtherLayersC: z.number().min(150).max(450).nullable().optional(),
  nozzleTempMinC: z.number().min(150).max(450).nullable().optional(),
  nozzleTempMaxC: z.number().min(150).max(450).nullable().optional(),
  bedTempFirstLayerC: z.number().min(0).max(200).nullable().optional(),
  bedTempOtherLayersC: z.number().min(0).max(200).nullable().optional(),
  chamberTempC: z.number().min(0).max(120).nullable().optional(),
  enclosureRecommended: z.boolean().nullable().optional(),
  flowRatio: z.number().min(0.5).max(1.5).nullable().optional(),
  pressureAdvance: z.number().min(0).max(2).nullable().optional(),
  linearAdvance: z.number().min(0).max(10).nullable().optional(),
  maxVolumetricFlowMm3s: z.number().positive().max(100).nullable().optional(),
  minVolumetricFlowMm3s: z.number().positive().max(100).nullable().optional(),
  fanMinPercent: z.number().min(0).max(100).nullable().optional(),
  fanMaxPercent: z.number().min(0).max(100).nullable().optional(),
  bridgeFanPercent: z.number().min(0).max(100).nullable().optional(),
  fanDisableFirstLayers: z.number().int().min(0).max(20).nullable().optional(),
  retractionDistanceMm: z.number().min(0).max(10).nullable().optional(),
  retractionSpeedMms: z.number().min(0).max(120).nullable().optional(),
  deretractionSpeedMms: z.number().min(0).max(120).nullable().optional(),
  wipe: z.boolean().nullable().optional(),
  zHopMm: z.number().min(0).max(5).nullable().optional(),
  recommendedOuterWallMaxMms: z.number().positive().nullable().optional(),
  recommendedBridgeSpeedMms: z.number().positive().nullable().optional(),
  dryingTempC: z.number().min(0).max(150).nullable().optional(),
  dryingDurationHours: z.number().min(0).max(72).nullable().optional(),
  recommendedMaxRhPercent: z.number().min(0).max(100).nullable().optional(),
  prePrintDryingRequired: z.boolean().nullable().optional(),
  annealingNotes: z.string().nullable().optional(),
  postProcessingNotes: z.string().nullable().optional(),
  adhesiveRecommendation: z.string().nullable().optional(),
  brimRecommended: z.boolean().nullable().optional(),
  buildSurfaceNotes: z.string().nullable().optional(),
});

export type CalibrationParameters = z.infer<typeof calibrationParametersSchema>;

export function validateAgainstPrinterLimits(
  params: CalibrationParameters,
  limits: { maxNozzleTempC?: number | null; maxBedTempC?: number | null },
): { ok: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];
  const nozzleTemps = [
    params.nozzleTempFirstLayerC,
    params.nozzleTempOtherLayersC,
    params.nozzleTempMaxC,
  ].filter((v): v is number => v != null);
  for (const t of nozzleTemps) {
    if (limits.maxNozzleTempC != null && t > limits.maxNozzleTempC) {
      errors.push(
        `Nozzle temperature ${t}°C exceeds printer max ${limits.maxNozzleTempC}°C`,
      );
    }
    if (t >= 400) {
      errors.push(`Nozzle temperature ${t}°C is physically unreasonable`);
    }
  }
  const bedTemps = [
    params.bedTempFirstLayerC,
    params.bedTempOtherLayersC,
  ].filter((v): v is number => v != null);
  for (const t of bedTemps) {
    if (limits.maxBedTempC != null && t > limits.maxBedTempC) {
      warnings.push(
        `Bed temperature ${t}°C exceeds printer max ${limits.maxBedTempC}°C`,
      );
    }
  }
  return { ok: errors.length === 0, warnings, errors };
}

export const failureCategories = [
  "poor_bed_adhesion",
  "under_extrusion",
  "over_extrusion",
  "stringing",
  "poor_bridging",
  "overheating",
  "warping",
  "clogging",
  "dimensional_problems",
  "weak_layer_adhesion",
  "other",
] as const;

export type FailureCategory = (typeof failureCategories)[number];
