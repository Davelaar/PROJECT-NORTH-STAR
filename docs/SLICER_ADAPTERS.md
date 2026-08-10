# Slicer adapters

Adapters convert **OpenFilamentProfile → slicer user preset**. They never become the database model.

## Packages

| Package | Format | Function |
|---------|--------|----------|
| `@open-filament/slicer-orca` | JSON | `convertCanonicalToOrcaFilamentPreset` |
| `@open-filament/slicer-creality` | JSON + `.info` | `convertCanonicalToCrealityUserPreset`, `buildCrealityInfoFile` |
| `@open-filament/slicer-prusa` | INI config bundle | `convertCanonicalToPrusaFilamentIni`, `convertCanonicalToPrusaConfigBundle` |
| `@open-filament/slicer-bambu` | JSON | `convertCanonicalToBambuFilamentPreset` |

## Priority / coverage

| Slicer | Status | Notes |
|--------|--------|-------|
| **OrcaSlicer** | Supported | SoftFever JSON; inherits `Generic {MAT} @{printer}-all`; exports shrinkage / chamber when set |
| **Creality Print** | Supported | Thin user wrappers + companion `.info`; shrinkage / chamber when set |
| **PrusaSlicer** | Supported | INI `[filament:Name]` section; shrinkage/chamber as comments when set |
| **Bambu Studio** | Supported | SoftFever-family JSON; shrinkage / chamber when set |

Default nozzle diameter when unspecified: **0.4 mm**. Parameter matrix: [`FILAMENT_PARAMETERS.md`](./FILAMENT_PARAMETERS.md).

## Creality Print

- Name: `{Vendor} {Product} {Variant} @Creality {Model} {nozzle} nozzle`
- ASA inherits: `HP-ASA @Creality K2 Plus {nozzle} nozzle` when nozzle known
- Companion `.info` via `buildCrealityInfoFile`

## OrcaSlicer

User-style filament JSON with string arrays; inherits like `Generic ASA @K2 Plus-all`.

## PrusaSlicer

Produces an importable config-bundle snippet:

```ini
[filament:Flashforge ASA Burnt Titanium]
inherits = *ABS*
temperature = 255
filament_max_volumetric_speed = 28
filament_notes = "Open Filament user preset — …"
```

Import: **File → Import → Import Config Bundle…** (universal browser download path). Optional helper may write into `~/Library/Application Support/PrusaSlicer/filament/` when explicitly used.

## Bambu Studio

JSON user presets (string arrays). Primary path: download JSON and import. Optional helper may install into `BambuStudio/user/*/filament/`.

## API

```
POST /api/v1/exports/orca
POST /api/v1/exports/creality
POST /api/v1/exports/prusaslicer
POST /api/v1/exports/bambu
POST /api/v1/exports/openfilamentprofile
```

Each slicer export may include `bridgeInstallPayload` for the **optional** helper (`POST http://127.0.0.1:8788/v1/presets/install`). Primary UX is browser **download** (and optional File System Access save).

## Install / use in slicer

1. **Standard:** download the exported file → import in the slicer.  
2. **Enhanced:** File System Access save (supported browsers).  
3. **Optional helper:** allowlisted write via local bridge — see [`LOCAL_BRIDGE.md`](./LOCAL_BRIDGE.md). Override test root with `OF_BRIDGE_FILAMENT_ROOT_OVERRIDE`.
