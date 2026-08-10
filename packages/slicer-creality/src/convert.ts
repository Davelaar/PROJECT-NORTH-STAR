import type { OpenFilamentProfileV1 } from "@open-filament/canonical-profile";

const UNKNOWN = "UNKNOWN";
const SYNTHETIC_MARK =
  "SYNTHETIC_OR_UNVERIFIED — Open Filament adapter; not a Creality system preset";

/**
 * Convert a canonical OpenFilamentProfile into a Creality Print / Orca-style
 * *user* filament preset JSON object.
 *
 * Fields we cannot map honestly are set to null or string "UNKNOWN".
 * This does NOT invent CFS RFID binary constants.
 */
export function convertCanonicalToCrealityUserPreset(
  canonical: OpenFilamentProfileV1,
): Record<string, unknown> {
  const nameParts = [
    canonical.filament.manufacturerName,
    canonical.filament.productName,
    canonical.filament.variantName,
  ].filter(Boolean);
  const name =
    nameParts.length > 0
      ? `OF User — ${nameParts.join(" ")}`
      : `OF User — ${canonical.title}`;

  const nozzle =
    canonical.thermal.nozzleTempOtherLayersC ??
    canonical.thermal.nozzleTempFirstLayerC ??
    null;
  const bed =
    canonical.thermal.bedTempOtherLayersC ??
    canonical.thermal.bedTempFirstLayerC ??
    null;

  return {
    type: "filament",
    name,
    from: "OpenFilament",
    instantiation: "user",
    inherits: UNKNOWN,
    filament_settings_id: name,
    filament_vendor: canonical.filament.manufacturerName ?? UNKNOWN,
    filament_type: canonical.filament.materialCode ?? UNKNOWN,
    filament_diameter: canonical.filament.diameterMm ?? null,
    filament_density: canonical.filament.densityGCm3 ?? null,
    filament_colour: canonical.filament.primaryColorHex ?? UNKNOWN,
    nozzle_temperature: nozzle,
    nozzle_temperature_initial_layer:
      canonical.thermal.nozzleTempFirstLayerC ?? nozzle,
    hot_plate_temp: bed,
    hot_plate_temp_initial_layer: canonical.thermal.bedTempFirstLayerC ?? bed,
    chamber_temperature: canonical.thermal.chamberTempC ?? null,
    filament_flow_ratio: canonical.extrusion.flowRatio ?? null,
    filament_max_volumetric_speed: canonical.extrusion.maxVolumetricFlowMm3s ?? null,
    pressure_advance: canonical.extrusion.pressureAdvance ?? null,
    fan_min_speed: canonical.cooling.fanMinPercent ?? null,
    fan_max_speed: canonical.cooling.fanMaxPercent ?? null,
    bridge_fan_speed: canonical.cooling.bridgeFanPercent ?? null,
    close_fan_the_first_x_layers: canonical.cooling.fanDisableFirstLayers ?? null,
    filament_retraction_length: canonical.retraction.retractionDistanceMm ?? null,
    filament_retraction_speed: canonical.retraction.retractionSpeedMms ?? null,
    filament_deretraction_speed: canonical.retraction.deretractionSpeedMms ?? null,
    filament_z_hop: canonical.retraction.zHopMm ?? null,
    filament_notes: [
      SYNTHETIC_MARK,
      canonical.provenance.isSyntheticFixture
        ? "Source profile marked isSyntheticFixture=true"
        : null,
      canonical.provenance.sourceNotes,
    ]
      .filter(Boolean)
      .join("\n"),
    // Explicitly not claimed as real Creality system / CFS fields:
    creality_filament_id: UNKNOWN,
    cfs_material_id: UNKNOWN,
    cfs_color_id: UNKNOWN,
    rfid_payload_hex: UNKNOWN,
    open_filament: {
      schemaVersion: canonical.schemaVersion,
      profileId: canonical.id ?? null,
      synthetic: canonical.provenance.isSyntheticFixture,
      unknownFields: [
        "inherits",
        "creality_filament_id",
        "cfs_material_id",
        "cfs_color_id",
        "rfid_payload_hex",
      ],
    },
  };
}
