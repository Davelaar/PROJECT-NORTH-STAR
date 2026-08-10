export type PrinterTemplateInput = {
  manufacturerName?: string | null;
  model?: string | null;
  technology?: string | null;
  kinematics?: string | null;
  extruderType?: string | null;
  chamberCapable?: boolean | null;
  maxSpeedMmS?: number | null;
  typicalNozzleTempC?: number | null;
  maxNozzleTempC?: number | null;
};

export type GenericPrinterTemplate = {
  id:
    | "high_speed_enclosed_corexy_direct"
    | "enclosed_corexy_direct"
    | "open_bedslinger_direct"
    | "open_bedslinger_bowden"
    | "generic_fff";
  label: string;
  calculated: true;
  tested: false;
  assumptions: string[];
  retractionDistanceMm: number | null;
  retractionSpeedMms: number | null;
  fanMinPercent: number | null;
  fanMaxPercent: number | null;
};

export type TemplateFilamentValues = {
  flowRatio: number;
  maxVolumetricFlowMm3s: number | null;
  pressureAdvance: number | null;
  chamberTempC: number | null;
};

function includes(value: string | null | undefined, needle: string): boolean {
  return (value ?? "").toLowerCase().includes(needle);
}

export function selectGenericPrinterTemplate(
  printer: PrinterTemplateInput | null | undefined,
): GenericPrinterTemplate {
  const isFff = !printer?.technology || printer.technology.toLowerCase() === "fff";
  const corexy = includes(printer?.kinematics, "corexy");
  const bedslinger =
    includes(printer?.kinematics, "bedslinger") ||
    includes(printer?.kinematics, "cartesian");
  const direct = includes(printer?.extruderType, "direct");
  const bowden = includes(printer?.extruderType, "bowden");
  const fast =
    (printer?.maxSpeedMmS ?? 0) >= 300 ||
    includes(printer?.model, "k1") ||
    includes(printer?.model, "k2") ||
    includes(printer?.model, "x1") ||
    includes(printer?.model, "p1") ||
    includes(printer?.model, "h2d");

  if (isFff && corexy && direct && printer?.chamberCapable && fast) {
    return {
      id: "high_speed_enclosed_corexy_direct",
      label: "High-speed enclosed CoreXY direct-drive",
      calculated: true,
      tested: false,
      assumptions: [
        "Enclosed CoreXY motion system",
        "Direct-drive extruder",
        "High-speed printer class",
      ],
      retractionDistanceMm: 0.8,
      retractionSpeedMms: 40,
      fanMinPercent: 60,
      fanMaxPercent: 100,
    };
  }

  if (isFff && corexy && direct) {
    return {
      id: "enclosed_corexy_direct",
      label: "CoreXY direct-drive",
      calculated: true,
      tested: false,
      assumptions: ["CoreXY motion system", "Direct-drive extruder"],
      retractionDistanceMm: 0.8,
      retractionSpeedMms: 35,
      fanMinPercent: 50,
      fanMaxPercent: 100,
    };
  }

  if (isFff && bedslinger && bowden) {
    return {
      id: "open_bedslinger_bowden",
      label: "Open bedslinger Bowden",
      calculated: true,
      tested: false,
      assumptions: ["Open bedslinger layout", "Bowden extruder"],
      retractionDistanceMm: 4,
      retractionSpeedMms: 45,
      fanMinPercent: 70,
      fanMaxPercent: 100,
    };
  }

  if (isFff && bedslinger) {
    return {
      id: "open_bedslinger_direct",
      label: "Open bedslinger direct-drive",
      calculated: true,
      tested: false,
      assumptions: ["Open bedslinger layout", "Direct-drive or short-path extruder"],
      retractionDistanceMm: 1,
      retractionSpeedMms: 35,
      fanMinPercent: 70,
      fanMaxPercent: 100,
    };
  }

  return {
    id: "generic_fff",
    label: "Generic FFF printer",
    calculated: true,
    tested: false,
    assumptions: ["FFF printer", "Unknown motion or extrusion system"],
    retractionDistanceMm: null,
    retractionSpeedMms: null,
    fanMinPercent: null,
    fanMaxPercent: null,
  };
}

export function calculateTemplateFilamentValues(input: {
  materialCode?: string | null;
  printer: PrinterTemplateInput | null | undefined;
  template: GenericPrinterTemplate;
}): TemplateFilamentValues {
  const material = (input.materialCode ?? "PLA").toUpperCase();
  const highSpeed = input.template.id === "high_speed_enclosed_corexy_direct";
  const chamberCapable = Boolean(input.printer?.chamberCapable);

  return {
    flowRatio: 1,
    pressureAdvance: null,
    maxVolumetricFlowMm3s:
      material.includes("HIGH") || highSpeed
        ? material.startsWith("PETG")
          ? 14
          : 18
        : material.startsWith("PETG")
          ? 10
          : material === "TPU"
            ? 4
            : null,
    chamberTempC:
      chamberCapable && (material === "ABS" || material === "ASA") ? 45 : null,
  };
}
