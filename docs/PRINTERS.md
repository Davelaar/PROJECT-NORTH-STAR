# Printer catalog

OpenFilament keeps a **printer / machine** catalog separate from the filament OEM catalog.

## What is stored

Per `printer_models` row (where available):

| Field | Notes |
|-------|--------|
| Brand + model | Normalized spelling variants (e.g. Prusa → Prusa Research) |
| `technology` | `fff` (FDM), `resin` (SLA/MSLA/DLP), `sls`, `other` |
| Build volume XYZ | mm when upstream provides it |
| Power / heater power | W |
| Max speed | FFF |
| Pixel size / resolution | Resin |
| Typical nozzle / bed temps | FFF hints from catalog |
| Source attribution | Always recorded |

FFF printers also get stock **toolheads** for nozzles 0.2–1.0 mm. Resin / SLS get a placeholder toolhead (`Vat` / `Standard`).

## Generic starter-profile templates

When no exact measured filament profile exists for a selected printer/nozzle, OpenFilament can compose a **calculated, untested starter profile**. This uses `packages/domain/src/printer-templates.ts` and never claims to be measured calibration data.

Current template classes:

| Template id | Meaning |
|-------------|---------|
| `high_speed_enclosed_corexy_direct` | Enclosed high-speed CoreXY with direct-drive extrusion |
| `enclosed_corexy_direct` | CoreXY/direct-drive class without enough evidence for high-speed enclosed assumptions |
| `delta_fff` | Delta FFF printer family |
| `open_bedslinger_direct` | Open bedslinger with direct-drive or short-path extrusion |
| `open_bedslinger_bowden` | Open bedslinger with Bowden extrusion |
| `generic_fff` | Fallback when motion/extrusion details are unknown |

The selector first uses explicit printer fields (`technology`, `kinematics`, `extruderType`, `chamberCapable`, `maxSpeedMmS`). If those are missing or defaulted, it applies conservative brand/model heuristics for common families such as Bambu Lab P/X/H2D/A1, Flashforge Adventurer/Guider/Creator, Creality K/Ender/CR, Prusa MK/XL/CORE One, Elegoo Neptune, Anycubic Kobra, Qidi, FLSUN, Voron, RatRig and Sovol.

Starter profile values are based on filament catalog/manufacturer ranges plus these printer-class assumptions. Users must calibrate before production use.

## Public import: Open 3D Printer Database

**Source:** [swordlab/open-3d-printer-database](https://github.com/swordlab/open-3d-printer-database)  
**License:** [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) — attribution required  
**Contents:** ~350+ machines (FFF + resin + SLS), build volume, power, cost hints, etc.

```bash
./scripts/fetch-open-printer-catalog.sh
pnpm db:import-open-printers
# or via full bootstrap:
./scripts/bootstrap-catalog.sh
```

Attribution string stored on each imported row:

> Open 3D Printer Database (CC-BY-4.0) — https://github.com/swordlab/open-3d-printer-database

Upstream also cites UVtools / OrcaSlicer as data origins for some fields; we redistribute only their aggregated **CC-BY-4.0** `catalog.json`.

## Community additions

`POST /api/v1/printers/resolve` (auth) matches brand/model spelling variants and creates missing printers. Submit UI: brand + model dropdowns with **Other…**.

## API

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/printer-brands` | Brands with models + technology |
| GET | `/api/v1/printers` | Full printer rows |
| POST | `/api/v1/printers/resolve` | Resolve or create (auth) |
