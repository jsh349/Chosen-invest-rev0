ALTER TABLE `assets` ADD COLUMN `cost_basis_cents` integer;
--> statement-breakpoint
CREATE TABLE `rank_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`total_asset_value` integer NOT NULL,
	`overall_percentile` integer,
	`age_percentile` integer,
	`return_percentile` integer,
	`benchmark_version` text,
	`benchmark_source` text,
	`saved_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
