CREATE TABLE `dsa_user_state` (
	`user_id` int NOT NULL,
	`lessons_completed` json,
	`tasks` json,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dsa_user_state_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `dsa_user_state` ADD CONSTRAINT `dsa_user_state_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;