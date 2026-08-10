/**
 * Centralized OpenFilament slicer / export-format registry.
 *
 * Support levels:
 * - supported: adapter + fixtures + manual import verified on listed versions
 * - beta: adapter + structural tests; manual verification incomplete
 * - planned: no download offered
 * - interchange: OpenFilamentProfile JSON (not a slicer)
 *
 * Import menu names are taken from official docs / wiki / vendor GitHub
 * (see docs/SLICER_IMPORT_SOURCES.md). Do not invent menu paths.
 */

export type SlicerSupportStatus =
  | "supported"
  | "beta"
  | "planned"
  | "interchange";

export type SlicerFormatId =
  | "creality"
  | "orca"
  | "prusaslicer"
  | "bambu"
  | "openfilamentprofile";

export type SlicerIncludes = {
  filament: boolean;
  printer: boolean;
  process: boolean;
};

export type SlicerRegistryEntry = {
  id: SlicerFormatId;
  /** Stable slug for URLs */
  slug: string;
  name: string;
  status: SlicerSupportStatus;
  /** Human-readable version ranges we claim structural compatibility for */
  supportedVersions: string[];
  exportFormat: string;
  extension: string;
  mimeType: string;
  apiPath: string;
  docsPath: string | null;
  officialUrl: string | null;
  officialDocsUrl: string | null;
  adapterPackage: string | null;
  adapterVersion: string;
  /** ISO date of last structural or manual check recorded in-repo */
  lastVerified: string;
  includes: SlicerIncludes;
  /** Short English limitation notes (UI may localize separately) */
  limitations: string[];
  /** Verified primary import path (English UI labels from the slicer) */
  importMethod: string;
  group: "slicer" | "interchange";
  downloadEnabled: boolean;
};

export const SLICER_REGISTRY: readonly SlicerRegistryEntry[] = [
  {
    id: "creality",
    slug: "creality-print",
    name: "Creality Print",
    status: "beta",
    supportedVersions: ["6.x", "7.x"],
    exportFormat: "creality-print-user-filament-preset",
    extension: ".json",
    mimeType: "application/json",
    apiPath: "/api/v1/exports/creality",
    docsPath: "/docs/slicers/creality-print",
    officialUrl: "https://www.creality.com/pages/download-software",
    officialDocsUrl:
      "https://github.com/CrealityOfficial/CrealityPrint",
    adapterPackage: "@open-filament/slicer-creality",
    adapterVersion: "0.1.0",
    lastVerified: "2026-08-10",
    includes: { filament: true, printer: false, process: false },
    limitations: [
      "Filament user preset only — printer and process presets are unchanged.",
      "Inherits a Generic/HP system base; the base must exist for your printer/nozzle.",
      "CFS / RFID material identity is separate from this slicer preset.",
      "Structural tests pass; end-to-end import is marked Beta pending broader manual checks.",
    ],
    importMethod:
      "File → Import → Import Configs (Creality Print 6.x / 7.x). Select the downloaded .json user filament preset.",
    group: "slicer",
    downloadEnabled: true,
  },
  {
    id: "orca",
    slug: "orcaslicer",
    name: "OrcaSlicer",
    status: "beta",
    supportedVersions: ["2.0+", "2.1+", "2.2+"],
    exportFormat: "orca-filament-user-preset",
    extension: ".json",
    mimeType: "application/json",
    apiPath: "/api/v1/exports/orca",
    docsPath: "/docs/slicers/orcaslicer",
    officialUrl: "https://github.com/OrcaSlicer/OrcaSlicer/releases",
    officialDocsUrl:
      "https://github.com/OrcaSlicer/OrcaSlicer/wiki/import_export",
    adapterPackage: "@open-filament/slicer-orca",
    adapterVersion: "0.1.0",
    lastVerified: "2026-08-10",
    includes: { filament: true, printer: false, process: false },
    limitations: [
      "Filament JSON user preset only.",
      "After import, check Filament → Dependencies if the preset is hidden for your printer/nozzle.",
      "Inherits Generic {material} @printer-all style bases — exotic materials may need a different inherit.",
      "Structural tests pass; marked Beta until wider manual verification.",
    ],
    importMethod:
      "File → Import → Import Configs (also shown as Preset Configs in the OrcaSlicer wiki). Select the .json filament preset.",
    group: "slicer",
    downloadEnabled: true,
  },
  {
    id: "prusaslicer",
    slug: "prusaslicer",
    name: "PrusaSlicer",
    status: "beta",
    supportedVersions: ["2.7+", "2.8+", "2.9+"],
    exportFormat: "prusaslicer-filament-ini",
    extension: ".ini",
    mimeType: "text/plain",
    apiPath: "/api/v1/exports/prusaslicer",
    docsPath: "/docs/slicers/prusaslicer",
    officialUrl: "https://www.prusa3d.com/page/prusaslicer_424/",
    officialDocsUrl:
      "https://help.prusa3d.com/article/how-to-import-and-export-custom-profiles-in-prusaslicer_382766",
    adapterPackage: "@open-filament/slicer-prusa",
    adapterVersion: "0.1.0",
    lastVerified: "2026-08-10",
    includes: { filament: true, printer: false, process: false },
    limitations: [
      "Single-filament config bundle (.ini) — not a full printer/process bundle.",
      "ASA maps to the *ABS* inherit family in stock PrusaResearch templates.",
      "Pressure advance is recorded as a start_filament_gcode hint, not a native PA field.",
      "Structural tests pass; marked Beta until wider manual verification.",
    ],
    importMethod:
      "File → Import → Import Config Bundle… and select the .ini file (Prusa Knowledge Base).",
    group: "slicer",
    downloadEnabled: true,
  },
  {
    id: "bambu",
    slug: "bambu-studio",
    name: "Bambu Studio",
    status: "beta",
    supportedVersions: ["1.9+", "2.0+"],
    exportFormat: "bambu-studio-filament-user-preset",
    extension: ".json",
    mimeType: "application/json",
    apiPath: "/api/v1/exports/bambu",
    docsPath: "/docs/slicers/bambu-studio",
    officialUrl: "https://bambulab.com/en/download/studio",
    officialDocsUrl: "https://wiki.bambulab.com/",
    adapterPackage: "@open-filament/slicer-bambu",
    adapterVersion: "0.1.0",
    lastVerified: "2026-08-10",
    includes: { filament: true, printer: false, process: false },
    limitations: [
      "Filament user preset only — AMS slot identity is separate.",
      "OpenFilament does not write Bambu RFID tags.",
      "Clear printer/nozzle filters if the imported preset is not listed.",
      "Structural tests pass; marked Beta until wider manual verification.",
    ],
    importMethod:
      "File → Import → Import Configs and select the .json filament preset (unified import in current Bambu Studio).",
    group: "slicer",
    downloadEnabled: true,
  },
  {
    id: "openfilamentprofile",
    slug: "openfilamentprofile",
    name: "OpenFilamentProfile JSON",
    status: "interchange",
    supportedVersions: ["v1"],
    exportFormat: "openfilament-profile-v1",
    extension: ".json",
    mimeType: "application/json",
    apiPath: "/api/v1/exports/openfilamentprofile",
    docsPath: "/docs/slicers",
    officialUrl: null,
    officialDocsUrl: null,
    adapterPackage: "@open-filament/canonical-profile",
    adapterVersion: "0.1.0",
    lastVerified: "2026-08-10",
    includes: { filament: true, printer: false, process: false },
    limitations: [
      "Not a slicer preset — cannot be printed from directly.",
      "Intended for backup, portability, integrations and future conversion.",
    ],
    importMethod:
      "Keep as backup or feed into OpenFilament / converter tooling. Do not import into slicers as-is.",
    group: "interchange",
    downloadEnabled: true,
  },
] as const;

