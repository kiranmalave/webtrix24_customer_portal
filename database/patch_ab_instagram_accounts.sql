-- Run against the CENTRAL HUB database (webtrix24_customer_portal), not a tenant DB.
-- Standalone Instagram Business Login accounts are NOT tied to a Facebook Page (no page_id),
-- so they can't reuse ab_fb_pages the way Messenger/leadgen do. This table maps
-- ig_user_id -> tenant for Instagram DM webhook resolution.
CREATE TABLE `ab_instagram_accounts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` INT(11) NOT NULL,
  `company_id` INT(11) NOT NULL,
  `ig_user_id` VARCHAR(100) NOT NULL,
  `created_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_ig` (`tenant_id`, `ig_user_id`),
  KEY `idx_ig_user_id` (`ig_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
