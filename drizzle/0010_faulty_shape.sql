-- Custom SQL migration file, put your code below!

-- Neutralise the placeholder message seeded in 0009. The original text
-- ("Edit this notice from Admin > Site Notice...") leaked admin-panel
-- terminology to end users, because it becomes visible the moment an admin
-- enables the notice without editing the copy first.
--
-- 0009 cannot be edited (it is already recorded in __drizzle_migrations), so
-- the row is corrected forward here instead.
UPDATE `site_notices` SET `message` = 'We are performing maintenance. Some content may be temporarily unavailable.' WHERE `id` = 1 AND `message` = 'Edit this notice from Admin > Site Notice, then enable it to show a message to all users.'; --