CREATE TABLE `api_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`token_hash` text NOT NULL,
	`scopes` text NOT NULL,
	`expires_at` text,
	`revoked_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_tokens_uuid_unique` ON `api_tokens` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `api_tokens_token_hash_unique` ON `api_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `api_tokens_user_idx` ON `api_tokens` (`user_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`actor_user_id` integer,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_uuid` text,
	`reason` text,
	`metadata_json` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audit_log_uuid_unique` ON `audit_log` (`uuid`);--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_log` (`entity_type`,`entity_uuid`);--> statement-breakpoint
CREATE TABLE `build_plates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`surface_kind` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `build_plates_uuid_unique` ON `build_plates` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `build_plates_slug_unique` ON `build_plates` (`slug`);--> statement-breakpoint
CREATE TABLE `calibration_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`filament_variant_id` integer NOT NULL,
	`printer_model_id` integer NOT NULL,
	`toolhead_config_id` integer NOT NULL,
	`build_plate_id` integer,
	`created_by_user_id` integer NOT NULL,
	`title` text NOT NULL,
	`current_revision_id` integer,
	`is_synthetic_fixture` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`filament_variant_id`) REFERENCES `filament_variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`printer_model_id`) REFERENCES `printer_models`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`toolhead_config_id`) REFERENCES `toolhead_configs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`build_plate_id`) REFERENCES `build_plates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `calibration_profiles_uuid_unique` ON `calibration_profiles` (`uuid`);--> statement-breakpoint
CREATE INDEX `profile_variant_idx` ON `calibration_profiles` (`filament_variant_id`);--> statement-breakpoint
CREATE INDEX `profile_printer_idx` ON `calibration_profiles` (`printer_model_id`);--> statement-breakpoint
CREATE INDEX `profile_toolhead_idx` ON `calibration_profiles` (`toolhead_config_id`);--> statement-breakpoint
CREATE TABLE `calibration_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`profile_id` integer NOT NULL,
	`revision_number` integer NOT NULL,
	`parent_revision_id` integer,
	`forked_from_revision_id` integer,
	`created_by_user_id` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`changelog` text,
	`slicer_name` text,
	`slicer_version` text,
	`firmware_version` text,
	`batch_lot` text,
	`ambient_temp_c` real,
	`ambient_rh_percent` real,
	`filament_drying_state` text,
	`user_confidence` real,
	`notes` text,
	`nozzle_temp_first_layer_c` real,
	`nozzle_temp_other_layers_c` real,
	`nozzle_temp_min_c` real,
	`nozzle_temp_max_c` real,
	`bed_temp_first_layer_c` real,
	`bed_temp_other_layers_c` real,
	`chamber_temp_c` real,
	`enclosure_recommended` integer,
	`flow_ratio` real,
	`pressure_advance` real,
	`linear_advance` real,
	`max_volumetric_flow_mm3s` real,
	`min_volumetric_flow_mm3s` real,
	`fan_min_percent` real,
	`fan_max_percent` real,
	`bridge_fan_percent` real,
	`fan_disable_first_layers` integer,
	`retraction_distance_mm` real,
	`retraction_speed_mms` real,
	`deretraction_speed_mms` real,
	`wipe` integer,
	`z_hop_mm` real,
	`recommended_outer_wall_max_mms` real,
	`recommended_bridge_speed_mms` real,
	`drying_temp_c` real,
	`drying_duration_hours` real,
	`recommended_max_rh_percent` real,
	`pre_print_drying_required` integer,
	`annealing_notes` text,
	`post_processing_notes` text,
	`adhesive_recommendation` text,
	`brim_recommended` integer,
	`build_surface_notes` text,
	`quality_score` real,
	`is_synthetic_fixture` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `calibration_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `calibration_revisions_uuid_unique` ON `calibration_revisions` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `revision_number_unique` ON `calibration_revisions` (`profile_id`,`revision_number`);--> statement-breakpoint
CREATE INDEX `revision_profile_idx` ON `calibration_revisions` (`profile_id`);--> statement-breakpoint
CREATE INDEX `revision_status_idx` ON `calibration_revisions` (`status`);--> statement-breakpoint
CREATE TABLE `evidence_assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`revision_id` integer NOT NULL,
	`observation_id` integer,
	`kind` text NOT NULL,
	`mime_type` text NOT NULL,
	`storage_key` text NOT NULL,
	`byte_size` integer,
	`caption` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`revision_id`) REFERENCES `calibration_revisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`observation_id`) REFERENCES `raw_observations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evidence_assets_uuid_unique` ON `evidence_assets` (`uuid`);--> statement-breakpoint
CREATE TABLE `filament_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`manufacturer_id` integer NOT NULL,
	`material_family_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`product_line` text,
	`slug` text NOT NULL,
	`description` text,
	`diameter_mm` real DEFAULT 1.75 NOT NULL,
	`nominal_spool_weight_g` real,
	`density_g_cm3` real,
	`datasheet_url` text,
	`mfr_nozzle_temp_min_c` real,
	`mfr_nozzle_temp_max_c` real,
	`mfr_bed_temp_min_c` real,
	`mfr_bed_temp_max_c` real,
	`mfr_chamber_temp_c` real,
	`drying_temp_c` real,
	`drying_duration_hours` real,
	`storage_recommendation` text,
	`abrasive` integer DEFAULT false NOT NULL,
	`hygroscopic_rating` text,
	`food_contact_documented` integer,
	`source_type` text,
	`source_reference` text,
	`verified` integer DEFAULT false NOT NULL,
	`created_by_user_id` integer,
	`is_synthetic_fixture` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`material_family_id`) REFERENCES `material_families`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `filament_products_uuid_unique` ON `filament_products` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `filament_product_slug_unique` ON `filament_products` (`manufacturer_id`,`slug`);--> statement-breakpoint
CREATE INDEX `filament_product_mfr_idx` ON `filament_products` (`manufacturer_id`);--> statement-breakpoint
CREATE INDEX `filament_product_material_idx` ON `filament_products` (`material_family_id`);--> statement-breakpoint
CREATE TABLE `filament_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`filament_product_id` integer NOT NULL,
	`variant_name` text NOT NULL,
	`slug` text NOT NULL,
	`color_name` text,
	`primary_color_hex` text,
	`secondary_color_hex` text,
	`finish` text,
	`translucency` text,
	`glitter` integer DEFAULT false NOT NULL,
	`silk` integer DEFAULT false NOT NULL,
	`matte` integer DEFAULT false NOT NULL,
	`glow_in_dark` integer DEFAULT false NOT NULL,
	`carbon_filled` integer DEFAULT false NOT NULL,
	`glass_filled` integer DEFAULT false NOT NULL,
	`wood_filled` integer DEFAULT false NOT NULL,
	`metal_filled` integer DEFAULT false NOT NULL,
	`appearance_kind` text DEFAULT 'solid' NOT NULL,
	`manufacturer_sku` text,
	`ean` text,
	`upc` text,
	`gtin` text,
	`spool_weight_g` real,
	`spool_material` text,
	`notes` text,
	`discontinued` integer DEFAULT false NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`is_synthetic_fixture` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`filament_product_id`) REFERENCES `filament_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `filament_variants_uuid_unique` ON `filament_variants` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `filament_variant_slug_unique` ON `filament_variants` (`filament_product_id`,`slug`);--> statement-breakpoint
CREATE INDEX `filament_variant_product_idx` ON `filament_variants` (`filament_product_id`);--> statement-breakpoint
CREATE INDEX `filament_variant_ean_idx` ON `filament_variants` (`ean`);--> statement-breakpoint
CREATE INDEX `filament_variant_sku_idx` ON `filament_variants` (`manufacturer_sku`);--> statement-breakpoint
CREATE TABLE `manufacturer_aliases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manufacturer_id` integer NOT NULL,
	`alias` text NOT NULL,
	`normalized_alias` text NOT NULL,
	FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manufacturer_alias_unique` ON `manufacturer_aliases` (`normalized_alias`);--> statement-breakpoint
