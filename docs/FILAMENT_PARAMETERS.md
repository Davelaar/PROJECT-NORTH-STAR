# Filament parameters

OpenFilament separates **catalog / manufacturer claims** from **community calibrations**. Unknown numbers stay `null` (never sentinel `0`).

## Minimum catalog fields (per filament variant)

| Field | Where | Notes |
|-------|--------|--------|
| **Material** | `material_families` via product | Required |
| **Nozzle temp** | product `mfr_nozzle_temp_*` | Range from datasheet / OFD |
| **Bed temp** | product `mfr_bed_temp_*` | Range from datasheet / OFD |
| **Color** | variant `primary_color_hex` | Required for a colour SKU |
| **Nozzle size** | toolhead / profile context | **Default 0.4 mm** when unspecified — not a catalog property of the plastic |
| **SKU / EAN / GTIN** | variant identifiers | From OFD sizes when present; searchable |
| **Preview** | `preview_image_url` or swatch SVG | Photo URL optional; color swatch always available |

API: `GET /api/v1/variants/{uuid}` → `identifiers`, `purchaseLinks`, `preview`.  
Swatch: `GET /api/v1/variants/{uuid}/swatch.svg`.

## Catalog fields (manufacturer / OFD)

Stored on `filament_products` (+ appearance on `filament_variants`):

- Diameter (+ tolerance), density, min nozzle diameter
- Nozzle / bed / chamber / preheat temperatures
- Drying temperature, datasheet / safety sheet URLs
- Shrinkage XY/Z % (when known from manufacturer — rare in OFD)
- Shore A/D, abrasive flag
- `catalog_slicer_hints_json` (OFD / material default slicer hint blobs — **not** calibrations)

OFD import (`pnpm db:import-ofd`) maps these from [openfilamentdatabase.org](https://openfilamentdatabase.org). Shrinkage is almost never present upstream; community measurements fill it on revisions.

## Community / slicer-settable calibration fields

Stored on `calibration_revisions` and exported via OpenFilamentProfile + slicer adapters:

| Group | Fields | Creality | Orca | Bambu | Prusa |
|-------|--------|----------|------|-------|-------|
| Thermal | nozzle / bed / first-layer / chamber | ✓ | ✓ | ✓ | ✓ (chamber as comment) |
| Extrusion | flow, PA, max volumetric | ✓ | ✓ | ✓ | ✓ |
| Cooling | fan min/max, first layers, bridge fan | ✓ | ✓ | ✓ | ✓ |
| Retraction | length, speed, … | ✓ | ✓ | ✓ | hint |
| Dimensional | **shrinkage XY / Z** | ✓ | ✓ | ✓ | hint |
| Prep | drying, adhesion, brim | in profile | partial | partial | partial |

Canonical schema: `packages/canonical-profile` (`dimensional.shrinkagePercentXy/Z`).

## Honesty

- OFD does **not** publish shrinkage for most filaments — expect `—` until community data lands.
- Not every OFD filament has nozzle/bed temps (~70% do); material default slicer hints are used as fallback when present.
- Submit UI covers the common set; the API accepts the wider parameter map.
