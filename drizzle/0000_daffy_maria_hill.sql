CREATE TABLE `chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` json NOT NULL,
	`order_index` int DEFAULT 0,
	`points_reward` int DEFAULT 10,
	CONSTRAINT `chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(255),
	`difficulty` varchar(50) NOT NULL DEFAULT 'Beginner',
	`category` varchar(100),
	`order_index` int DEFAULT 0,
	`is_published` boolean DEFAULT true,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`course_id` int NOT NULL,
	`progress` json,
	`started_at` timestamp DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interview_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(10),
	`color` varchar(50),
	`order_index` int DEFAULT 0,
	CONSTRAINT `interview_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `interview_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `interview_chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` json NOT NULL,
	`order_index` int DEFAULT 0,
	CONSTRAINT `interview_chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interview_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`difficulty` varchar(20) NOT NULL DEFAULT 'medium',
	`tags` json,
	`is_top50` boolean DEFAULT false,
	CONSTRAINT `interview_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`messages` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `mentor_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `problems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`difficulty` varchar(20) NOT NULL DEFAULT 'medium',
	`category` varchar(100),
	`tags` json,
	`starter_code` text,
	`solution_code` text,
	`test_cases` json,
	`order_index` int DEFAULT 0,
	CONSTRAINT `problems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`bio` text,
	`skills` json,
	`points` int DEFAULT 0,
	`subscription` varchar(255),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interview_chapters` ADD CONSTRAINT `interview_chapters_category_id_interview_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `interview_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interview_questions` ADD CONSTRAINT `interview_questions_category_id_interview_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `interview_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mentor_conversations` ADD CONSTRAINT `mentor_conversations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;