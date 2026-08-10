CREATE TABLE `cloud_entitlements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`user_id` integer NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL,
	`starts_at` text,
	`paid_until` text,
	`grace_until` text,
	`read_only_from` text,
	`deletion_scheduled_at` text,
	`deleted_at` text,
	`reminder_30_sent_at` text,
	`reminder_7_sent_at` text,
	`reminder_expired_sent_at` text,
	`reminder_deletion_sent_at` text,
	`expiry_reminders_enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_entitlements_uuid_unique` ON `cloud_entitlements` (`uuid`);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_entitlements_user_id_unique` ON `cloud_entitlements` (`user_id`);
--> statement-breakpoint
CREATE INDEX `cloud_entitlements_paid_until_idx` ON `cloud_entitlements` (`paid_until`);
--> statement-breakpoint
CREATE INDEX `cloud_entitlements_status_idx` ON `cloud_entitlements` (`status`);
--> statement-breakpoint
CREATE TABLE `cloud_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`user_id` integer NOT NULL,
	`provider` text DEFAULT 'stripe' NOT NULL,
	`provider_checkout_id` text,
	`provider_payment_id` text,
	`provider_customer_id` text,
	`provider_receipt_url` text,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'eur' NOT NULL,
	`access_months` integer DEFAULT 12 NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`paid_at` text,
	`refunded_at` text,
	`disputed_at` text,
	`raw_provider_status` text,
	`idempotency_key` text NOT NULL,
	`admin_review_required` integer DEFAULT false NOT NULL,
	`admin_review_note` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_payments_uuid_unique` ON `cloud_payments` (`uuid`);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_payments_idempotency_unique` ON `cloud_payments` (`idempotency_key`);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_payments_checkout_unique` ON `cloud_payments` (`provider_checkout_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_payments_payment_id_unique` ON `cloud_payments` (`provider_payment_id`);
--> statement-breakpoint
CREATE INDEX `cloud_payments_user_idx` ON `cloud_payments` (`user_id`);
--> statement-breakpoint
CREATE INDEX `cloud_payments_status_idx` ON `cloud_payments` (`status`);
--> statement-breakpoint
CREATE TABLE `cloud_entitlement_grants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`user_id` integer NOT NULL,
	`payment_id` integer,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`revoked_at` text,
	`revocation_reason` text,
	`source` text DEFAULT 'payment' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payment_id`) REFERENCES `cloud_payments`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_entitlement_grants_uuid_unique` ON `cloud_entitlement_grants` (`uuid`);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_grants_payment_unique` ON `cloud_entitlement_grants` (`payment_id`);
--> statement-breakpoint
CREATE INDEX `cloud_grants_user_idx` ON `cloud_entitlement_grants` (`user_id`);
--> statement-breakpoint
CREATE INDEX `cloud_grants_ends_idx` ON `cloud_entitlement_grants` (`ends_at`);
--> statement-breakpoint
CREATE TABLE `processed_webhook_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`provider_event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`received_at` text DEFAULT (datetime('now')) NOT NULL,
	`processed_at` text,
	`processing_status` text DEFAULT 'received' NOT NULL,
	`error_summary` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `processed_webhook_provider_event_unique` ON `processed_webhook_events` (`provider`,`provider_event_id`);
--> statement-breakpoint
CREATE INDEX `processed_webhook_type_idx` ON `processed_webhook_events` (`event_type`);
--> statement-breakpoint
CREATE TABLE `cloud_admin_audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`admin_user_id` integer NOT NULL,
	`target_user_id` integer,
	`action` text NOT NULL,
	`reason` text NOT NULL,
	`before_json` text,
	`after_json` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_admin_audit_log_uuid_unique` ON `cloud_admin_audit_log` (`uuid`);
--> statement-breakpoint
CREATE INDEX `cloud_admin_audit_target_idx` ON `cloud_admin_audit_log` (`target_user_id`);
