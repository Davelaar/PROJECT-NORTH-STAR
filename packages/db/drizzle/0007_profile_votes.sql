CREATE TABLE `profile_votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`profile_id` integer NOT NULL,
	`user_id` integer,
	`voter_key` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `calibration_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_votes_uuid_unique` ON `profile_votes` (`uuid`);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_vote_unique` ON `profile_votes` (`profile_id`,`voter_key`);
--> statement-breakpoint
CREATE INDEX `profile_vote_profile_idx` ON `profile_votes` (`profile_id`);
--> statement-breakpoint
ALTER TABLE `calibration_profiles` ADD `vote_score` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `calibration_profiles` ADD `vote_up_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `calibration_profiles` ADD `vote_down_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `calibration_profiles` ADD `community_verified` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE INDEX `profile_vote_score_idx` ON `calibration_profiles` (`vote_score`);
