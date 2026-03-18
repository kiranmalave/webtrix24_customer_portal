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
        log_message('info', 'WA Webhook Payload webhook called. ');
        $rawPayload = file_get_contents('php://input');
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
     * Webhook field → handler config map.
     *
     * Each registered field needs:
     *   resolve_by : 'phone_number_id' — tenant identified via waba_id + phone_number_id (message-level events)
     *                'waba_id'         — tenant identified via waba_id only (account-level events)
     *
     * All events are forwarded to the SINGLE tenant endpoint /API/whatsapp/incoming.
     * The tenant-side controller dispatches to the correct internal method based on the 'field' value.
     *
     * ✅ To support a new Meta webhook subscription, just add one line here.
     */
    private $webhookFieldHandlers = [
        'messages'                       => ['resolve_by' => 'phone_number_id'],
        'message_template_status_update' => ['resolve_by' => 'waba_id'],
        // 'phone_number_quality_update' => ['resolve_by' => 'waba_id'],
        // 'account_update'              => ['resolve_by' => 'waba_id'],
    ];

    /** Single tenant-side endpoint that handles all webhook field types */
    private $tenantWebhookEndpoint = '/API/whatsapp/incoming';

    /**
     * Step 2: Dispatch all incoming webhook changes to the correct tenant endpoint.
     * Iterates every entry → change so no event is silently dropped.
     */
    private function handleIncomingMessage()
    {
        $rawPayload = file_get_contents('php://input');
        $payload    = json_decode($rawPayload, true);

        http_response_code(200);
        log_message('info', 'WA Webhook Payload received: ' . $rawPayload);

        if (empty($payload['entry']) || !is_array($payload['entry'])) {
            log_message('error', 'WA Webhook: Invalid or empty payload structure: ' . $rawPayload);
            return;
        }

        foreach ($payload['entry'] as $entry) {
            $wabaId  = $entry['id'] ?? null;
            $changes = $entry['changes'] ?? [];

            foreach ($changes as $change) {
                $field = $change['field'] ?? null;
                $value = $change['value'] ?? [];

                if (empty($field)) {
                    log_message('warning', 'WA Webhook: Skipping change with no field');
                    continue;
                }

                // Unknown / not-yet-handled field — log and skip
                if (!isset($this->webhookFieldHandlers[$field])) {
                    log_message('warning', "WA Webhook: Unregistered field [{$field}] — add it to webhookFieldHandlers to handle it.");
                    continue;
                }

                $handler = $this->webhookFieldHandlers[$field];

                // Resolve which tenant owns this event
                $tenantInfo = $this->resolveTenant($wabaId, $value, $handler['resolve_by']);
                if (empty($tenantInfo)) {
                    log_message('error', "WA Webhook [{$field}]: Could not resolve tenant for wabaId={$wabaId}");
                    continue;
                }

                // Wrap the single change back into the standard Meta envelope
                $forwardPayload = json_encode([
                    'object' => $payload['object'] ?? 'whatsapp_business_account',
                    'entry'  => [[
                        'id'      => $wabaId,
                        'changes' => [$change]
                    ]]
                ]);

                $this->forwardToTenant($tenantInfo, $this->tenantWebhookEndpoint, $forwardPayload, $field);
            }
        }
    }

    /**
     * Resolve tenant info from the webhook change value.
     *
     * @param  string $wabaId
     * @param  array  $value      change['value']
     * @param  string $resolveBy  'phone_number_id' | 'waba_id'
     * @return array|null
     */
    private function resolveTenant($wabaId, $value, $resolveBy)
    {
        if (empty($wabaId)) return null;

        $where = ['waba_id' => $wabaId, 'platform_type' => 'meta', 'status' => 'active'];

        if ($resolveBy === 'phone_number_id') {
            $phoneNumberId = $value['metadata']['phone_number_id'] ?? null;
            if (empty($phoneNumberId)) return null;
            $where['phone_number_id'] = $phoneNumberId;
        }

        $phoneRow = $this->CommonModel->getMasterDetails('ab_wa_phone_numbers', '*', $where);
        if (empty($phoneRow)) return null;

        $tenantId = $phoneRow[0]->tenant_id;

        $tenant = $this->CommonModel->getMasterDetails('customer', '*', ['customer_id' => $tenantId]);
        if (empty($tenant)) return null;

        return [
            'tenant_id'  => $tenantId,
            'company_id' => $phoneRow[0]->company_id,
            'subdomain'  => $tenant[0]->sub_domain_name,
            'website'    => $tenant[0]->website,
        ];
    }

    /**
     * Forward a JSON payload to the tenant's API.
     *
     * @param  array  $tenantInfo   result of resolveTenant()
     * @param  string $endpointPath e.g. '/API/whatsapp/incoming'
     * @param  string $jsonPayload  JSON-encoded body to POST
     * @param  string $field        webhook field name (for logging only)
     */
    private function forwardToTenant($tenantInfo, $endpointPath, $jsonPayload, $field = '')
    {
        $base = ($tenantInfo['subdomain'] === 'development' || $tenantInfo['subdomain'] === 'cms')
            ? "https://{$tenantInfo['website']}"
            : "https://{$tenantInfo['subdomain']}.webtrix24.com";

        $url = $base . $endpointPath;

        log_message('info', "WAHub [{$field}] → Forwarding to: {$url}");

        $headers = [
            'Content-Type: application/json',
            'X-WEBTRIX-SOURCE: wahub',
            'X-WEBTRIX-TENANT-ID: ' . $tenantInfo['tenant_id'],
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_POSTFIELDS     => $jsonPayload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
        ]);

        $response = curl_exec($ch);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($error) {
            log_message('error', "WAHub [{$field}] → Tenant API error: {$error}");
        } else {
            log_message('info', "WAHub [{$field}] → Tenant API response: {$response}");
        }
    }
}
