-- Run against the CENTRAL HUB database (webtrix24_customer_portal), not a tenant DB.
-- ab_customer already has a deletion-lifecycle pipeline (deletion_state,
-- scheduled_delete_date, deletion_requested_by, deletion_requested_date,
-- inactive_notified_date, purged_date) — this patch only adds the two
-- columns still missing: the OTP used to confirm a self-service deletion
-- request, and its expiry. Used by systems/AccountDeletion.php.
ALTER TABLE `ab_customer`
  ADD COLUMN `delete_otp` VARCHAR(10) NULL DEFAULT NULL AFTER `mobile_code`,
  ADD COLUMN `delete_otp_expiry` DATETIME NULL DEFAULT NULL AFTER `delete_otp`;
