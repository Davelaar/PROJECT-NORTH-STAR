import type { OpenFilamentProfileV1 } from "@open-filament/canonical-profile";

export type CrealityConvertOpts = {
  /** e.g. 0.6 — defaults from canonical context or 0.4 */
  nozzleDiameterMm?: number;
  /** e.g. "K2 Plus" */
  printerModel?: string;
  /** Override inherits chain */
  inherits?: string;
  /** Creality base_id — defaults to GFSA04 (observed on real user wrappers) */
  baseId?: string;
  /** Creality Print version string */
  version?: string;
  /** Prefer HP-* system presets for ASA when true (default true) */
  preferHpForAsa?: boolean;
};

function asStringArray(value: string | number | null | undefined): string[] | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  return [String(value)];
}

function formatNozzle(mm: number): string {
  const s = Number.isInteger(mm) ? String(mm) : String(mm);
  // Prefer one decimal when needed: 0.6
  if (s.includes(".")) return s;
  return `${s}.0`;
}

function normalizeMaterial(code: string | null | undefined): string {
  return (code ?? "PLA").trim().toUpperCase().replace(/\s+/g, "-");
}

function pickInherits(
  material: string,
  printerModel: string,
  nozzle: string,
  preferHpForAsa: boolean,
  nozzleKnown: boolean,
): string {
  const host = `Creality ${printerModel} ${nozzle} nozzle`;
  const m = material.toUpperCase();

  if (m === "ASA" || m.startsWith("ASA-")) {
    if (preferHpForAsa && nozzleKnown) {
      return `HP-ASA @${host}`;
    }
    return `Generic ASA @Creality ${printerModel} 0.4 nozzle`;
  }
  if (m === "PLA" || m === "PLA-SILK") {
    return `Generic PLA @${host}`;
  }
  if (m === "PLA-CF") {
    return `Generic PLA-CF @Creality ${printerModel} 0.4 nozzle`;
  }
  if (m === "PETG" || m.startsWith("PETG")) {
    return `Generic PETG @${host}`;
  }
  if (m === "ABS") {
    return `Generic ABS @${host}`;
  }
  if (m === "TPU") {
    return `Generic TPU @Creality ${printerModel} 0.4 nozzle`;
  }
  // Fallback: Generic + material @ host (may not exist for exotic types)
  return `Generic ${material} @${host}`;
}

export function suggestCompatiblePrinter(
  canonical: OpenFilamentProfileV1,
  opts?: Pick<CrealityConvertOpts, "nozzleDiameterMm" | "printerModel">,
): string {
  const model =
    opts?.printerModel ??
    canonical.context.printerModel?.replace(/^Creality\s+/i, "") ??
    "K2 Plus";
  const nozzleMm =
    opts?.nozzleDiameterMm ??
    canonical.context.nozzleDiameterMm ??
    0.4;
  return `Creality ${model} ${formatNozzle(nozzleMm)} nozzle`;
}

export function buildCrealityInfoFile(input: {
  userId: string;
  settingId: string;
  baseId?: string;
  updatedTime?: number;
}): string {
  const updated = input.updatedTime ?? Math.floor(Date.now() / 1000);
  return [
    "sync_info = ",
    `user_id = ${input.userId}`,
    `setting_id = ${input.settingId}`,
    `base_id = ${input.baseId ?? "GFSA04"}`,
    `updated_time = ${updated}`,
    "",
  ].join("\n");
}

function buildPresetName(
  canonical: OpenFilamentProfileV1,
  printerHint: string,
): string {
  const parts = [
    canonical.filament.manufacturerName,
    canonical.filament.productName,
    canonical.filament.variantName,
  ].filter(Boolean);
  const head =
    parts.length > 0 ? parts.join(" ") : canonical.title.replace(/^OF\s+/i, "");
  return `${head} @${printerHint}`;
}

/**
 * Convert canonical profile → Creality Print **user wrapper** JSON
 * (string-array overrides + inherits), matching observed Creality Print 7.0 files.
 */
