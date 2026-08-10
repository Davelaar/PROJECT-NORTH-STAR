# Print Usage Tracking Sources

Access date for all sources: 2026-08-10.

OpenFilament uses conservative terminology:

- Slicer estimate: predicted consumption before printing.
- Completed-print estimate: a full slicer estimate deducted only after successful completion is confirmed.
- Printer-reported usage: extrusion reported by printer or print server, not physical measurement.
- Manual correction: user-entered or corrected grams.
- Scale-measured usage: physical weight difference from compatible hardware.
- Actual usage: reserved for physical measurement.

## Evidence

| Product | Primary evidence | Conservative conclusion |
| --- | --- | --- |
| OrcaSlicer | https://github.com/OrcaSlicer/OrcaSlicer/wiki/built_in_placeholders_variables | Placeholders expose predicted filament length, volume, weight, cost and related post-slice values. They are slicer estimates, not completed-print measurements. |
| Bambu Studio | https://wiki.bambulab.com/en/software/bambu-studio/view-slicing-information | Preview exposes predicted print time and filament length/weight. This does not prove a stable public third-party usage API. |
| Creality Print | https://wiki.creality.com/en/software/6-0/release-notes-7-0-0 | Creality documents filament-usage estimation improvements. Native cloud/device consumption tracking remains unverified for OpenFilament. |
| PrusaSlicer | https://help.prusa3d.com/article/list-of-placeholders_205643 | Placeholders expose used filament, extruded volume, total weight and cost after slicing. These remain estimates. |
| Moonraker/Klipper | https://moonraker.readthedocs.io/en/latest/printer_objects/ and https://www.klipper3d.org/Status_Reference.html | Moonraker/Klipper can expose job state and `filament_used`/print stats. Reported extrusion is not physical measurement and depends on correct setup. |
| OctoPrint | https://docs.octoprint.org/en/main/api/job.html and https://docs.octoprint.org/en/main/api/datamodel.html | OctoPrint exposes job status and optional estimated filament data. Standard events do not guarantee accurate executed extrusion for failed prints. |

## Open Questions

- Bambu LAN/MQTT/cloud stability and whether any interface is officially supported for third-party usage tracking.
- Native Creality Cloud/device interfaces and which printer/firmware combinations expose reliable job usage data.
- Whether Prusa Connect or PrusaLink exposes partial consumption data suitable for failed/cancelled prints.
- Which OctoPrint plugins can validate executed-extrusion tracking well enough for inventory deduction.
- Multi-AMS, CFS and MMU attribution from tool/slot to physical OpenFilament spool.
- Browser private-network access limitations around HTTPS, CORS, local printer IPs and permission prompts.

## Validation Status

The current implementation is structurally tested in code. No real printer, AMS/CFS/MMU, NFC hardware, scale hardware, Moonraker server, OctoPrint server, Bambu printer or Creality printer has been validated as part of this change.
