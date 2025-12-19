<?php
defined('BASEPATH') or exit('No direct script access allowed');

class FacebookConnect extends CI_Controller
{
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("response");
		$this->load->library("ValidateData");
        if(!$this->config->item('development')){
            $this->load->library("WhatsAppApi");	
        }
    }
    private function detectSubdomain()
	{
	    // Always check header first
	    $headerSub = $this->input->get_request_header('X-WEBTRIX-SUBDOMAIN', true);
	    if (!empty($headerSub)) return strtolower($headerSub);

	    // Fallback to domain
	    $host = $_SERVER['HTTP_HOST'] ?? '';
	    $parts = explode('.', strtolower($host));

	    return (count($parts) >= 3) ? $parts[0] : null;
	}

	// for lead captured
	public function storeFacebookPage()
	{
		$input = json_decode(file_get_contents('php://input'), true);
		if (empty($input)) $input = $this->input->post();

		$subdomain = $this->detectSubdomain();
		if (empty($subdomain)) {
			return $this->response->output([
				'flag' => 'F',
				'msg' => "Unauthorized or unknown tenant. No subdomain found.",
			], 400);
		}
		log_message('info', "FB Request received from subdomain: {$subdomain}");
		// Get tenant (same as WhatsApp)
		$tenant = $this->CommonModel->getMasterDetails('customer', '*', ['sub_domain_name' => $subdomain]);
		if (empty($tenant)) {
			return $this->response->output([
				'flag' => 'F',
				'msg' => "Unauthorized tenant: {$subdomain}",
			], 400);
		}
		// Validation
		if (empty($input['company_id']) || empty($input['page_id']) || empty($input['page_token'])) {
			return $this->response->output([
				'flag' => 'F',
				'msg' => 'Missing required fields',
			], 400);
		}

		$where = [
			'tenant_id' => $tenant[0]->customer_id,
			'company_id' => $input['company_id'],
			'page_id'    => $input['page_id']
		];

		$data = [
			'tenant_id'     => $tenant[0]->customer_id,
			'company_id'    => $input['company_id'],
			'business_id'   => $input['business_id'] ?? null,
			'page_id'       => $input['page_id'],
			'page_name'     => $input['page_name'] ?? null,
			'page_token'    => $input['page_token'],
			'modified_date' => date('Y-m-d H:i:s')
		];

		// Insert/update
		$exists = $this->CommonModel->getMasterDetails('fb_pages', '*', $where);
		if (!empty($exists)) {
			$res = $this->CommonModel->updateMasterDetails('fb_pages', $data, $where);
			$msg = 'Facebook page updated successfully.';
		} else {
			$data['created_date'] = date('Y-m-d H:i:s');
			$res = $this->CommonModel->saveMasterDetails('fb_pages', $data);
			$msg = 'Facebook page added successfully.';
		}

		if (!$res) {
			echo json_encode(['flag' => 'F', 'msg' => "DB Error"]);
			return;
		}

		echo json_encode(['flag' => 'S', 'msg' => $msg]);
	}
	// public function fbWebhook() 
	// {
	// 	$FB_VERIFY_TOKEN = $this->config->item("FB_VERIFY_TOKEN");
	// 	// -----------------------------------------------------------
	// 	// 1. VERIFY WEBHOOK CHALLENGE
	// 	// -----------------------------------------------------------
	// 	if ($_SERVER['REQUEST_METHOD'] === 'GET') {

	// 		if ($this->input->get('hub_verify_token') === $FB_VERIFY_TOKEN) {
	// 			echo $this->input->get('hub_challenge');
	// 			exit;
	// 		}

	// 		echo "Invalid token"; 
	// 		exit;
	// 	}

	// 	// -----------------------------------------------------------
	// 	// 2. PARSE THE PAYLOAD
	// 	// -----------------------------------------------------------
	// 	$payload = json_decode(file_get_contents("php://input"), true);

	// 	if (!$payload || !isset($payload['entry'])) {
	// 		log_message("error", "FB Webhook: Invalid payload");
	// 		echo "OK"; exit;
	// 	}

	// 	foreach ($payload['entry'] as $entry) {

	// 		$pageId = $entry['id'];


	// 		// Case 2: DASHBOARD TEST PAYLOAD = $entry['changes'][0]['value']['page_id']
	// 		if (!$pageId && isset($entry['changes'][0]['value']['page_id'])) {
	// 			$pageId = $entry['changes'][0]['value']['page_id'];
	// 		}

	// 		// Case 3: SPECIAL CASE (manual test) = $payload['value']['page_id']
	// 		if (!$pageId && isset($payload['value']['page_id'])) {
	// 			$pageId = $payload['value']['page_id'];
	// 		}

	// 		if (!$pageId) {
	// 			log_message('error', 'FB Webhook: page_id missing in payload: ' . json_encode($payload));
	// 			continue;
	// 		}

	// 		// -----------------------------------------------------------
	// 		// 3. GET TENANT FROM CENTRAL DB
	// 		// -----------------------------------------------------------
	// 		$tenant = $this->CommonModel->getMasterDetails(
	// 			'fb_pages',
	// 			'*',
	// 			['page_id' => $pageId]
	// 		);

	// 		if (empty($tenant)) {
	// 			log_message("error", "FB Webhook: Tenant not found for Page ID $pageId");
	// 			continue;
	// 		}

	// 		$tenantInfo = $tenant[0];
	// 		$tenantId   = $tenantInfo->tenant_id;
	// 		$pageToken  = $tenantInfo->page_access_token;
			
	// 		// get customer database details
	// 		$tenantDatabase = $this->CommonModel->getMasterDetails('customer','*',['customer_id' =>$tenantId]);
	// 		if (empty($tenantDatabase)) {
	// 			log_message("error", "FB Webhook: Tenant not found for Page ID $pageId");
	// 			continue;
	// 		}
	// 		$db_config = array(
	// 		                'dsn'   => '',
	// 		                'hostname' => 'localhost',
	// 		                'username' => $tenantDatabase[0]->dbUserName,
	// 		                'password' => $tenantDatabase[0]->dbpassword,
	// 		                //'database' => "webtrix24_customers_".$tenantDatabase[0]->database_name,
	// 						'database' => $tenantDatabase[0]->database_name,
	// 		                'dbdriver' => 'mysqli',
	// 		                'dbprefix' => 'ab_',
	// 		                'pconnect' => FALSE,
	// 		                'db_debug' => TRUE,
	// 		                'cache_on' => FALSE,
	// 		                'cachedir' => '',
	// 		                'char_set' => 'utf8',
	// 		                'dbcollat' => 'utf8_general_ci'
	// 		            );

	// 		// -----------------------------------------------------------
	// 		// 4. SWITCH TO TENANT DB
	// 		// -----------------------------------------------------------
	// 		//$this->TenantSwitcher->loadTenantDB($tenantId);
	// 		$tenantDB = $this->load->database($db_config, TRUE);

	// 		// -----------------------------------------------------------
	// 		// 5. PROCESS EACH CHANGE
	// 		// -----------------------------------------------------------
	// 		foreach ($entry['changes'] as $change) {

	// 			if ($change['field'] === 'leadgen') {

	// 				$leadgenId = $change['value']['leadgen_id'];

	// 				// -----------------------------------------------------------
	// 				// 6. QUEUE JOB TO PROCESS LEAD LATER (FAST RESPONSE)
	// 				// -----------------------------------------------------------

	// 				$queueData = [
	// 					"leadgen_id"     => $leadgenId,
	// 					"page_id"        => $pageId,
	// 					"page_token"     => $pageToken,
	// 					"received_date"  => date("Y-m-d H:i:s"),
	// 					"status"         => "pending"
	// 				];

	// 				$tenantDB->insert("fb_lead_queue", $queueData);
	// 				log_message("error", "Queued leadgen_id = " . $leadgenId);
	// 			}
	// 		}
	// 	}

	// 	// -----------------------------------------------------------
	// 	// 7. INSTANT RESPONSE (REQUIRED BY META)
	// 	// -----------------------------------------------------------
	// 	echo "OK";
	// }


	public function fbWebhook() 
	{
		log_message("error", "FB Webhook: Called");
		$FB_VERIFY_TOKEN = $this->config->item("FB_VERIFY_TOKEN");

		// -----------------------------------------------------------
		// 1. VERIFY WEBHOOK CHALLENGE
		// -----------------------------------------------------------
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {

			if ($this->input->get('hub_verify_token') === $FB_VERIFY_TOKEN) {
				echo $this->input->get('hub_challenge');
				exit;
			}

			echo "Invalid token";
			exit;
		}

		// -----------------------------------------------------------
		// 2. READ RAW PAYLOAD
		// -----------------------------------------------------------
		$raw        = file_get_contents("php://input");
		$payload    = json_decode($raw, true);

		if (!$payload) {
			log_message("error", "FB Webhook: Invalid JSON payload: $raw");
			echo "OK";
			exit;
		}

		// -----------------------------------------------------------
		// CASE A: MINIMAL DASHBOARD TEST PAYLOAD (no entry[])
		// -----------------------------------------------------------
		if (isset($payload['field']) && $payload['field'] === 'leadgen') 
		{
			$pageId    = $payload['value']['page_id']    ?? null;
			$leadgenId = $payload['value']['leadgen_id'] ?? null;

			if ($pageId && $leadgenId) {
				log_message("error", "FB Webhook Minimal Test: page=$pageId lead=$leadgenId");
				$this->_queueLeadForTenant($pageId, $leadgenId);
			}

			echo "OK";
			exit;
		}

		// -----------------------------------------------------------
		// CASE B: REAL LEAD + LEAD ADS TEST TOOL (entry[])
		// -----------------------------------------------------------
		if (isset($payload['entry']) && is_array($payload['entry'])) 
		{
			foreach ($payload['entry'] as $entry) 
			{
				// Detect Page ID
				$pageId = $entry['id'] 
							?? ($entry['changes'][0]['value']['page_id'] ?? null);

				if (!$pageId) {
					log_message("error", "FB Webhook: No page_id found in payload: $raw");
					continue;
				}

				if (!isset($entry['changes'])) {
					log_message("error", "FB Webhook: No changes[] found for page: $pageId");
					continue;
				}

				foreach ($entry['changes'] as $change) 
				{
					if ($change['field'] !== 'leadgen') continue;

					$leadgenId = $change['value']['leadgen_id'] ?? null;

					if (!$leadgenId) {
						log_message("error", "FB Webhook: Missing leadgen_id for page $pageId");
						continue;
					}

					log_message("error", "FB Webhook Lead Received: page=$pageId lead=$leadgenId");

					// Process & queue
					$this->_queueLeadForTenant($pageId, $leadgenId);
				}
			}

			echo "OK";
			exit;
		}

		// -----------------------------------------------------------
		// UNKNOWN FORMAT
		// -----------------------------------------------------------
		log_message("error", "FB Webhook: Unrecognized payload: $raw");
		echo "OK";
	}
