CREATE TABLE `sd_task_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`task_slug` varchar(120) NOT NULL,
	`graph` json,
	`criteria_met` json,
	`attempts` int DEFAULT 0,
	`revealed` json,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sd_task_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `sd_task_state_user_task_idx` UNIQUE(`user_id`,`task_slug`)
);
--> statement-breakpoint
ALTER TABLE `sd_task_state` ADD CONSTRAINT `sd_task_state_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;