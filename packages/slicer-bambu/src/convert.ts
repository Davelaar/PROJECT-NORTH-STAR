import type { OpenFilamentProfileV1 } from "@open-filament/canonical-profile";

export type BambuConvertOpts = {
  nozzleDiameterMm?: number;
  printerModel?: string;
  inherits?: string;
};

function asStringArray(value: string | number | null | undefined): string[] | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  return [String(value)];
}

function normalizeMaterial(code: string | null | undefined): string {
  return (code ?? "PLA").trim().toUpperCase().replace(/\s+/g, "-");
}

/**
 * Bambu Studio user filaments commonly inherit Generic {MATERIAL}.
 * When a printer model is known, prefer Generic {MATERIAL} @{printer}.
 */
function pickBambuInherits(material: string, printerModel?: string): string {
  const m = material.toUpperCase();
  let base = `Generic ${material}`;
  if (m === "ASA" || m.startsWith("ASA-")) base = "Generic ASA";
  else if (m === "PLA" || m === "PLA-SILK") base = "Generic PLA";
  else if (m === "PLA-CF") base = "Generic PLA-CF";
  else if (m === "PETG" || m.startsWith("PETG")) base = "Generic PETG";
  else if (m === "ABS") base = "Generic ABS";
  else if (m === "TPU") base = "Generic TPU";

  if (printerModel && printerModel.trim()) {
    return `${base} @${printerModel.trim()}`;
  }
  return base;
}

function buildName(
  canonical: OpenFilamentProfileV1,
  printerModel?: string,
): string {
  const parts = [
    canonical.filament.manufacturerName,
    canonical.filament.productName,
    canonical.filament.variantName,
  ].filter(Boolean);
  const head =
    parts.length > 0 ? parts.join(" ") : canonical.title.replace(/^OF\s+/i, "");
  if (printerModel) return `${head} @${printerModel}`;
  return head;
}

/**
 * Convert canonical → Bambu Studio filament user preset JSON.
 * Format is SoftFever/Orca-family (string arrays + inherits).
 */
export function convertCanonicalToBambuFilamentPreset(
  canonical: OpenFilamentProfileV1,
  opts: BambuConvertOpts = {},
): Record<string, unknown> {
  const printerModel =
    opts.printerModel ??
    canonical.context.printerModel?.replace(/^Bambu Lab\s+/i, "") ??
    undefined;
  const material = normalizeMaterial(canonical.filament.materialCode);
  const inherits =
    opts.inherits ?? pickBambuInherits(material, printerModel);
  const name = buildName(canonical, printerModel);

  const nozzleTemp =
    canonical.thermal.nozzleTempOtherLayersC ??
    canonical.thermal.nozzleTempFirstLayerC;
  const bedTemp =
    canonical.thermal.bedTempOtherLayersC ??
    canonical.thermal.bedTempFirstLayerC;

  const preset: Record<string, unknown> = {
    type: "filament",
    name,
    from: "User",
    instantiation: "true",
    inherits,
  };

  const settingsId = asStringArray(name);
  if (settingsId) preset.filament_settings_id = settingsId;

  const vendor = asStringArray(canonical.filament.manufacturerName);
  if (vendor) preset.filament_vendor = vendor;

  const filamentType = asStringArray(canonical.filament.materialCode);
  if (filamentType) preset.filament_type = filamentType;

  const colour = asStringArray(canonical.filament.primaryColorHex);
  if (colour) preset.default_filament_colour = colour;

  const density = asStringArray(canonical.filament.densityGCm3);
  if (density) preset.filament_density = density;

  const diameter = asStringArray(canonical.filament.diameterMm ?? 1.75);
  if (diameter) preset.filament_diameter = diameter;

  const maxVol = asStringArray(canonical.extrusion.maxVolumetricFlowMm3s);
  if (maxVol) preset.filament_max_volumetric_speed = maxVol;

  const flow = asStringArray(canonical.extrusion.flowRatio);
  if (flow) preset.filament_flow_ratio = flow;

  const pa = asStringArray(canonical.extrusion.pressureAdvance);
  if (pa) preset.pressure_advance = pa;

  if (nozzleTemp != null) preset.nozzle_temperature = asStringArray(nozzleTemp);
  if (canonical.thermal.nozzleTempFirstLayerC != null) {
    preset.nozzle_temperature_initial_layer = asStringArray(
      canonical.thermal.nozzleTempFirstLayerC,
    );
  }
  if (bedTemp != null) {
    preset.hot_plate_temp = asStringArray(bedTemp);
    preset.textured_plate_temp = asStringArray(bedTemp);
    preset.eng_plate_temp = asStringArray(bedTemp);
  }
  if (canonical.thermal.bedTempFirstLayerC != null) {
    preset.hot_plate_temp_initial_layer = asStringArray(
      canonical.thermal.bedTempFirstLayerC,
    );
  }

  const fanMin = asStringArray(canonical.cooling.fanMinPercent);
  if (fanMin) preset.fan_min_speed = fanMin;
  const fanMax = asStringArray(canonical.cooling.fanMaxPercent);
  if (fanMax) preset.fan_max_speed = fanMax;
  const closeFan = asStringArray(canonical.cooling.fanDisableFirstLayers);
  if (closeFan) preset.close_fan_the_first_x_layers = closeFan;

  const retract = asStringArray(canonical.retraction.retractionDistanceMm);
  if (retract) preset.filament_retraction_length = retract;

  if (canonical.thermal.chamberTempC != null) {
    preset.chamber_temperature = asStringArray(canonical.thermal.chamberTempC);
  }
  const shrinkXy = asStringArray(canonical.dimensional?.shrinkagePercentXy);
  if (shrinkXy) {
    preset.shrinkage = shrinkXy;
    preset.filament_shrinkage = shrinkXy;
  }
  const shrinkZ = asStringArray(canonical.dimensional?.shrinkagePercentZ);
  if (shrinkZ) preset.shrinkage_z = shrinkZ;

  const notes: string[] = ["Open Filament user preset"];
  if (canonical.provenance.isSyntheticFixture) {
    notes.push("Source: seed catalog data");
  }
  if (canonical.provenance.sourceNotes) {
    notes.push(canonical.provenance.sourceNotes);
  }
  preset.filament_notes = [notes.join(" — ")];

  return preset;
}

export function suggestedBambuFileName(
  canonical: OpenFilamentProfileV1,
  opts?: BambuConvertOpts,
): string {
  const preset = convertCanonicalToBambuFilamentPreset(canonical, opts);
  return `${String(preset.name)}.json`;
}
