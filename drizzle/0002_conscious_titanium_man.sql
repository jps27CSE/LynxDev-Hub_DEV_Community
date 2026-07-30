CREATE TABLE `interview_category_chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`chapter_id` int NOT NULL,
	`order_index` int DEFAULT 0,
	CONSTRAINT `interview_category_chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `interview_chapters` DROP FOREIGN KEY `interview_chapters_category_id_interview_categories_id_fk`;
--> statement-breakpoint
ALTER TABLE `interview_category_chapters` ADD CONSTRAINT `interview_category_chapters_category_id_interview_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `interview_categories`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `interview_category_chapters` ADD CONSTRAINT `interview_category_chapters_chapter_id_interview_chapters_id_fk` FOREIGN KEY (`chapter_id`) REFERENCES `interview_chapters`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `interview_chapters` DROP COLUMN `category_id`;
--> statement-breakpoint
ALTER TABLE `interview_chapters` DROP COLUMN `order_index`;