export function convertCanonicalToCrealityUserPreset(
  canonical: OpenFilamentProfileV1,
  opts: CrealityConvertOpts = {},
): Record<string, unknown> {
  const printerModel =
    opts.printerModel ??
    canonical.context.printerModel?.replace(/^Creality\s+/i, "") ??
    "K2 Plus";
  const nozzleMm =
    opts.nozzleDiameterMm ?? canonical.context.nozzleDiameterMm ?? 0.4;
  const nozzleKnown =
    opts.nozzleDiameterMm != null ||
    canonical.context.nozzleDiameterMm != null;
  const nozzle = formatNozzle(nozzleMm);
  const printerHint = `Creality ${printerModel} ${nozzle} nozzle`;
  const material = normalizeMaterial(canonical.filament.materialCode);
  const preferHp = opts.preferHpForAsa !== false;
  const inherits =
    opts.inherits ??
    pickInherits(material, printerModel, nozzle, preferHp, nozzleKnown);
  const name = buildPresetName(canonical, printerHint);

  const nozzleTemp =
    canonical.thermal.nozzleTempOtherLayersC ??
    canonical.thermal.nozzleTempFirstLayerC;
  const bedTemp =
    canonical.thermal.bedTempOtherLayersC ??
    canonical.thermal.bedTempFirstLayerC;

  const preset: Record<string, unknown> = {
    base_id: opts.baseId ?? "GFSA04",
    from: "User",
    inherits,
    is_custom_defined: "0",
    name,
    version: opts.version ?? "26.7.1.21",
  };

  const filamentSettingsId = asStringArray(name);
  if (filamentSettingsId) preset.filament_settings_id = filamentSettingsId;

  const vendor = asStringArray(canonical.filament.manufacturerName);
  if (vendor) preset.filament_vendor = vendor;

  const filamentType = asStringArray(canonical.filament.materialCode);
  if (filamentType) preset.filament_type = filamentType;

  const colour = asStringArray(canonical.filament.primaryColorHex);
  if (colour) preset.default_filament_colour = colour;

  const density = asStringArray(canonical.filament.densityGCm3);
  if (density) preset.filament_density = density;

  const diameter = asStringArray(canonical.filament.diameterMm);
  if (diameter) preset.filament_diameter = diameter;

  const maxVol = asStringArray(canonical.extrusion.maxVolumetricFlowMm3s);
  if (maxVol) preset.filament_max_volumetric_speed = maxVol;

  const flow = asStringArray(canonical.extrusion.flowRatio);
  if (flow) preset.filament_flow_ratio = flow;

  const pa = asStringArray(canonical.extrusion.pressureAdvance);
  if (pa) preset.pressure_advance = pa;

  if (nozzleTemp != null) {
    preset.nozzle_temperature = asStringArray(nozzleTemp);
  }
  if (canonical.thermal.nozzleTempFirstLayerC != null) {
    preset.nozzle_temperature_initial_layer = asStringArray(
      canonical.thermal.nozzleTempFirstLayerC,
    );
  }
  if (canonical.thermal.nozzleTempMaxC != null) {
    preset.nozzle_temperature_range_high = asStringArray(
      canonical.thermal.nozzleTempMaxC,
    );
  }
  if (canonical.thermal.nozzleTempMinC != null) {
    preset.nozzle_temperature_range_low = asStringArray(
      canonical.thermal.nozzleTempMinC,
    );
  }

  if (bedTemp != null) {
    preset.textured_plate_temp = asStringArray(bedTemp);
    preset.hot_plate_temp = asStringArray(bedTemp);
  }
  if (canonical.thermal.bedTempFirstLayerC != null) {
    preset.textured_plate_temp_initial_layer = asStringArray(
      canonical.thermal.bedTempFirstLayerC,
    );
    preset.hot_plate_temp_initial_layer = asStringArray(
      canonical.thermal.bedTempFirstLayerC,
    );
  }

  const fanMin = asStringArray(canonical.cooling.fanMinPercent);
  if (fanMin) preset.fan_min_speed = fanMin;
  const fanMax = asStringArray(canonical.cooling.fanMaxPercent);
  if (fanMax) preset.fan_max_speed = fanMax;
  const bridgeFan = asStringArray(canonical.cooling.bridgeFanPercent);
  if (bridgeFan) preset.bridge_fan_speed = bridgeFan;
  const closeFan = asStringArray(canonical.cooling.fanDisableFirstLayers);
  if (closeFan) preset.close_fan_the_first_x_layers = closeFan;

  const retract = asStringArray(canonical.retraction.retractionDistanceMm);
  if (retract) preset.filament_retraction_length = retract;
  const retractSpeed = asStringArray(canonical.retraction.retractionSpeedMms);
  if (retractSpeed) preset.filament_retraction_speed = retractSpeed;

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

export function suggestedCrealityFileName(
  canonical: OpenFilamentProfileV1,
  opts?: CrealityConvertOpts,
): string {
  const preset = convertCanonicalToCrealityUserPreset(canonical, opts);
  return `${String(preset.name)}.json`;
}

function firstString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  if (Array.isArray(v) && typeof v[0] === "number") return String(v[0]);
  if (typeof v === "number") return String(v);
  return null;
}

