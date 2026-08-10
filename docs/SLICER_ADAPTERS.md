# Slicer adapters

Adapters convert **OpenFilamentProfile → slicer user preset JSON**. They never become the database model.

## Packages

| Package | Function |
|---------|----------|
| `@open-filament/slicer-creality` | `convertCanonicalToCrealityUserPreset`, `buildCrealityInfoFile`, `suggestCompatiblePrinter` |
| `@open-filament/slicer-orca` | `convertCanonicalToOrcaFilamentPreset` |

## Creality Print user wrappers

Observed Creality Print 7.0 user presets are **thin wrappers**: scalar `inherits` / `name` / `from` / `base_id`, plus **string-array** overrides.

- Name: `{Vendor} {Product} {Variant} @Creality {Model} {nozzle} nozzle`
- ASA inherits: `HP-ASA @Creality K2 Plus {nozzle} nozzle` when nozzle known; else 0.4 HP-ASA / Generic fallbacks for other materials
- Companion `.info` via `buildCrealityInfoFile`
- Omit unknown fields rather than inventing placeholders

## OrcaSlicer

User-style filament JSON with string arrays; inherits like `Generic ASA @K2 Plus-all`.

## Install

Use the **local bridge** `POST /v1/presets/install` (allowlisted filament dirs). API export endpoints return `bridgeInstallPayload` ready to POST.
