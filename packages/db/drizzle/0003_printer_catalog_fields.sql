ALTER TABLE `printer_models` ADD `technology` text;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `catalog_status` text;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `power_w` real;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `heater_power_w` real;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `max_speed_mm_s` real;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `pixel_size_um` real;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `resolution_x` integer;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `resolution_y` integer;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `typical_nozzle_temp_c` real;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `typical_bed_temp_c` real;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `source_type` text;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `source_reference` text;--> statement-breakpoint
ALTER TABLE `printer_models` ADD `metadata_json` text;