function firstNumber(v: unknown): number | null {
  const s = firstString(v);
  if (s == null || s === "" || s === "nil") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Map a Creality Print user filament preset JSON toward canonical fields.
 * Does not invent missing context; returns a partial suitable for draft import.
 */
export function convertCrealityUserPresetToCanonicalPartial(
  preset: Record<string, unknown>,
): {
  title: string;
  filament: {
    manufacturerName: string | null;
    materialCode: string | null;
    variantName: string | null;
    primaryColorHex: string | null;
    diameterMm: number | null;
    densityGCm3: number | null;
  };
  context: {
    printerHint: string | null;
    nozzleDiameterMm: number | null;
  };
  thermal: Record<string, number | null>;
  extrusion: Record<string, number | null>;
  cooling: Record<string, number | null>;
  retraction: Record<string, number | null>;
  inherits: string | null;
  notes: string | null;
} {
  const name = firstString(preset.name) ?? "Imported Creality preset";
  const printerHint = name.includes("@")
    ? name.split("@").slice(1).join("@").trim()
    : firstString(preset.compatible_printers);
  let nozzleDiameterMm: number | null = null;
  if (printerHint) {
    const m = printerHint.match(/(\d+(?:\.\d+)?)\s*nozzle/i);
    if (m) nozzleDiameterMm = Number(m[1]);
  }
  return {
    title: name,
    filament: {
      manufacturerName: firstString(preset.filament_vendor),
      materialCode: firstString(preset.filament_type),
      variantName: name.split("@")[0]?.trim() ?? name,
      primaryColorHex:
        firstString(preset.default_filament_colour) ??
        firstString(preset.filament_colour),
      diameterMm: firstNumber(preset.filament_diameter),
      densityGCm3: firstNumber(preset.filament_density),
    },
    context: { printerHint, nozzleDiameterMm },
    thermal: {
      nozzleTempOtherLayersC: firstNumber(preset.nozzle_temperature),
      nozzleTempFirstLayerC: firstNumber(
        preset.nozzle_temperature_initial_layer,
      ),
      bedTempOtherLayersC:
        firstNumber(preset.textured_plate_temp) ??
        firstNumber(preset.hot_plate_temp),
      bedTempFirstLayerC:
        firstNumber(preset.textured_plate_temp_initial_layer) ??
        firstNumber(preset.hot_plate_temp_initial_layer),
      chamberTempC: firstNumber(preset.chamber_temperature),
    },
    extrusion: {
      flowRatio: firstNumber(preset.filament_flow_ratio),
      pressureAdvance: firstNumber(preset.pressure_advance),
      maxVolumetricFlowMm3s: firstNumber(preset.filament_max_volumetric_speed),
    },
    cooling: {
      fanMinPercent: firstNumber(preset.fan_min_speed),
      fanMaxPercent: firstNumber(preset.fan_max_speed),
      bridgeFanPercent: firstNumber(preset.bridge_fan_speed),
      fanDisableFirstLayers: firstNumber(preset.close_fan_the_first_x_layers),
    },
    retraction: {
      retractionDistanceMm: firstNumber(preset.filament_retraction_length),
      retractionSpeedMms: firstNumber(preset.filament_retraction_speed),
    },
    inherits: firstString(preset.inherits),
    notes: firstString(preset.filament_notes),
  };
}
