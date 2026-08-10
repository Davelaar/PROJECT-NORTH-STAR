# External filament catalog sources

## Optional seed: Open Filament Database (MIT)

OpenFilament’s **live catalog is stored on the OpenFilament server** (SQLite). Users add and correct brands, products and colours on OpenFilament.

OFD can be used as an optional **bulk seed** of manufacturer/product/variant identity (MIT). Runtime does **not** depend on OFD being online.

**Upstream browse (seed source only):** [https://openfilamentdatabase.org](https://openfilamentdatabase.org)  
**Static API:** [https://api.openfilamentdatabase.org](https://api.openfilamentdatabase.org/)  
**Source:** [OpenFilamentCollective/open-filament-database](https://github.com/OpenFilamentCollective/open-filament-database)  
**License:** MIT  
**Bulk dump:** GitHub release `all.json.gz` (also via the API site)

OFD pairs usefully with the open NFC format **OpenPrintTag** ([spec](https://specs.openprinttag.org/), see [`OPENPRINTTAG.md`](OPENPRINTTAG.md)). Catalog changes for OpenFilament are made on OpenFilament, not via the OFD editor.

### Commands

```bash
./scripts/fetch-ofd-catalog.sh   # downloads data/external/ofd-all.json
pnpm db:import-ofd               # upserts brands/products/variants into SQLite
# or after a wipe:
pnpm db:reset                    # fixtures + OFD import when dataset is present
```

### Mapped fields

| OFD | OpenFilament |
|-----|----------------|
| brands | `manufacturers` |
| material name + material defaults | `material_families` + fallback temps / dry temp |
| filaments (temps, density, chamber, dry, datasheets, shore, diameter tolerance, min nozzle, slicer_settings) | `filament_products` |
| sizes (diameter, weight, article_number, **gtin**) | product diameter, variant spool weight / **SKU** / **EAN·UPC·GTIN** |
| purchase_links + stores | variant `purchase_links_json` (where to buy; Amazon gets affiliate tag) |
| variants (color, traits incl. `contains_*`) | `filament_variants` (+ color swatch preview; optional `preview_image_url`) |

After catalog import, `pnpm db:import-ofd-starters` creates **exportable starter profiles** for Generic FFF at nozzle diameters **0.2, 0.25, 0.4, 0.6, 0.8, and 1.0 mm**, using manufacturer mid-range nozzle/bed temps. These are labeled `ofd-starter:…` — **not** community-measured calibrations. Default nozzle when unspecified is **0.4 mm**.

Runtime can also generate an on-demand **calculated starter profile** for a selected variant, printer and nozzle:

```http
GET /api/v1/variants/{uuid}/exports/starter?format={openfilamentprofile|orca|creality|prusaslicer|bambu}&printerUuid={uuid}&nozzleDiameterMm=0.4
```

That runtime profile combines catalog/manufacturer filament values with the printer metadata and generic printer-template heuristics documented in [`PRINTERS.md`](PRINTERS.md). It is explicitly marked as calculated, untested and not measured.

OFD UUIDs are preserved. No measured slicer calibrations or shrinkage are invented by the importer; generated starters remain starter templates, not community measurements.

Attribution is appreciated by upstream; see their README.

---

## Why other sources were not imported

OpenFilament only bulk-imports data with a clear redistributable license (today: OFD MIT). That is why other popular sites are not scraped into the database.

### Not imported: filamentcheatsheet.com

- `robots.txt` disallows `/api/`
- No public MIT/open bulk dump found
- Scraping or redistributing their proprietary database is not done

If they publish an open export later, add an adapter under `packages/db/src/`.

### Not imported: 3dfilamentprofiles.com

- Site is account/login oriented; API behind bot protection
- Terms forbid building a derivative database / automated collection without a license
- No redistributable open dataset discovered

### Not imported: slicer system trees / SimplyPrint slicer-profiles-db

- Vendor slicer trees and third-party profile dumps often lack a clear redistributable data license
- OpenFilament stores its own profile model and exports **out** to slicers; it does not bulk-copy proprietary preset trees

Community users can still submit measured calibrations and import personal presets (drafts, not auto-published community truth).

---

## Printers: Open 3D Printer Database (CC-BY-4.0)

**Repo:** [swordlab/open-3d-printer-database](https://github.com/swordlab/open-3d-printer-database)

Bulk-imported into `printer_models` with technology (`fff` / `resin` / `sls`), build volume, power, and related public specs. See [`PRINTERS.md`](PRINTERS.md).

```bash
./scripts/fetch-open-printer-catalog.sh
pnpm db:import-open-printers
```

---

## Refresh

Set `OFD_DATASET_TAG=dataset-vYYYY.MM.DD` when fetching a newer release tag.