private function _queueLeadForTenant($pageId, $leadgenId)
{
    // 1. Find tenant by page_id
    $tenant = $this->CommonModel->getMasterDetails("fb_pages", "*", ['page_id' => $pageId]);

    if (empty($tenant)) {
        log_message("error", "FB Webhook: Tenant not found for page_id $pageId");
        return false;
    }

    $tenantInfo = $tenant[0];
    $tenantId   = $tenantInfo->tenant_id;
    $pageToken  = $tenantInfo->page_access_token;

    // 2. Get tenant DB credentials
    $tenantDBData = $this->CommonModel->getMasterDetails("customer", "*", ['customer_id' => $tenantId]);

    if (empty($tenantDBData)) {
        log_message("error", "FB Webhook: Tenant DB not found for tenant_id $tenantId");
        return false;
    }

    // Build DB config
    $db_config = [
        'hostname' => 'localhost',
        'username' => $tenantDBData[0]->dbUserName,
        'password' => $tenantDBData[0]->dbpassword,
        'database' => $tenantDBData[0]->database_name,  // already full name
        'dbdriver' => 'mysqli',
        'dbprefix' => 'ab_',
        'pconnect' => FALSE,
        'db_debug' => TRUE,
        'char_set' => 'utf8',
        'dbcollat' => 'utf8_general_ci'
    ];

    // 3. Switch to tenant DB
    $tenantDB = $this->load->database($db_config, TRUE);

    // 4. Insert to queue
    $tenantDB->insert("fb_lead_queue", [
        "leadgen_id"    => $leadgenId,
        "page_id"       => $pageId,
        "page_token"    => $pageToken,
        "received_date" => date("Y-m-d H:i:s"),
        "status"        => "pending"
    ]);

    log_message("error", "FB Webhook: Queued lead=$leadgenId for tenant=$tenantId");
}

}
