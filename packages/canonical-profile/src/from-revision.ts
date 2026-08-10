import {
  openFilamentProfileV1Schema,
  SCHEMA_VERSION,
  type OpenFilamentProfileV1,
} from "./schema-v1.js";

/** Flat revision / join row used to build a canonical profile document. */
export type RevisionSource = {
  uuid?: string | null;
  title?: string | null;
  isSyntheticFixture?: boolean | null;
  notes?: string | null;
  createdAt?: string | null;
  slicerName?: string | null;
  slicerVersion?: string | null;
  manufacturerName?: string | null;
  productName?: string | null;
  variantName?: string | null;
  materialCode?: string | null;
  diameterMm?: number | null;
  colorName?: string | null;
  primaryColorHex?: string | null;
  densityGCm3?: number | null;
  printerManufacturer?: string | null;
  printerModel?: string | null;
  printerRevision?: string | null;
  nozzleDiameterMm?: number | null;
  nozzleMaterial?: string | null;
  buildPlate?: string | null;
  nozzleTempFirstLayerC?: number | null;
  nozzleTempOtherLayersC?: number | null;
  nozzleTempMinC?: number | null;
  nozzleTempMaxC?: number | null;
  bedTempFirstLayerC?: number | null;
  bedTempOtherLayersC?: number | null;
  chamberTempC?: number | null;
  enclosureRecommended?: boolean | null;
  flowRatio?: number | null;
  pressureAdvance?: number | null;
  linearAdvance?: number | null;
  maxVolumetricFlowMm3s?: number | null;
  minVolumetricFlowMm3s?: number | null;
  fanMinPercent?: number | null;
  fanMaxPercent?: number | null;
  bridgeFanPercent?: number | null;
  fanDisableFirstLayers?: number | null;
  retractionDistanceMm?: number | null;
  retractionSpeedMms?: number | null;
  deretractionSpeedMms?: number | null;
  wipe?: boolean | null;
  zHopMm?: number | null;
  dryingTempC?: number | null;
  dryingDurationHours?: number | null;
  recommendedMaxRhPercent?: number | null;
  prePrintDryingRequired?: boolean | null;
  annealingNotes?: string | null;
  postProcessingNotes?: string | null;
  adhesiveRecommendation?: string | null;
  brimRecommended?: boolean | null;
  buildSurfaceNotes?: string | null;
};

function n(v: number | null | undefined): number | null {
  return v == null ? null : v;
}

/**
 * Map a calibration revision (+ optional joined catalog fields) into
 * OpenFilamentProfile v1. Nulls preserved; never coerced to 0.
 */
export function toCanonicalFromRevision(
  source: RevisionSource,
): OpenFilamentProfileV1 {
  const doc: OpenFilamentProfileV1 = {
    schemaVersion: SCHEMA_VERSION,
    id: source.uuid ?? undefined,
    title: source.title?.trim() || "Untitled profile",
    provenance: {
      isSyntheticFixture: Boolean(source.isSyntheticFixture),
      sourceNotes: source.notes ?? null,
      createdAt: source.createdAt ?? null,
    },
    filament: {
      manufacturerName: source.manufacturerName ?? null,
      productName: source.productName ?? null,
      variantName: source.variantName ?? null,
      materialCode: source.materialCode ?? null,
      diameterMm: n(source.diameterMm),
      colorName: source.colorName ?? null,
      primaryColorHex: source.primaryColorHex ?? null,
      densityGCm3: n(source.densityGCm3),
    },
    context: {
      printerManufacturer: source.printerManufacturer ?? null,
      printerModel: source.printerModel ?? null,
      printerRevision: source.printerRevision ?? null,
      nozzleDiameterMm: n(source.nozzleDiameterMm),
      nozzleMaterial: source.nozzleMaterial ?? null,
      buildPlate: source.buildPlate ?? null,
      slicerName: source.slicerName ?? null,
      slicerVersion: source.slicerVersion ?? null,
    },
    thermal: {
      nozzleTempFirstLayerC: n(source.nozzleTempFirstLayerC),
      nozzleTempOtherLayersC: n(source.nozzleTempOtherLayersC),
      nozzleTempMinC: n(source.nozzleTempMinC),
      nozzleTempMaxC: n(source.nozzleTempMaxC),
      bedTempFirstLayerC: n(source.bedTempFirstLayerC),
      bedTempOtherLayersC: n(source.bedTempOtherLayersC),
      chamberTempC: n(source.chamberTempC),
      enclosureRecommended: source.enclosureRecommended ?? null,
    },
    extrusion: {
      flowRatio: n(source.flowRatio),
      pressureAdvance: n(source.pressureAdvance),
      linearAdvance: n(source.linearAdvance),
      maxVolumetricFlowMm3s: n(source.maxVolumetricFlowMm3s),
      minVolumetricFlowMm3s: n(source.minVolumetricFlowMm3s),
    },
    cooling: {
      fanMinPercent: n(source.fanMinPercent),
      fanMaxPercent: n(source.fanMaxPercent),
      bridgeFanPercent: n(source.bridgeFanPercent),
      fanDisableFirstLayers: source.fanDisableFirstLayers ?? null,
    },
    retraction: {
      retractionDistanceMm: n(source.retractionDistanceMm),
      retractionSpeedMms: n(source.retractionSpeedMms),
      deretractionSpeedMms: n(source.deretractionSpeedMms),
      wipe: source.wipe ?? null,
      zHopMm: n(source.zHopMm),
    },
    preparation: {
      dryingTempC: n(source.dryingTempC),
      dryingDurationHours: n(source.dryingDurationHours),
      recommendedMaxRhPercent: n(source.recommendedMaxRhPercent),
      prePrintDryingRequired: source.prePrintDryingRequired ?? null,
      annealingNotes: source.annealingNotes ?? null,
      postProcessingNotes: source.postProcessingNotes ?? null,
      adhesiveRecommendation: source.adhesiveRecommendation ?? null,
      brimRecommended: source.brimRecommended ?? null,
      buildSurfaceNotes: source.buildSurfaceNotes ?? null,
    },
  };
  return openFilamentProfileV1Schema.parse(doc);
}
