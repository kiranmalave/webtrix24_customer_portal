<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * AccountDeletion — Central account "delete my account" flow.
 *
 * Drives ab_customer's existing deletion-lifecycle columns (deletion_state,
 * scheduled_delete_date, deletion_requested_by, deletion_requested_date,
 * purged_date) — only delete_otp / delete_otp_expiry were added for this
 * flow (see database/patch_customer_account_deletion.sql), to confirm a
 * self-service request before it's allowed to advance the pipeline.
 *
 * 1. requestDeletion()  - looks up the account by account_id, generates an
 *    email OTP and sends it to the account's registered email address.
 * 2. verifyDeletion()   - verifies that OTP and moves deletion_state to
 *    'scheduled', 7 days out (soft delete only — the tenant's provisioned
 *    database is left untouched).
 * 3. cancelDeletion()   - clears a 'scheduled' deletion within the 7-day
 *    grace window, back to deletion_state 'none'.
 * 4. processScheduledDeletions() - cron endpoint (same cron_secret auth as
 *    systems/CoreCron.php) that purges any account whose
 *    scheduled_delete_date has passed.
 */
class AccountDeletion extends CI_Controller
{
	// How long an account-deletion OTP stays valid.
	const OTP_TTL_MINUTES = 10;
	// Grace period between OTP verification and the account actually being purged.
	const DELETION_GRACE_DAYS = 7;

	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("emails");
	}

	/**
	 * POST requestAccountDeletion
	 * param: account_id
	 */
	public function requestDeletion()
	{
		$this->response->decodeRequest();
		$accountId = $this->validatedata->validate('account_id', 'Account ID', true, '', array());

		$customerDetails = $this->CommonModel->getMasterDetails('customer', '', array('account_id' => $accountId));
		if (!isset($customerDetails) || empty($customerDetails)) {
			$this->response->outputErrorResponse(340);
			return;
		}
		$customer = $customerDetails[0];

		if ($customer->deletion_state === 'purged') {
			$this->response->outputErrorResponse(344);
			return;
		}
		if ($customer->deletion_state === 'scheduled') {
			$this->response->outputErrorResponse(341);
			return;
		}

		$otp = mt_rand(100000, 999999);
		$updateData = array(
			'delete_otp'        => $otp,
			'delete_otp_expiry' => date('Y/m/d H:i:s', strtotime('+' . self::OTP_TTL_MINUTES . ' minutes')),
		);
		$isUpdated = $this->CommonModel->updateMasterDetails('customer', $updateData, array('customer_id' => $customer->customer_id));
		if (!$isUpdated) {
			$this->response->outputErrorResponse(998);
			return;
		}

		$emailBody = "<p>Dear " . $customer->name . ",</p>
				<p>We received a request to delete your Webtrix24 account (Account ID: " . $customer->account_id . ").</p>
				<p>Please use the OTP below to confirm this request:</p>
				<p>Deletion OTP: " . $otp . "</p>
				<p>This OTP is valid for " . self::OTP_TTL_MINUTES . " minutes. Once confirmed, your account will be permanently deleted after " . self::DELETION_GRACE_DAYS . " days.</p>
				<p>If you did not request this, please ignore this email — your account will not be affected.</p>
				<p>Best regards,</p>
				<p>The Webtrix24 Team</p>";
		if (!$this->config->item('development')) {
			$this->emails->sendMailDetails("test@webtrix24.com", "Webtrix24", $customer->email, $cc = '', $bcc = '', "Confirm Your Account Deletion Request", $emailBody);
		}

		$status['msg'] = $this->systemmsg->getSucessCode(428);
		$status['statusCode'] = 428;
		$status['data'] = array();
		$status['flag'] = 'S';
		$this->response->output($status, 200);
	}

	/**
	 * POST verifyAccountDeletion
	 * param: account_id, otp
	 */
	public function verifyDeletion()
	{
		$this->response->decodeRequest();
		$accountId = $this->validatedata->validate('account_id', 'Account ID', true, '', array());
		$otp = $this->validatedata->validate('otp', 'OTP', true, '', array());

		$customerDetails = $this->CommonModel->getMasterDetails('customer', '', array('account_id' => $accountId));
		if (!isset($customerDetails) || empty($customerDetails)) {
			$this->response->outputErrorResponse(340);
			return;
		}
		$customer = $customerDetails[0];

		if ($customer->deletion_state === 'purged') {
			$this->response->outputErrorResponse(344);
			return;
		}
		$isOtpValid = isset($customer->delete_otp) && $customer->delete_otp !== '' && hash_equals((string)$customer->delete_otp, (string)$otp);
		$isOtpFresh = isset($customer->delete_otp_expiry) && $customer->delete_otp_expiry !== null && strtotime($customer->delete_otp_expiry) >= time();
		if (!$isOtpValid || !$isOtpFresh) {
			$this->response->outputErrorResponse(342);
			return;
		}

		$now = time();
		$updateData = array(
			'delete_otp'              => null,
			'delete_otp_expiry'       => null,
			'deletion_state'          => 'scheduled',
			'deletion_requested_by'   => $customer->customer_id, // self-service request
			'deletion_requested_date' => date('Y/m/d H:i:s', $now),
			'scheduled_delete_date'   => date('Y/m/d H:i:s', strtotime('+' . self::DELETION_GRACE_DAYS . ' days', $now)),
		);
		$isUpdated = $this->CommonModel->updateMasterDetails('customer', $updateData, array('customer_id' => $customer->customer_id));
		if (!$isUpdated) {
			$this->response->outputErrorResponse(998);
			return;
		}

		$emailBody = "<p>Dear " . $customer->name . ",</p>
				<p>Your request to delete your Webtrix24 account (Account ID: " . $customer->account_id . ") has been confirmed.</p>
				<p>Your account is scheduled to be permanently deleted on " . $updateData['scheduled_delete_date'] . ".</p>
				<p>Changed your mind? Contact our support team at <a href='mailto:support@webtrixsolutions.com'>support@webtrixsolutions.com</a> before that date to cancel this request.</p>
				<p>Best regards,</p>
				<p>The Webtrix24 Team</p>";
		if (!$this->config->item('development')) {
			$this->emails->sendMailDetails("test@webtrix24.com", "Webtrix24", $customer->email, $cc = '', $bcc = '', "Your Account Deletion Has Been Scheduled", $emailBody);
		}

		$status['msg'] = $this->systemmsg->getSucessCode(429);
		$status['statusCode'] = 429;
		$status['scheduled_delete_date'] = $updateData['scheduled_delete_date'];
		$status['data'] = array();
		$status['flag'] = 'S';
		$this->response->output($status, 200);
	}

	/**
	 * POST cancelAccountDeletion
	 * param: account_id
	 */
	public function cancelDeletion()
	{
		$this->response->decodeRequest();
		$accountId = $this->validatedata->validate('account_id', 'Account ID', true, '', array());

		$customerDetails = $this->CommonModel->getMasterDetails('customer', '', array('account_id' => $accountId));
		if (!isset($customerDetails) || empty($customerDetails)) {
			$this->response->outputErrorResponse(340);
			return;
		}
		$customer = $customerDetails[0];

		if ($customer->deletion_state !== 'scheduled') {
			$this->response->outputErrorResponse(343);
			return;
		}

		$updateData = array(
			'deletion_state'          => 'none',
			'deletion_requested_by'   => null,
			'deletion_requested_date' => null,
			'scheduled_delete_date'   => null,
		);
		$isUpdated = $this->CommonModel->updateMasterDetails('customer', $updateData, array('customer_id' => $customer->customer_id));
		if (!$isUpdated) {
			$this->response->outputErrorResponse(998);
			return;
		}

		$emailBody = "<p>Dear " . $customer->name . ",</p>
				<p>Your pending deletion request for your Webtrix24 account (Account ID: " . $customer->account_id . ") has been cancelled. Your account remains active.</p>
				<p>If you didn't request this, please contact our support team at <a href='mailto:support@webtrixsolutions.com'>support@webtrixsolutions.com</a>.</p>
				<p>Best regards,</p>
				<p>The Webtrix24 Team</p>";
		if (!$this->config->item('development')) {
			$this->emails->sendMailDetails("test@webtrix24.com", "Webtrix24", $customer->email, $cc = '', $bcc = '', "Your Account Deletion Request Was Cancelled", $emailBody);
		}

		$status['msg'] = $this->systemmsg->getSucessCode(430);
		$status['statusCode'] = 430;
		$status['data'] = array();
		$status['flag'] = 'S';
		$this->response->output($status, 200);
	}

	/**
	 * GET|POST cron/account/dispatch/deletion
	 *
	 * Purges accounts whose 7-day grace period has passed. Soft delete only:
	 * flips deletion_state to 'purged', stamps purged_date, sets status to
	 * 'InActive', and blanks the login password so the account can no longer
	 * authenticate. The tenant's provisioned database/data is left untouched.
	 */
	public function processScheduledDeletions()
	{
		if (!$this->_isAuthorized()) {
			http_response_code(403);
			echo json_encode(['ok' => false, 'msg' => 'Unauthorized']);
			return;
		}

		$now = date('Y/m/d H:i:s');
		$dueAccounts = $this->db
			->select('customer_id, account_id, name, email')
			->where('deletion_state', 'scheduled')
			->where('scheduled_delete_date IS NOT NULL', null, false)
			->where('scheduled_delete_date <=', $now)
			->get('customer')
			->result();

		$processed = 0;
		$errors = array();
		foreach ($dueAccounts as $account) {
			$updateData = array(
				'deletion_state' => 'purged',
				'purged_date'    => $now,
				'status'         => 'InActive',
				'password'       => null,
			);
			$isUpdated = $this->CommonModel->updateMasterDetails('customer', $updateData, array('customer_id' => $account->customer_id));
			if (!$isUpdated) {
				$errors[] = $account->account_id;
				continue;
			}
			$processed++;

			$emailBody = "<p>Dear " . $account->name . ",</p>
					<p>Your Webtrix24 account (Account ID: " . $account->account_id . ") has now been permanently deleted, as requested.</p>
					<p>Best regards,</p>
					<p>The Webtrix24 Team</p>";
			if (!$this->config->item('development')) {
				$this->emails->sendMailDetails("test@webtrix24.com", "Webtrix24", $account->email, $cc = '', $bcc = '', "Your Account Has Been Deleted", $emailBody);
			}
		}

		header('Content-Type: application/json');
		echo json_encode(['ok' => true, 'data' => [
			'total_due' => count($dueAccounts),
			'processed' => $processed,
			'errors'    => $errors,
		]], JSON_PRETTY_PRINT);
	}

	/**
	 * X-Cron-Secret header / ?cron_secret= / CLI 4th segment must match
	 * $config['cron_secret']. Empty config secret = allow all (dev mode).
	 * Mirrors systems/CoreCron.php::_isAuthorized().
	 */
	private function _isAuthorized()
	{
		$expected = (string)($this->config->item('cron_secret') ?? '');
		if ($expected === '') {
			return true;
		}

		$fromHeader = isset($_SERVER['HTTP_X_CRON_SECRET']) ? $_SERVER['HTTP_X_CRON_SECRET'] : '';
		$fromQuery  = (string)($this->input->get('cron_secret', true) ?? '');

		$fromCli = '';
		if ($this->input->is_cli_request()) {
			$fromCli = (string)($this->uri->segment(4) ?? '');
		}

		return hash_equals($expected, $fromHeader)
			|| hash_equals($expected, $fromQuery)
			|| ($fromCli !== '' && hash_equals($expected, $fromCli));
	}
}
