<?php
defined('BASEPATH') or exit('No direct script access allowed');
class WAHub extends CI_Controller
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

	/**
	 * 1️⃣ Store or Update Business Account details
	 * Called by subdomain after connecting WhatsApp
	 * POST params: company_id, subdomain, business_id, waba_id, access_token, token_expiry, business_name
	 */
	public function storeBusinessAccount()
	{
		$input = json_decode(file_get_contents('php://input'), true);
		if (empty($input)) $input = $this->input->post();
        //$subdomain = $this->getSubdomain(); // detect which tenant sent it
        $subdomain = $this->detectSubdomain();
        if (!isset($subdomain) || empty($subdomain)) {
            return $this->response->output([
                    'flag' => 'F',
                    'msg' => "Unauthorized or unknown tenant No subdomain Found. {$subdomain}",
                ], 400);
        }
        log_message('info', "Request received from subdomain: {$subdomain}");
        // find out the tenent details first
        $tenant = $this->CommonModel->getMasterDetails('customer', '*',array('sub_domain_name'=>$subdomain));
        if (!isset($tenant) || empty($tenant)) {
            return $this->response->output([
                    'flag' => 'F',
                    'msg' => "Unauthorized or unknown tenant: {$subdomain}",
                ], 400);
        }
		if (empty($input['company_id']) || empty($input['waba_id'])) {
			return $this->response->output([
				'flag' => 'F',
				'msg' => 'Missing required fields',
			], 400);
		}

		$where = [
            'tenant_id' => $tenant[0]->customer_id,
			'company_id' => $input['company_id'],
			'waba_id'    => $input['waba_id']
		];

		$data = [
            'tenant_id' => $tenant[0]->customer_id,
			'company_id'    => $input['company_id'],
			'business_id'   => $input['business_id'] ?? null,
			'waba_id'       => $input['waba_id'],
			'business_name' => $input['business_name'] ?? null,
			'modified_date' => date('Y-m-d H:i:s')
		];
		$exists = $this->CommonModel->getMasterDetails('wa_business_accounts', '*', $where);
		if (!empty($exists)) {
			$res = $this->CommonModel->updateMasterDetails('wa_business_accounts', $data, $where);
            if(!$res){
                echo json_encode(['flag' => 'F','msg'  => "DB Error"]);
            }
			$msg = 'Business account updated successfully.';
		} else {
			$data['created_date'] = date('Y-m-d H:i:s');
			$res = $this->CommonModel->saveMasterDetails('wa_business_accounts', $data);
            if(!$res){
                echo json_encode(['flag' => 'F','msg'  => "DB Error"]);
            }
			$msg = 'Business account added successfully.';
		}
		echo json_encode(['flag' => 'S','msg'  => $msg]);
	}


	/**
	 * 2️⃣ Store WhatsApp Numbers linked to the Business Account
	 * POST params: company_id, subdomain, waba_id, numbers: []
	 * numbers[] = {
	 *   phone_number_id, display_phone_number, verified_name, quality_rating, is_default
	 * }
	 */
	public function storeBusinessNumbers()
	{
        
		$input = json_decode(file_get_contents('php://input'), true);
		if (empty($input)) $input = $this->input->post();
        if (empty($input['company_id']) || empty($input['waba_id']) || empty($input['numbers'])) {
			 echo json_encode(['flag' => 'F','msg' => 'Missing required fields or number list.']);
			 exit;
		}
		$subdomain = $this->detectSubdomain();
		$tenant = $this->CommonModel->getMasterDetails('customer', '*',array('sub_domain_name'=>$subdomain));
        if (!isset($tenant) || empty($tenant)) {
            return $this->response->output([
                    'flag' => 'F',
                    'msg' => "Unauthorized or unknown tenant: {$subdomain}",
                ], 400);
        }
		foreach ($input['numbers'] as $num) {
			if (empty($num['id'])) continue;

			$where = [
				'tenant_id'=>$tenant[0]->customer_id,
				'phone_number_id' => $num['id'],
				'waba_id' => $input['waba_id']
			];

			$data = [
				'company_id' => $input['company_id'],
                'tenant_id'=>$tenant[0]->customer_id,
				'waba_id'    => $input['waba_id'],
				'phone_number_id' => $num['id'],
				'display_phone_number' => $num['display_phone_number'] ?? null,
				'verified_name' => $num['verified_name'] ?? null,
				'quality_rating' => $num['quality_rating'] ?? null,
				'is_default' => $num['is_default'] ?? 'n',
				'status' => $num['status'] ?? 'active',
				'modified_date' => date('Y-m-d H:i:s')
			];

			$exists = $this->CommonModel->getMasterDetails('wa_phone_numbers', '*', $where);
			if (!empty($exists)) {
				$this->CommonModel->updateMasterDetails('wa_phone_numbers', $data, $where);
			} else {
				$data['created_date'] = date('Y-m-d H:i:s');
				$this->CommonModel->saveMasterDetails('wa_phone_numbers', $data);
			}
		}

		echo json_encode([
			'flag' => 'S',
			'msg'  => 'Business numbers stored/updated successfully.',
		]);
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
	//https://my.webtrix24.com/API/WAWebhook/receive
	/**
     * Webhook entry point
     * GET  → Verification
     * POST → Incoming messages
     */
    public function receive()
    {
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            return $this->verifyWebhook();
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            return $this->handleIncomingMessage();
        }

        show_404();
    }

    /**
     * Step 1: Webhook verification
     */
    private function verifyWebhook()
    {
        $mode      = $this->input->get('hub_mode');
        $token     = $this->input->get('hub_verify_token');
		//$token = $this->config->item("FB_VERIFY_TOKEN");
        $challenge = $this->input->get('hub_challenge');

        if ($mode === 'subscribe' && $token === $this->config->item("FB_VERIFY_TOKEN")) {
            echo $challenge;
            exit;
        }

        show_error('Webhook verification failed', 403);
    }

    /**
     * Step 2: Handle incoming WhatsApp messages
     */
	private function handleIncomingMessage()
{
    $rawPayload = file_get_contents('php://input');
    $payload    = json_decode($rawPayload, true);

    // Respond fast
    http_response_code(200);

    log_message('info', 'WA Webhook Payload: ' . $rawPayload);

    if (empty($payload['entry'][0]['changes'][0]['value']['messages'])) {
        return;
    }

    /* ===============================
     * STEP 1: Identify tenant
     * =============================== */
    $wabaId        = $payload['entry'][0]['id'];
    $phoneNumberId = $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'];

    $phoneRow = $this->CommonModel->getMasterDetails(
        'ab_wa_phone_numbers',
        '*',
        [
            'waba_id'          => $wabaId,
            'phone_number_id' => $phoneNumberId,
            'platform_type'   => 'meta',
            'status'          => 'active'
        ]
    );

    if (empty($phoneRow)) {
        log_message('error', "WA Webhook: Unknown phone_number_id {$phoneNumberId}");
        return;
    }

    $tenantId  = $phoneRow[0]->tenant_id;
    $companyId = $phoneRow[0]->company_id;

    /* ===============================
     * STEP 2: Resolve tenant subdomain
     * =============================== */
    $tenant = $this->CommonModel->getMasterDetails(
        'customer',
        '*',
        ['customer_id' => $tenantId]
    );

    if (empty($tenant)) {
        log_message('error', "WA Webhook: Tenant not found {$tenantId}");
        return;
    }

    $subdomain = $tenant[0]->sub_domain_name;
	

    /* ===============================
     * STEP 3: Forward to tenant API
     * =============================== */
	if($subdomain == "development"){
		$subdomain = $tenant[0]->website;
		$tenantApiUrl = "https://{$subdomain}/API/whatsapp/incoming";
	}else{
    	$tenantApiUrl = "https://{$subdomain}.webtrix24.com/API/whatsapp/incoming";
	}

    $headers = [
        'Content-Type: application/json',
        'X-WEBTRIX-SOURCE: wahub',
        'X-WEBTRIX-TENANT-ID: ' . $tenantId
    ];

    $ch = curl_init($tenantApiUrl);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_POSTFIELDS     => $rawPayload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
    ]);

    $response = curl_exec($ch);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        log_message('error', "WAHub → Tenant API error: {$error} {$tenant[0]->website}");
    }
}

    // private function handleIncomingMessage()
	// {
	// 	$rawPayload = file_get_contents('php://input');
	// 	$payload    = json_decode($rawPayload, true);

	// 	// Always respond 200 FAST (Meta requirement)
	// 	http_response_code(200);

	// 	log_message('info', 'WA Webhook Payload: ' . $rawPayload);

	// 	if (empty($payload['entry'][0]['changes'][0]['value'])) {
	// 		return;
	// 	}

	// 	$value = $payload['entry'][0]['changes'][0]['value'];

	// 	// Ignore delivery/read statuses
	// 	if (empty($value['messages'])) {
	// 		return;
	// 	}

	// 	/* ===============================
	// 	* STEP 1: Identify tenant
	// 	* =============================== */
	// 	$wabaId        = $payload['entry'][0]['id']; // WABA ID
	// 	$phoneNumberId = $value['metadata']['phone_number_id'];

	// 	$phoneRow = $this->CommonModel->getMasterDetails(
	// 		'wa_phone_numbers',
	// 		'*',
	// 		[
	// 			'waba_id'         => $wabaId,
	// 			'phone_number_id'=> $phoneNumberId,
	// 			'platform_type'  => 'meta',
	// 			'status'         => 'active'
	// 		]
	// 	);

	// 	if (empty($phoneRow)) {
	// 		log_message('error', "WA Webhook: Unknown phone_number_id {$phoneNumberId}");
	// 		return;
	// 	}

	// 	$tenantId  = $phoneRow[0]->tenant_id;
	// 	$companyId = $phoneRow[0]->company_id;

	// 	/* ===============================
	// 	* STEP 2: Load tenant DB
	// 	* =============================== */
	// 	$tenantDBData = $this->CommonModel->getMasterDetails(
	// 		'customer',
	// 		'*',
	// 		['customer_id' => $tenantId]
	// 	);

	// 	if (empty($tenantDBData)) {
	// 		log_message('error', "WA Webhook: Tenant DB not found for tenant_id {$tenantId}");
	// 		return;
	// 	}

	// 	$db_config = [
	// 		'hostname' => 'localhost',
	// 		'username' => $tenantDBData[0]->dbUserName,
	// 		'password' => $tenantDBData[0]->dbpassword,
	// 		'database' => $tenantDBData[0]->database_name,
	// 		'dbdriver' => 'mysqli',
	// 		'dbprefix' => 'ab_',
	// 		'pconnect' => false,
	// 		'db_debug' => false,
	// 		'char_set' => 'utf8mb4',
	// 		'dbcollat' => 'utf8mb4_general_ci'
	// 	];

	// 	$tenantDB = $this->load->database($db_config, true);

	// 	/* ===============================
	// 	* STEP 3: Extract message
	// 	* =============================== */
	// 	$message = $value['messages'][0];

	// 	$fromNumber  = $message['from'];
	// 	$messageId  = $message['id'];
	// 	$timestamp  = date('Y-m-d H:i:s', $message['timestamp']);
	// 	$type       = $message['type'];

	// 	$messageText   = null;
	// 	$buttonPayload = null;

	// 	switch ($type) {
	// 		case 'text':
	// 			$messageText = $message['text']['body'];
	// 			break;

	// 		case 'button':
	// 			$buttonPayload = $message['button']['payload'] ?? null;
	// 			$messageText   = $message['button']['text'] ?? null;
	// 			break;

	// 		case 'interactive':
	// 			if (!empty($message['interactive']['button_reply'])) {
	// 				$buttonPayload = $message['interactive']['button_reply']['id'];
	// 				$messageText   = $message['interactive']['button_reply']['title'];
	// 			} elseif (!empty($message['interactive']['list_reply'])) {
	// 				$buttonPayload = $message['interactive']['list_reply']['id'];
	// 				$messageText   = $message['interactive']['list_reply']['title'];
	// 			}
	// 			break;

	// 		default:
	// 			log_message('info', 'WA Unsupported message type: ' . $type);
	// 			return;
	// 	}

	// 	/* ===============================
	// 	* STEP 4: Prevent duplicates
	// 	* =============================== */
	// 	$exists = $tenantDB
	// 		->where('message_id', $messageId)
	// 		->get('wa_messages')
	// 		->row();

	// 	if ($exists) {
	// 		return;
	// 	}

	// 	/* ===============================
	// 	* STEP 5: Insert message
	// 	* =============================== */
	// 	$tenantDB->insert('wa_messages', [
	// 		'tenant_id'       => $tenantId,
	// 		'company_id'      => $companyId,
	// 		'platform_type'   => 'meta',
	// 		'waba_id'         => $wabaId,
	// 		'phone_number_id'=> $phoneNumberId,
	// 		'direction'       => 'in',
	// 		'message_id'      => $messageId,
	// 		'from_number'     => $fromNumber,
	// 		'to_number'       => $value['metadata']['display_phone_number'],
	// 		'message_type'    => $type,
	// 		'message_text'    => $messageText,
	// 		'interactive_payload' => $buttonPayload,
	// 		'status'          => 'received',
	// 		'sent_at'         => $timestamp,
	// 		'raw_request'     => $rawPayload,
	// 		'created_date'    => date('Y-m-d H:i:s')
	// 	]);

	// 	/* ===============================
	// 	* NEXT STEPS (optional triggers)
	// 	* =============================== */
	// 	// - Auto reply
	// 	// - Lead / customer mapping
	// 	// - GPT/Dialogflow
	// 	// - Agent assignment
	// }

}
