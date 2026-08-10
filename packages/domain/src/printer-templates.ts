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
    | "delta_fff"
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

function hasAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

export function selectGenericPrinterTemplate(
  printer: PrinterTemplateInput | null | undefined,
): GenericPrinterTemplate {
  const manufacturer = (printer?.manufacturerName ?? "").toLowerCase();
  const model = (printer?.model ?? "").toLowerCase();
  const signature = `${manufacturer} ${model}`;
  const isFff = !printer?.technology || printer.technology.toLowerCase() === "fff";
  const inferredCorexy =
    hasAny(manufacturer, ["qidi", "voron", "ratrig", "rat rig"]) ||
    hasAny(model, ["p1", "x1", "h2d"]) ||
    hasAny(signature, [
      "bambu p1",
      "bambu x1",
      "bambu h2d",
      "k1",
      "k2",
      "adventurer 5m",
      "guider 3",
      "creator 4",
      "core one",
      "prusa xl",
      "kobra s1",
      "sv08",
      "two trees sk1",
      "twotrees sk1",
    ]);
  const inferredDelta = hasAny(manufacturer, ["flsun"]) || hasAny(model, ["v400", "delta"]);
  const inferredBedslinger =
    hasAny(model, ["a1", "a1 mini"]) ||
    hasAny(signature, [
      "ender 3",
      "cr-10",
      "bambu a1",
      "neptune",
      "kobra 2",
      "kobra 3",
      "mk3",
      "mk4",
      "mini",
      "sv06",
      "sv07",
      "sidewinder",
      "genius",
      "kp3s",
      "duplicator i3",
    ]) || hasAny(manufacturer, ["ankermake"]);
  const corexy = includes(printer?.kinematics, "corexy") || inferredCorexy;
  const bedslinger =
    includes(printer?.kinematics, "bedslinger") ||
    includes(printer?.kinematics, "cartesian") ||
    inferredBedslinger;
  const direct =
    includes(printer?.extruderType, "direct") ||
    hasAny(signature, [
      "bambu",
      "prusa",
      "qidi",
      "flashforge",
      "neptune 4",
      "ender 3 v3",
      "k1",
      "k2",
      "kobra",
      "sv06",
      "sv07",
      "sv08",
      "voron",
      "ratrig",
      "rat rig",
      "flsun",
    ]);
  const bowden =
    includes(printer?.extruderType, "bowden") ||
    hasAny(signature, ["ender 3 v2", "ender 5", "cr-10", "neptune 3"]);
  const chamberCapable =
    printer?.chamberCapable ??
    hasAny(signature, [
      "p1s",
      "x1",
      "x1 carbon",
      "x1e",
      "h2d",
      "k1",
      "k2",
      "adventurer 5m pro",
      "guider 3",
      "creator 4",
      "qidi",
      "core one",
      "kobra s1",
    ]);
  const fast =
    (printer?.maxSpeedMmS ?? 0) >= 300 ||
    hasAny(signature, [
      "k1",
      "k2",
      "x1",
      "p1",
      "a1",
      "h2d",
      "adventurer 5m",
      "neptune 4",
      "qidi",
      "kobra s1",
      "kobra 3",
      "sv08",
      "v400",
    ]);

  if (isFff && corexy && direct && chamberCapable && fast) {
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

  if (isFff && inferredDelta) {
    return {
      id: "delta_fff",
      label: "Delta FFF printer",
      calculated: true,
      tested: false,
      assumptions: ["Delta motion system", "Extruder path inferred from printer family"],
      retractionDistanceMm: direct ? 1 : 3,
      retractionSpeedMms: 40,
      fanMinPercent: 70,
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
