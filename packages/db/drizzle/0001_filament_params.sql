-- Catalog + calibration parameter expansion (shrinkage, chamber range, OFD fields)
ALTER TABLE `filament_products` ADD `diameter_tolerance_mm` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `min_nozzle_diameter_mm` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `safety_sheet_url` text;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `mfr_chamber_temp_min_c` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `mfr_chamber_temp_max_c` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `mfr_preheat_temp_c` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `shrinkage_percent_xy` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `shrinkage_percent_z` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `shore_hardness_a` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `shore_hardness_d` real;--> statement-breakpoint
ALTER TABLE `filament_products` ADD `catalog_slicer_hints_json` text;--> statement-breakpoint
ALTER TABLE `calibration_revisions` ADD `shrinkage_percent_xy` real;--> statement-breakpoint
ALTER TABLE `calibration_revisions` ADD `shrinkage_percent_z` real;
