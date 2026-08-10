CREATE TABLE `user_spools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`user_id` integer NOT NULL,
	`client_id` text,
	`manufacturer_uuid` text,
	`manufacturer_name` text,
	`product_uuid` text,
	`product_name` text,
	`variant_uuid` text,
	`variant_name` text,
	`color_hex` text,
	`material_code` text,
	`initial_net_weight_g` real,
	`current_weight_g` real,
	`tare_weight_g` real,
	`remaining_percent` real,
	`purchase_date` text,
	`opened_date` text,
	`batch_lot` text,
	`notes` text,
	`storage_location` text,
	`status` text DEFAULT 'sealed' NOT NULL,
	`preferred_printer_uuid` text,
	`preferred_nozzle_mm` real,
	`archived_at` text,
	`deleted_at` text,
	`sync_version` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_spools_uuid_unique` ON `user_spools` (`uuid`);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_spools_user_client_unique` ON `user_spools` (`user_id`,`client_id`);
--> statement-breakpoint
CREATE INDEX `user_spools_user_idx` ON `user_spools` (`user_id`);
--> statement-breakpoint
CREATE INDEX `user_spools_status_idx` ON `user_spools` (`user_id`,`status`);
--> statement-breakpoint
CREATE TABLE `user_spool_drying_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`spool_id` integer NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`temp_c` real,
	`duration_hours` real,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`spool_id`) REFERENCES `user_spools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_spool_drying_uuid_unique` ON `user_spool_drying_events` (`uuid`);
--> statement-breakpoint
CREATE INDEX `user_spool_drying_spool_idx` ON `user_spool_drying_events` (`spool_id`);
--> statement-breakpoint
CREATE TABLE `user_spool_identities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`spool_id` integer NOT NULL,
	`kind` text NOT NULL,
	`value` text NOT NULL,
	`label` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`spool_id`) REFERENCES `user_spools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_spool_identities_uuid_unique` ON `user_spool_identities` (`uuid`);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_spool_identities_kind_value` ON `user_spool_identities` (`kind`,`value`);
--> statement-breakpoint
CREATE INDEX `user_spool_identities_spool_idx` ON `user_spool_identities` (`spool_id`);
--> statement-breakpoint
CREATE TABLE `user_privacy_prefs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`consent_version` text NOT NULL,
	`analytics` integer DEFAULT false NOT NULL,
	`marketing` integer DEFAULT false NOT NULL,
	`preferences` integer DEFAULT true NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`decided_at` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_privacy_prefs_user_unique` ON `user_privacy_prefs` (`user_id`);
--> statement-breakpoint
CREATE TABLE `account_deletion_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`user_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_at` text DEFAULT (datetime('now')) NOT NULL,
	`completed_at` text,
	`notes` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_deletion_jobs_uuid_unique` ON `account_deletion_jobs` (`uuid`);
--> statement-breakpoint
CREATE INDEX `account_deletion_jobs_status_idx` ON `account_deletion_jobs` (`status`);
--> statement-breakpoint
CREATE TABLE `contribution_terms_acceptances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`user_id` integer,
	`terms_version` text NOT NULL,
	`accepted_at` text DEFAULT (datetime('now')) NOT NULL,
	`ip_hash` text,
	`contribution_ref` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contribution_terms_uuid_unique` ON `contribution_terms_acceptances` (`uuid`);
--> statement-breakpoint
ALTER TABLE `api_tokens` ADD `last_used_at` text;
--> statement-breakpoint
ALTER TABLE `api_tokens` ADD `user_agent` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `email_verified_at` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_at` text;
