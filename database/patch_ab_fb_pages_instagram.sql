-- Run against the CENTRAL HUB database (webtrix24_customer_portal), not a tenant DB.
-- Adds instagram_business_account_id to ab_fb_pages so Instagram DM webhooks (object=instagram,
-- entry[].id = IG Business Account ID) can resolve to a tenant the same way page_id does for
-- Facebook Page webhooks. Populated by Connections::subscribe() (tenant BE) -> storeFacebookPage()
-- whenever a connected Page has a linked Instagram Business Account.
ALTER TABLE `ab_fb_pages` ADD COLUMN `instagram_business_account_id` VARCHAR(100) NULL AFTER `page_access_token`;
ALTER TABLE `ab_fb_pages` ADD KEY `idx_instagram_business_account_id` (`instagram_business_account_id`);