CREATE INDEX `manufacturer_alias_mfr_idx` ON `manufacturer_aliases` (`manufacturer_id`);--> statement-breakpoint
CREATE TABLE `manufacturers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`website` text,
	`country` text,
	`description` text,
	`verified` integer DEFAULT false NOT NULL,
	`logo_ref` text,
	`is_synthetic_fixture` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manufacturers_uuid_unique` ON `manufacturers` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `manufacturers_slug_unique` ON `manufacturers` (`slug`);--> statement-breakpoint
CREATE TABLE `material_aliases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_family_id` integer NOT NULL,
	`alias` text NOT NULL,
	`normalized_alias` text NOT NULL,
	FOREIGN KEY (`material_family_id`) REFERENCES `material_families`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `material_alias_unique` ON `material_aliases` (`normalized_alias`);--> statement-breakpoint
CREATE TABLE `material_families` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`parent_material_id` integer,
	`category` text,
	`typical_properties` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `material_families_uuid_unique` ON `material_families` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `material_families_code_unique` ON `material_families` (`code`);--> statement-breakpoint
CREATE TABLE `printer_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`manufacturer_name` text NOT NULL,
	`model` text NOT NULL,
	`revision` text,
	`slug` text NOT NULL,
	`build_volume_x_mm` real,
	`build_volume_y_mm` real,
	`build_volume_z_mm` real,
	`firmware_family` text,
	`kinematics` text,
	`max_nozzle_temp_c` real,
	`max_bed_temp_c` real,
	`chamber_capable` integer DEFAULT false NOT NULL,
	`extruder_type` text,
	`notes` text,
	`is_synthetic_fixture` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `printer_models_uuid_unique` ON `printer_models` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `printer_models_slug_unique` ON `printer_models` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `printer_model_unique` ON `printer_models` (`manufacturer_name`,`model`,`revision`);--> statement-breakpoint
CREATE TABLE `profile_confirmations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`revision_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`printer_model_id` integer,
	`toolhead_config_id` integer,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`revision_id`) REFERENCES `calibration_revisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`printer_model_id`) REFERENCES `printer_models`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`toolhead_config_id`) REFERENCES `toolhead_configs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_confirmations_uuid_unique` ON `profile_confirmations` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `confirmation_unique` ON `profile_confirmations` (`revision_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `confirmation_revision_idx` ON `profile_confirmations` (`revision_id`);--> statement-breakpoint
CREATE TABLE `profile_failure_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`revision_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`category` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`revision_id`) REFERENCES `calibration_revisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_failure_reports_uuid_unique` ON `profile_failure_reports` (`uuid`);--> statement-breakpoint
CREATE INDEX `failure_revision_idx` ON `profile_failure_reports` (`revision_id`);--> statement-breakpoint
CREATE TABLE `raw_observations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`revision_id` integer NOT NULL,
	`test_type` text NOT NULL,
	`test_start` real,
	`test_end` real,
	`increment` real,
	`observed_limit` real,
	`chosen_operating_limit` real,
	`safety_margin` real,
	`unit` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`revision_id`) REFERENCES `calibration_revisions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `raw_observations_uuid_unique` ON `raw_observations` (`uuid`);--> statement-breakpoint
CREATE INDEX `observation_revision_idx` ON `raw_observations` (`revision_id`);--> statement-breakpoint
CREATE TABLE `rfid_mappings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`filament_variant_id` integer NOT NULL,
	`rfid_scheme_id` integer NOT NULL,
	`material_identifier` text,
	`color_encoding` text,
	`vendor_specific_json` text,
	`lossy_color_mapping` integer DEFAULT false NOT NULL,
	`compatibility_notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`filament_variant_id`) REFERENCES `filament_variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rfid_scheme_id`) REFERENCES `rfid_schemes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rfid_mappings_uuid_unique` ON `rfid_mappings` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `rfid_mapping_unique` ON `rfid_mappings` (`filament_variant_id`,`rfid_scheme_id`);--> statement-breakpoint
CREATE TABLE `rfid_schemes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`name` text NOT NULL,
	`vendor` text NOT NULL,
	`version` text NOT NULL,
	`tag_technology` text,
	`tag_capacity_bytes` integer,
	`requires_authentication` integer DEFAULT false NOT NULL,
	`encoding_version` text,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rfid_schemes_uuid_unique` ON `rfid_schemes` (`uuid`);--> statement-breakpoint
CREATE TABLE `search_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_uuid` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`normalized` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_entity_unique` ON `search_documents` (`entity_type`,`entity_uuid`);--> statement-breakpoint
CREATE INDEX `search_normalized_idx` ON `search_documents` (`normalized`);--> statement-breakpoint
CREATE TABLE `toolhead_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`printer_model_id` integer NOT NULL,
	`hotend_name` text NOT NULL,
	`hotend_revision` text,
	`heater_capability` text,
	`extruder` text,
	`nozzle_diameter_mm` real NOT NULL,
	`nozzle_material` text,
	`nozzle_type` text,
	`high_flow` integer DEFAULT false NOT NULL,
	`aftermarket` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`printer_model_id`) REFERENCES `printer_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `toolhead_configs_uuid_unique` ON `toolhead_configs` (`uuid`);--> statement-breakpoint
CREATE INDEX `toolhead_printer_idx` ON `toolhead_configs` (`printer_model_id`);--> statement-breakpoint
CREATE INDEX `toolhead_nozzle_idx` ON `toolhead_configs` (`nozzle_diameter_mm`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`role` text DEFAULT 'registered' NOT NULL,
	`trust_score` real DEFAULT 1 NOT NULL,
	`reputation` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_uuid_unique` ON `users` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);