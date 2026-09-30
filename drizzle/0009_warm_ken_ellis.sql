CREATE TABLE `site_notices` (
	`id` int NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT false,
	`severity` varchar(10) NOT NULL DEFAULT 'info',
	`display` varchar(10) NOT NULL DEFAULT 'banner',
	`title` varchar(120) NOT NULL DEFAULT 'Heads up',
	`message` text NOT NULL,
	`expires_at` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` varchar(255),
	CONSTRAINT `site_notices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT INTO `site_notices` (`id`, `is_enabled`, `severity`, `display`, `title`, `message`) VALUES (1, false, 'info', 'banner', 'Heads up', 'Edit this notice from Admin > Site Notice, then enable it to show a message to all users.');
