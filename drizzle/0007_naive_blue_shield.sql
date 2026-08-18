ALTER TABLE `users` ADD `clerk_id` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_clerk_id_unique` UNIQUE(`clerk_id`);