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
