# Creality Print research notes

**Status:** Adapter is a **structural stub** resembling Orca/Bambu-style filament JSON user presets.

## KNOWN

- Creality Print shares lineage with Orca-style filament setting keys (`filament_type`, `nozzle_temperature`, `filament_flow_ratio`, etc.).
- User presets are distinct from bundled system presets.

## OBSERVED

- No pinned Creality Print version fixtures are checked into this repo yet.
- Export marks `instantiation: "user"` and `from: "OpenFilament"`.

## INFERRED

- Many keys align with OrcaSlicer filament profiles; naming may diverge by Creality Print version.

## UNKNOWN

- Exact system-preset `inherits` graph for a given Creality Print release
- Official Creality filament IDs / CFS linkage fields inside presets
- Stable install paths per OS (deferred to bridge path allowlists)

Adapter deliberately sets `inherits`, `creality_filament_id`, and CFS fields to `UNKNOWN` rather than guessing.
