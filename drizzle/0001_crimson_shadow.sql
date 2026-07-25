--> statement-breakpoint
ALTER TABLE `interview_questions` DROP FOREIGN KEY `interview_questions_category_id_interview_categories_id_fk`;
--> statement-breakpoint
ALTER TABLE `interview_questions` DROP COLUMN `category_id`;
--> statement-breakpoint
CREATE TABLE `interview_question_chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_id` int NOT NULL,
	`chapter_id` int NOT NULL,
	CONSTRAINT `interview_question_chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `interview_question_chapters` ADD CONSTRAINT `interview_question_chapters_question_id_interview_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `interview_questions`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `interview_question_chapters` ADD CONSTRAINT `interview_question_chapters_chapter_id_interview_chapters_id_fk` FOREIGN KEY (`chapter_id`) REFERENCES `interview_chapters`(`id`) ON DELETE no action ON UPDATE no action;
