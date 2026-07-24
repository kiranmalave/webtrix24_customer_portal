-- Run against the CENTRAL HUB database (webtrix24_customer_portal), not a tenant DB.
-- Audit log for Meta's Data Deletion Request Callback (meta/DataDeletion.php).
CREATE TABLE `ab_fb_data_deletion_requests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `fb_user_id` VARCHAR(64) NULL,
  `confirmation_code` VARCHAR(64) NOT NULL,
  `status` ENUM('completed','failed') NOT NULL DEFAULT 'completed',
  `raw_signed_request` TEXT NULL,
  `created_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_confirmation_code` (`confirmation_code`),
  KEY `idx_fb_user_id` (`fb_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
