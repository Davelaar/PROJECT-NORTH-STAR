/**
 * Localized slicer instruction guide content.
 * Menu names stay in official English where the slicer UI does.
 */

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] }
  | { type: "note"; text: string }
  | { type: "code"; text: string };

export type GuideSection = {
  id: string;
  heading: string;
  blocks: GuideBlock[];
};

export type SlicerGuide = {
  title: string;
  lead: string;
  sections: GuideSection[];
};

export type GuidesBundle = {
  overview: {
    heading: string;
    lead: string;
    tableCaption: string;
    interchangeTitle: string;
    interchangeBody: string;
    viewInstructions: string;
    officialSite: string;
    colSlicer: string;
    colStatus: string;
    colFilament: string;
    colPrinter: string;
    colProcess: string;
    colInstructions: string;
    yes: string;
    no: string;
    identityHeading: string;
    identityBody: string;
  };
  status: Record<"supported" | "beta" | "planned" | "interchange", string>;
  guides: Record<
    "creality-print" | "orcaslicer" | "prusaslicer" | "bambu-studio",
    SlicerGuide
  >;
};

function guide(
  title: string,
  lead: string,
  sections: GuideSection[],
): SlicerGuide {
  return { title, lead, sections };
}

export const guidesEn: GuidesBundle = {
  overview: {
    heading: "Supported slicers",
    lead: "OpenFilament creates a filament preset file. You download it and import it into your slicer. OpenFilament does not install software or change local slicer folders.",
    tableCaption: "Compatibility overview",
    interchangeTitle: "OpenFilamentProfile JSON",
    interchangeBody:
      "Canonical interchange for backups, portability, integrations and developers. It is not a slicer preset and cannot be printed from directly.",
    viewInstructions: "View import instructions",
    officialSite: "Official website",
    colSlicer: "Slicer",
    colStatus: "Status",
    colFilament: "Filament preset",
    colPrinter: "Printer preset",
    colProcess: "Process preset",
    colInstructions: "Instructions",
    yes: "Yes",
    no: "No",
    identityHeading: "Preset vs spool identity",
    identityBody:
      "The slicer filament preset configures temperatures and extrusion. CFS/AMS/RFID identify or map the physical spool. Sliced G-code is what the printer runs. They may refer to the same OpenFilament record but they are not the same file.",
  },
  status: {
    supported: "Supported",
    beta: "Beta",
    planned: "Planned",
    interchange: "Interchange format",
  },
  guides: {
    "creality-print": guide(
      "Creality Print — import instructions",
      "Download an OpenFilament filament user preset (.json) and import it with File → Import → Import Configs. Printer and process settings stay unchanged. Menu names follow Creality Print’s English UI.",
      [
        {
          id: "what",
          heading: "What OpenFilament exports",
          blocks: [
            {
              type: "p",
              text: "A Creality Print–style filament user wrapper JSON with string-array overrides and an inherits chain (Generic/HP base for your printer and nozzle).",
            },
            {
              type: "ul",
              items: [
                "Filament vendor, type, colour, density, diameter",
                "Nozzle and bed temperatures (including first-layer where known)",
                "Flow ratio, pressure advance, max volumetric flow",
                "Cooling and retraction overrides when present",
                "Chamber temperature and shrinkage when present",
                "Provenance notes in filament_notes",
              ],
            },
            {
              type: "p",
              text: "It does not include printer firmware, a full printer preset, a process/print preset, sliced G-code, or RFID/CFS payloads.",
            },
          ],
        },
        {
          id: "before",
          heading: "Before you begin",
          blocks: [
            {
              type: "ul",
              items: [
                "Creality Print 6.x or 7.x (Beta support)",
                "Add your printer in Creality Print first",
                "Select the matching nozzle diameter",
                "No OpenFilament account is required to download",
                "Optional: back up existing user presets (File → Export → Export Presets)",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Download from OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Find the filament (Search / catalog).",
                "Open the colour / variant.",
                "Choose printer and nozzle.",
                "Pick a calibration profile.",
                "Open Download for slicer / Export and choose Creality Print.",
                "Create the download and save the .json file.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Import into Creality Print",
          blocks: [
            {
              type: "ol",
              items: [
                "Open Creality Print.",
                "Choose File → Import → Import Configs.",
                "Select the downloaded OpenFilament .json file.",
                "Confirm if asked about existing presets.",
              ],
            },
            {
              type: "note",
              text: "On upgrades between major versions, Creality may also offer “Import 5.x Presets” or migration prompts — that path is for migrating old Creality user data, not the usual OpenFilament download.",
            },
          ],
        },
        {
          id: "select",
          heading: "Select the imported profile",
          blocks: [
            {
              type: "ul",
              items: [
                "Open the filament list for your project.",
                "Find the user preset named like “Brand Product Colour @Creality … nozzle”.",
                "Confirm the active printer and nozzle match the profile.",
                "System presets remain separate from user presets.",
              ],
            },
          ],
        },
        {
          id: "cfs",
          heading: "Connect it to physical filament (CFS)",
          blocks: [
            {
              type: "p",
              text: "The imported preset lives in the slicer. CFS slot material identity is separate.",
            },
            {
              type: "ol",
              items: [
                "Load or edit the CFS slot for the physical spool.",
                "Map the slot to the imported filament preset when Creality Print asks for a filament.",
                "RFID may identify material and colour; it does not contain the full OpenFilament calibration profile.",
              ],
            },
          ],
        },
        {
          id: "verify",
          heading: "Verify the import",
          blocks: [
            {
              type: "ul",
              items: [
                "Preset appears in the filament list",
                "Correct printer selected",
                "Correct nozzle diameter selected",
                "Temperatures match the OpenFilament profile",
                "Flow and max volumetric flow are present",
                "The sliced project uses the imported filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Troubleshooting",
          blocks: [
            {
              type: "ul",
              items: [
                "File rejected — confirm it is the OpenFilament .json user preset, not OpenFilamentProfile interchange JSON.",
                "Not visible — clear filters; check inherits base exists for your printer/nozzle.",
                "Wrong nozzle — re-export with the correct nozzle, or change nozzle in Creality Print then re-select the filament.",
                "Duplicate name — rename or delete the older user preset before re-importing.",
                "Old version — update to Creality Print 6.x/7.x.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Remove or replace the profile",
          blocks: [
            {
              type: "p",
              text: "Delete the user preset from Creality Print’s filament user list, or import a newer OpenFilament revision (prefer a distinct filename from a new download). Avoid keeping many near-duplicate revisions.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Known limitations",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta: structural tests pass; broader manual verification ongoing.",
                "Filament only — no printer/process export.",
                "Exotic materials may inherit a Generic base that is incomplete for that type.",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Sources and compatibility",
          blocks: [
            {
              type: "ul",
              items: [
                "Supported versions: 6.x, 7.x (Beta)",
                "Last structural verification: 2026-08-10",
                "Adapter: @open-filament/slicer-creality",
                "Research notes: docs/SLICER_IMPORT_SOURCES.md",
              ],
            },
          ],
        },
      ],
    ),
    orcaslicer: guide(
      "OrcaSlicer — import instructions",
      "Download an OpenFilament filament JSON preset and import it with File → Import → Import Configs. Menu names follow OrcaSlicer’s English UI / wiki.",
      [
        {
          id: "what",
          heading: "What OpenFilament exports",
          blocks: [
            {
              type: "p",
              text: "An OrcaSlicer filament user preset JSON (type: filament) with inherits such as Generic ASA @K2 Plus-all, plus temperatures, flow, PA, volumetric limit, cooling and retraction when known.",
            },
            {
              type: "p",
              text: "It does not ship printer or process presets, G-code, or RFID data.",
            },
          ],
        },
        {
          id: "before",
          heading: "Before you begin",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer 2.0+ recommended (Beta)",
                "Install/select your printer profile first",
                "Optional backup: File → Export → Export Preset Bundle",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Download from OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Find filament → variant → printer/nozzle → profile.",
                "Choose OrcaSlicer on the Export / Download for slicer page.",
                "Create download and save the .json file.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Import into OrcaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Open OrcaSlicer.",
                "Choose File → Import → Import Configs (wiki: Preset Configs).",
                "Select the OpenFilament .json filament preset.",
                "Confirm overwrite if a preset with the same name exists.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Select the imported profile",
          blocks: [
            {
              type: "ul",
              items: [
                "Open the Filament dropdown.",
                "Locate the user preset (brand / product / colour).",
                "If missing: Filament settings → Dependencies — enable your printer/nozzle.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Connect it to physical filament",
          blocks: [
            {
              type: "p",
              text: "For an external spool, select the imported filament on the prepare tab. For AMS/CFS-style mapping in Orca, map the slot to this user filament only where your printer profile supports it — OpenFilament does not auto-write RFID.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verify the import",
          blocks: [
            {
              type: "ul",
              items: [
                "Preset listed under user filaments",
                "Printer and nozzle active",
                "Temps / flow / max volumetric match",
                "Project slices with this filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Troubleshooting",
          blocks: [
            {
              type: "ul",
              items: [
                "Invalid configuration — ensure JSON (not Prusa .ini).",
                "Hidden after import — fix compatible_printers / Dependencies.",
                "Wrong inherit base — re-export after choosing a closer printer model.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Remove or replace the profile",
          blocks: [
            {
              type: "p",
              text: "Delete the user filament preset in OrcaSlicer, or import a newer OpenFilament download. Prefer distinct revision filenames from OpenFilament.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Known limitations",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta support",
                "Filament-only export",
                "Inherits Generic @printer-all style bases",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Sources and compatibility",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer wiki import_export",
                "Last structural verification: 2026-08-10",
                "Adapter: @open-filament/slicer-orca",
              ],
            },
          ],
        },
      ],
    ),
    prusaslicer: guide(
      "PrusaSlicer — import instructions",
      "Download an OpenFilament filament config bundle (.ini) and import it with File → Import → Import Config Bundle…. Menu names follow PrusaSlicer’s English UI / Prusa Knowledge Base.",
      [
        {
          id: "what",
          heading: "What OpenFilament exports",
          blocks: [
            {
              type: "p",
              text: "A PrusaSlicer config bundle containing one [filament:…] section with inherits (*PLA*, *PET*, *ABS*, *FLEX*), temperatures, extrusion multiplier, volumetric limit, fans, and notes. Pressure advance is a start_filament_gcode hint.",
            },
            {
              type: "p",
              text: "No printer preset, print/process preset, G-code, or RFID data.",
            },
          ],
        },
        {
          id: "before",
          heading: "Before you begin",
          blocks: [
            {
              type: "ul",
              items: [
                "PrusaSlicer 2.7+ (Beta; tested structurally through 2.9.x fields)",
                "Configure your printer in PrusaSlicer first",
                "Optional: File → Export → Export Config Bundle for backup",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Download from OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Find filament → variant → printer/nozzle → profile.",
                "Choose PrusaSlicer on Export / Download for slicer.",
                "Create download and save the .ini file.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Import into PrusaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Open PrusaSlicer.",
                "Choose File → Import → Import Config Bundle…",
                "Select the OpenFilament .ini file.",
              ],
            },
            {
              type: "note",
              text: "Use Import Config Bundle for this file (it is a small bundle with a filament section). Import Config is for a single combined profile / G-code — not the usual OpenFilament path.",
            },
          ],
        },
        {
          id: "select",
          heading: "Select the imported profile",
          blocks: [
            {
              type: "ul",
              items: [
                "Open Filament Settings.",
                "Select the custom preset (brand / product / colour).",
                "Confirm printer and nozzle on the plater before slicing.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Connect it to physical filament",
          blocks: [
            {
              type: "p",
              text: "PrusaSlicer does not auto-map third-party RFID. Select the imported filament preset on the plater for the spool you loaded. There is no OpenFilament automatic material-system integration.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verify the import",
          blocks: [
            {
              type: "ul",
              items: [
                "Custom filament appears in the list",
                "Temperatures and extrusion multiplier match",
                "Slice uses the selected filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Troubleshooting",
          blocks: [
            {
              type: "ul",
              items: [
                "Nothing imported — use Import Config Bundle, not Import Config.",
                "Wrong extension — keep .ini (do not leave as .txt).",
                "ASA uses *ABS* inherit — expected for stock templates.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Remove or replace the profile",
          blocks: [
            {
              type: "p",
              text: "Remove the custom filament preset in PrusaSlicer, or import a newer OpenFilament .ini. Rename locally if you customized values you want to keep.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Known limitations",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta support",
                "Filament-only bundle",
                "PA via gcode hint",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Sources and compatibility",
          blocks: [
            {
              type: "ul",
              items: [
                "Prusa Knowledge Base article 382766",
                "Last structural verification: 2026-08-10",
                "Adapter: @open-filament/slicer-prusa",
              ],
            },
          ],
        },
      ],
    ),
    "bambu-studio": guide(
      "Bambu Studio — import instructions",
      "Download an OpenFilament filament JSON user preset and import it with File → Import → Import Configs. Menu names follow current Bambu Studio English UI.",
      [
        {
          id: "what",
          heading: "What OpenFilament exports",
          blocks: [
            {
              type: "p",
              text: "A Bambu Studio / SoftFever-family filament user preset JSON with inherits (Generic {material} [@printer]), temperatures, flow, PA, volumetric limit, cooling, retraction and notes.",
            },
            {
              type: "p",
              text: "No printer/process presets, G-code, or Bambu RFID write support from OpenFilament.",
            },
          ],
        },
        {
          id: "before",
          heading: "Before you begin",
          blocks: [
            {
              type: "ul",
              items: [
                "Bambu Studio 1.9+ / 2.0+ (Beta)",
                "Select your printer and nozzle in Studio first",
                "Optional: export a backup of user presets",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Download from OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Find filament → variant → printer/nozzle → profile.",
                "Choose Bambu Studio on Export / Download for slicer.",
                "Create download and save the .json file.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Import into Bambu Studio",
          blocks: [
            {
              type: "ol",
              items: [
                "Open Bambu Studio.",
                "Choose File → Import → Import Configs.",
                "Select the OpenFilament .json filament preset.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Select the imported profile",
          blocks: [
            {
              type: "ul",
              items: [
                "Open filament selection → User / Custom filaments.",
                "Clear printer/nozzle filters if the preset is hidden.",
                "Select the imported preset for the plate.",
              ],
            },
          ],
        },
        {
          id: "ams",
          heading: "Connect it to physical filament (AMS)",
          blocks: [
            {
              type: "p",
              text: "AMS material identity is separate from the slicer preset. Map the AMS slot to the imported user filament in Studio’s AMS / filament mapping UI. OpenFilament does not claim third-party RFID write into Bambu tags.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verify the import",
          blocks: [
            {
              type: "ul",
              items: [
                "User filament listed",
                "Printer/nozzle correct",
                "Temps / flow / volumetric match",
                "Slice uses the imported filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Troubleshooting",
          blocks: [
            {
              type: "ul",
              items: [
                "Not visible — clear filters; confirm inherit base exists.",
                "Rejected — do not use OpenFilamentProfile interchange JSON.",
                "AMS mismatch — map the slot manually to the user preset.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Remove or replace the profile",
          blocks: [
            {
              type: "p",
              text: "Remove the user filament in Bambu Studio or import a newer OpenFilament download with a distinct filename.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Known limitations",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta support",
                "Filament-only",
                "No Bambu RFID writing",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Sources and compatibility",
          blocks: [
            {
              type: "ul",
              items: [
                "File → Import → Import Configs (current Studio)",
                "Last structural verification: 2026-08-10",
                "Adapter: @open-filament/slicer-bambu",
              ],
            },
          ],
        },
      ],
    ),
  },
};
