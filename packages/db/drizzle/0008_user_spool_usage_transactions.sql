CREATE TABLE `user_spool_usage_transactions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `uuid` text NOT NULL,
  `spool_id` integer NOT NULL,
  `print_job_id` text,
  `event_id` text,
  `slicer` text,
  `slicer_version` text,
  `printer_integration_type` text,
  `status` text DEFAULT 'unknown' NOT NULL,
  `predicted_json` text DEFAULT '{}' NOT NULL,
  `printer_reported_json` text DEFAULT '{}' NOT NULL,
  `deducted_json` text DEFAULT '{}' NOT NULL,
  `material_density_g_cm3` real DEFAULT 1.24 NOT NULL,
  `filament_diameter_mm` real DEFAULT 1.75 NOT NULL,
  `usage_source` text NOT NULL,
  `confidence` text NOT NULL,
  `recorded_at` text NOT NULL,
  `automatically_generated` integer DEFAULT false NOT NULL,
  `manually_confirmed` integer DEFAULT false NOT NULL,
  `original_values_json` text DEFAULT '{}' NOT NULL,
  `correction_of_transaction_uuid` text,
  `notes` text,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (`spool_id`) REFERENCES `user_spools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_spool_usage_transactions_uuid_unique` ON `user_spool_usage_transactions` (`uuid`);
--> statement-breakpoint
CREATE INDEX `user_spool_usage_spool_idx` ON `user_spool_usage_transactions` (`spool_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_spool_usage_event_unique` ON `user_spool_usage_transactions` (`spool_id`,`event_id`);
