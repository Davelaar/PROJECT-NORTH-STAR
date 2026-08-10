# Slicer adapters

Adapters convert **OpenFilamentProfile → slicer user preset JSON**. They never become the database model.

## Packages

| Package | Function |
|---------|----------|
| `@open-filament/slicer-creality` | `convertCanonicalToCrealityUserPreset` |
| `@open-filament/slicer-orca` | `convertCanonicalToOrcaFilamentPreset` |

## Rules

- Output `instantiation: "user"` — not system presets.
- Unmapped vendor IDs / inherit chains → `"UNKNOWN"` or `null`.
- Creality CFS RFID-related fields are **never invented**; marked `UNKNOWN`.
- Synthetic sources noted in `filament_notes`.

Install into slicer directories is a future **bridge** responsibility, not the web app.
