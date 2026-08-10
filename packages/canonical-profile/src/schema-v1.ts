import { z } from "zod";

/**
 * OpenFilamentProfile v1 — portable canonical calibration document.
 * Unknown numeric values must be null, never sentinel zeros.
 */
export const openFilamentProfileV1Schema = z.object({
  schemaVersion: z.literal("openfilamentprofile-v1"),
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  provenance: z.object({
    isSyntheticFixture: z.boolean().default(false),
    sourceNotes: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
  }),
  filament: z.object({
    manufacturerName: z.string().nullable().optional(),
    productName: z.string().nullable().optional(),
    variantName: z.string().nullable().optional(),
    materialCode: z.string().nullable().optional(),
    diameterMm: z.number().positive().nullable().optional(),
    colorName: z.string().nullable().optional(),
    primaryColorHex: z.string().nullable().optional(),
    densityGCm3: z.number().positive().nullable().optional(),
  }),
  context: z.object({
    printerManufacturer: z.string().nullable().optional(),
    printerModel: z.string().nullable().optional(),
    printerRevision: z.string().nullable().optional(),
    nozzleDiameterMm: z.number().positive().nullable().optional(),
    nozzleMaterial: z.string().nullable().optional(),
    buildPlate: z.string().nullable().optional(),
    slicerName: z.string().nullable().optional(),
    slicerVersion: z.string().nullable().optional(),
  }),
  thermal: z.object({
    nozzleTempFirstLayerC: z.number().nullable().optional(),
    nozzleTempOtherLayersC: z.number().nullable().optional(),
    nozzleTempMinC: z.number().nullable().optional(),
    nozzleTempMaxC: z.number().nullable().optional(),
    bedTempFirstLayerC: z.number().nullable().optional(),
    bedTempOtherLayersC: z.number().nullable().optional(),
    chamberTempC: z.number().nullable().optional(),
    enclosureRecommended: z.boolean().nullable().optional(),
  }),
  extrusion: z.object({
    flowRatio: z.number().nullable().optional(),
    pressureAdvance: z.number().nullable().optional(),
    linearAdvance: z.number().nullable().optional(),
    maxVolumetricFlowMm3s: z.number().nullable().optional(),
    minVolumetricFlowMm3s: z.number().nullable().optional(),
  }),
  dimensional: z
    .object({
      shrinkagePercentXy: z.number().nullable().optional(),
      shrinkagePercentZ: z.number().nullable().optional(),
    })
    .optional(),
  cooling: z.object({
    fanMinPercent: z.number().nullable().optional(),
    fanMaxPercent: z.number().nullable().optional(),
    bridgeFanPercent: z.number().nullable().optional(),
    fanDisableFirstLayers: z.number().int().nullable().optional(),
  }),
  retraction: z.object({
    retractionDistanceMm: z.number().nullable().optional(),
    retractionSpeedMms: z.number().nullable().optional(),
    deretractionSpeedMms: z.number().nullable().optional(),
    wipe: z.boolean().nullable().optional(),
    zHopMm: z.number().nullable().optional(),
  }),
  preparation: z.object({
    dryingTempC: z.number().nullable().optional(),
    dryingDurationHours: z.number().nullable().optional(),
    recommendedMaxRhPercent: z.number().nullable().optional(),
    prePrintDryingRequired: z.boolean().nullable().optional(),
    annealingNotes: z.string().nullable().optional(),
    postProcessingNotes: z.string().nullable().optional(),
    adhesiveRecommendation: z.string().nullable().optional(),
    brimRecommended: z.boolean().nullable().optional(),
    buildSurfaceNotes: z.string().nullable().optional(),
  }),
  extensions: z
    .object({
      creality: z.record(z.unknown()).optional(),
      orca: z.record(z.unknown()).optional(),
      unknown: z.record(z.unknown()).optional(),
    })
    .optional(),
});

export type OpenFilamentProfileV1 = z.infer<typeof openFilamentProfileV1Schema>;

export const SCHEMA_VERSION = "openfilamentprofile-v1" as const;
