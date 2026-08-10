# Slicer import research sources

Authoritative sources used for OpenFilament slicer instruction pages
(verified 2026-08-10). Menu labels are quoted from these sources; do not
invent “File → Import → Preset” style paths without a citation here.

## Creality Print

- GitHub: [CrealityOfficial/CrealityPrint](https://github.com/CrealityOfficial/CrealityPrint)
- Issue #274 (v5→v6 migration / import): `File → Import → Import configs` / Import 5.x Presets
- Community (export/import symmetry, v5/v7): [Exporting Material settings](https://forum.creality.com/t/exporting-material-settings/19488) — Import via the Import menu for ZIP/JSON presets
- OpenFilament adapter: `packages/slicer-creality` (Creality Print–style user wrapper JSON with `inherits`, string-array fields)

**Primary instruction used:** Creality Print 6.x / 7.x — **File → Import → Import Configs**, select the downloaded `.json` filament user preset.

## OrcaSlicer

- Official wiki: [import_export](https://github.com/OrcaSlicer/OrcaSlicer/wiki/import_export) — **Import Configs** under `File` → `Import` → `Preset Configs`
- Polymaker wiki: [Importing Profile into Orca Slicer](https://wiki.polymaker.com/the-basics/3d-slicers/importing-a-profile-into-slicer/importing-profile-into-orca-slicer) — File → Import → Import Configs
- OpenFilament adapter: `packages/slicer-orca`

**Primary instruction used:** **File → Import → Import Configs**, select `.json`.

## PrusaSlicer

- Prusa Knowledge Base: [How to import and export custom profiles](https://help.prusa3d.com/article/how-to-import-and-export-custom-profiles-in-prusaslicer_382766)
  - **File → Import → Import Config Bundle** for `.ini` bundles
  - **File → Import → Import Config** for a single profile
- OpenFilament adapter: `packages/slicer-prusa` (filament section as config bundle)

**Primary instruction used:** **File → Import → Import Config Bundle…**, select the `.ini` file.

## Bambu Studio

- SliceHub help: [Import Presets into Bambu Studio](https://slicehub.org/help/import/bambu-studio) — unified **File → Import → Import Configs**
- Helio Additive wiki: [Adding Filament Profiles](https://wiki.helioadditive.com/en/adding-filament-profiles) — File → Import → Import Configs
- OpenFilament adapter: `packages/slicer-bambu` (SoftFever/Orca-family filament JSON)

**Primary instruction used:** **File → Import → Import Configs**, select `.json`.

## Support status policy

All four slicer adapters are marked **Beta** until a maintainer records a
manual import check against a current release build in this file (date,
version, OS). Structural unit tests alone do not justify **Supported**.
