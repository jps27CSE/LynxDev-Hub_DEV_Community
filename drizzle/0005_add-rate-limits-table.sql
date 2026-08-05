CREATE TABLE `rate_limits` (
	`bucket` varchar(255) NOT NULL,
	`window_start` bigint NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	CONSTRAINT `rate_limits_bucket` PRIMARY KEY(`bucket`)
);
