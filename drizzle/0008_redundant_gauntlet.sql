CREATE TABLE `feedback_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`message` text NOT NULL,
	`category` varchar(20) DEFAULT 'other',
	`status` varchar(20) DEFAULT 'open',
	`admin_notes` text,
	`metadata` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolved_at` timestamp,
	`is_deleted` boolean DEFAULT false,
	CONSTRAINT `feedback_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `feedback_tickets` ADD CONSTRAINT `feedback_tickets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `feedback_user_idx` ON `feedback_tickets` (`user_id`,`is_deleted`,`created_at`);--> statement-breakpoint
CREATE INDEX `feedback_admin_list_idx` ON `feedback_tickets` (`status`,`created_at`);