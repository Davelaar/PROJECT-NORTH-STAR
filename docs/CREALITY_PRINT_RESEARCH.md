# Creality Print research notes

**Status:** Adapter emits **installable Creality Print 7.0 user wrappers** matching local observed files (string-array overrides + `inherits` system preset).

## KNOWN (this machine)

Creality Print 7.0 user filament dir example:

`~/Library/Application Support/Creality/Creality Print/7.0/user/<userId>/filament/`

Real wrapper traits:

- `from: "User"`, `is_custom_defined: "0"`, `base_id` (commonly `GFSA04`)
- `inherits` e.g. `HP-ASA @Creality K2 Plus 0.6 nozzle`
- Calibration fields as **arrays of strings**
- Companion `.info` with `user_id`, `setting_id`, `base_id`, `updated_time`

System inherit targets present for ASA 0.6: `HP-ASA @Creality K2 Plus 0.6 nozzle`.

## Adapter

`convertCanonicalToCrealityUserPreset(canonical, opts?)` produces that shape. Bridge install writes JSON + info into the detected (or override) filament directory.

## Remaining

Cloud sync / Creality account `setting_id` semantics beyond local files are not claimed.