export function getSlicerEntry(
  id: string,
): SlicerRegistryEntry | undefined {
  return SLICER_REGISTRY.find((e) => e.id === id || e.slug === id);
}

export function listDownloadableSlicers(): SlicerRegistryEntry[] {
  return SLICER_REGISTRY.filter((e) => e.downloadEnabled && e.group === "slicer");
}

export function listSlicerPresets(): SlicerRegistryEntry[] {
  return SLICER_REGISTRY.filter((e) => e.group === "slicer");
}

export function listInterchangeFormats(): SlicerRegistryEntry[] {
  return SLICER_REGISTRY.filter((e) => e.group === "interchange");
}

/** Sanitize a path segment for download filenames — never allow path separators. */
export function sanitizeFilenamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "x";
}

export type ExportFilenameInput = {
  formatId: SlicerFormatId;
  manufacturerName?: string | null;
  productName?: string | null;
  variantName?: string | null;
  printerModel?: string | null;
  nozzleDiameterMm?: number | null;
  revisionHint?: string | null;
};

/** Deterministic download name: openfilament-…-slicer.ext */
export function buildExportFilename(input: ExportFilenameInput): string {
  const entry = getSlicerEntry(input.formatId);
  const ext = entry?.extension ?? ".json";
  const slicer = sanitizeFilenamePart(entry?.slug ?? input.formatId);
  const parts = [
    "openfilament",
    sanitizeFilenamePart(input.manufacturerName ?? "filament"),
    sanitizeFilenamePart(input.productName ?? "product"),
    sanitizeFilenamePart(input.variantName ?? "variant"),
    sanitizeFilenamePart(input.printerModel ?? "printer"),
    input.nozzleDiameterMm != null
      ? sanitizeFilenamePart(`${input.nozzleDiameterMm}mm`)
      : "nozzle",
    input.revisionHint
      ? sanitizeFilenamePart(input.revisionHint)
      : null,
    slicer,
  ].filter(Boolean);
  return `${parts.join("-")}${ext}`;
}

export function statusLabelKey(status: SlicerSupportStatus): string {
  return `status.${status}`;
}
