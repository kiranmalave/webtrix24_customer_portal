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
				'platform_type' => 'meta',
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
        'history'                        => ['resolve_by' => 'phone_number_id'],
        'smb_app_state_sync'            => ['resolve_by' => 'phone_number_id'],
        'smb_message_echoes'            => ['resolve_by' => 'phone_number_id'],
        'account_update'                => ['resolve_by' => 'waba_id'],
        // 'phone_number_quality_update' => ['resolve_by' => 'waba_id'],
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

        $phoneNumberId = $value['metadata']['phone_number_id'] ?? null;
        $displayPhone  = $value['metadata']['display_phone_number'] ?? null;

        $baseWhere = ['waba_id' => $wabaId];
        if ($resolveBy === 'phone_number_id') {
            if (!empty($phoneNumberId)) {
                $baseWhere['phone_number_id'] = $phoneNumberId;
            } elseif (empty($displayPhone)) {
                return null;
            }
        }

        $tablesToCheck = ['ab_wa_phone_numbers', 'wa_phone_numbers'];
        $candidateWhereList = [
            array_merge($baseWhere, ['platform_type' => 'meta', 'status' => 'active']),
            array_merge($baseWhere, ['status' => 'active']),
            array_merge($baseWhere, ['platform_type' => 'meta']),
            $baseWhere,
        ];

        $phoneRow = [];
        foreach ($tablesToCheck as $table) {
            foreach ($candidateWhereList as $where) {
                $phoneRow = $this->CommonModel->getMasterDetails($table, '*', $where);
                if (!empty($phoneRow)) {
                    log_message('info', "WA Webhook: tenant resolved from {$table} for wabaId={$wabaId}");
                    break 2;
                }
            }
        }

        if (empty($phoneRow) && $resolveBy === 'phone_number_id') {
            foreach ($tablesToCheck as $table) {
                $phoneRow = $this->CommonModel->getMasterDetails($table, '*', ['waba_id' => $wabaId]);
                if (!empty($phoneRow)) {
                    log_message('warning', "WA Webhook: fallback WABA-only resolution used for wabaId={$wabaId}, phoneNumberId={$phoneNumberId}, displayPhone={$displayPhone}");
                    break;
                }
            }
        }

        if (empty($phoneRow)) {
            log_message('error', "WA Webhook: No tenant mapping found for wabaId={$wabaId}, phoneNumberId={$phoneNumberId}, displayPhone={$displayPhone}");
            return null;
        }

        $tenantId = $phoneRow[0]->tenant_id ?? null;
        if (empty($tenantId)) return null;

        $tenant = $this->CommonModel->getMasterDetails('customer', '*', ['customer_id' => $tenantId]);
        if (empty($tenant)) return null;

        return [
            'tenant_id'  => $tenantId,
            'company_id' => $phoneRow[0]->company_id ?? null,
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
            'X-WEBTRIX-COMPANY-ID: ' . ($tenantInfo['company_id'] ?? ''),
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

    /**
     * TEMPORARY DEBUG — visit https://my.webtrix24.com/API/fb-debug to see the exact redirect_uri
     * Remove this method once the Facebook App is configured correctly.
     */
    public function fbDebug()
    {
        $redirectUri = $this->config->item('FB_REDIRECT_URI') ?: 'https://my.webtrix24.com/API/fb-callback';

        echo '<pre>';
        echo 'redirect_uri that will be sent to Facebook:' . "\n";
        echo $redirectUri . "\n\n";
        echo 'Add the above URL to:' . "\n";
        echo '  Facebook App > Facebook Login > Settings > Valid OAuth Redirect URIs' . "\n\n";
        echo 'Add this domain to:' . "\n";
        echo '  Facebook App > Settings > Basic > App Domains' . "\n";
        echo parse_url($redirectUri, PHP_URL_HOST) . "\n";
        echo '</pre>';
    }

    /**
     * Step 1 — Open the central popup page for Meta Embedded Signup.
     *
     * URL: GET https://my.webtrix24.com/API/fb-connect
     *        ?return_origin=https://tenant.webtrix24.com
     *        &company_id=42
     *
     * The popup remains on the central domain and runs the latest Meta
     * Embedded Signup flow through the JS SDK.
     */
    public function fbConnect()
    {
        $returnOrigin = trim((string) $this->input->get('return_origin'));
        $companyId    = (int) $this->input->get('company_id');

        $appId    = $this->config->item('FB_APP_ID') ?: getenv('FB_APP_ID');
        $configId = $this->config->item('FB_EMBEDDED_SIGNUP_CONFIG_ID') ?: getenv('FB_EMBEDDED_SIGNUP_CONFIG_ID');

        if (empty($returnOrigin) || empty($companyId)) {
            show_error('Missing return origin or company ID.', 400);
            return;
        }

        if (empty($appId)) {
            log_message('error', 'fbConnect: FB_APP_ID is not configured.');
            show_error('Facebook App ID is not configured on this server.', 500);
            return;
        }

        if (empty($configId)) {
            log_message('error', 'fbConnect: FB_EMBEDDED_SIGNUP_CONFIG_ID is not configured.');
            show_error('WhatsApp Embedded Signup is not configured on this server.', 500);
            return;
        }

        $this->load->view('meta/fb_connect', [
            'return_origin' => htmlspecialchars($returnOrigin, ENT_QUOTES, 'UTF-8'),
            'company_id'    => $companyId,
            'app_id'        => htmlspecialchars($appId, ENT_QUOTES, 'UTF-8'),
            'config_id'     => htmlspecialchars((string) $configId, ENT_QUOTES, 'UTF-8'),
            'process_url'   => site_url('fb-process'),
        ]);
    }

    /**
     * Step 2 — Receive the code/token from the Embedded Signup popup,
     * exchange it server-side if needed, then authorize the tenant.
     */
    public function fbProcess()
    {
        header('Content-Type: application/json');

        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $redirectBase  = $this->config->item('FB_REDIRECT_URI') ?: getenv('FB_REDIRECT_URI') ?: site_url();
        $allowedHost   = parse_url($redirectBase, PHP_URL_HOST);
        $originHost    = !empty($requestOrigin) ? parse_url($requestOrigin, PHP_URL_HOST) : '';

        if (!empty($requestOrigin) && !empty($allowedHost) && strcasecmp((string) $originHost, (string) $allowedHost) !== 0) {
            http_response_code(403);
            echo json_encode(['flag' => 'F', 'msg' => 'Forbidden.']);
            return;
        }

        $input        = json_decode(file_get_contents('php://input'), true);
        $accessToken  = $input['access_token'] ?? null;
        $authCode     = $input['code'] ?? null;
        $returnOrigin = $input['return_origin'] ?? null;
        $companyId    = (int) ($input['company_id'] ?? 0);
        $signupEvent  = isset($input['signup_event']) && is_array($input['signup_event']) ? $input['signup_event'] : [];

        if ((empty($accessToken) && empty($authCode)) || empty($returnOrigin) || empty($companyId)) {
            echo json_encode(['flag' => 'F', 'msg' => 'Missing required fields.']);
            return;
        }

        $parsedOrigin = parse_url($returnOrigin);
        $originScheme = strtolower((string) ($parsedOrigin['scheme'] ?? ''));
        $originHost   = strtolower((string) ($parsedOrigin['host'] ?? ''));
        $isLocalDev   = in_array($originHost, ['localhost', '127.0.0.1'], true);

        if (empty($originHost) || !in_array($originScheme, ['https', 'http'], true) || ($originScheme !== 'https' && !$isLocalDev)) {
            echo json_encode(['flag' => 'F', 'msg' => 'Invalid return origin.']);
            return;
        }

        if (empty($accessToken) && !empty($authCode)) {
            $appId     = $this->config->item('FB_APP_ID') ?: getenv('FB_APP_ID');
            $appSecret = $this->config->item('FB_APP_SECRET') ?: getenv('FB_APP_SECRET');

            if (empty($appId) || empty($appSecret)) {
                echo json_encode(['flag' => 'F', 'msg' => 'Facebook App is not configured on this server.']);
                return;
            }

            $tokenUrl = 'https://graph.facebook.com/v21.0/oauth/access_token?' . http_build_query([
                'client_id'     => $appId,
                'client_secret' => $appSecret,
                'code'          => $authCode,
            ]);

            $ch = curl_init($tokenUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 20,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            $tokenResponse = curl_exec($ch);
            $curlError     = curl_error($ch);
            curl_close($ch);

            if ($curlError || empty($tokenResponse)) {
                log_message('error', 'fbProcess: code exchange cURL error: ' . $curlError);
                echo json_encode(['flag' => 'F', 'msg' => 'Failed to exchange Facebook code.']);
                return;
            }

            $tokenData   = json_decode($tokenResponse, true);
            $accessToken = $tokenData['access_token'] ?? null;

            if (empty($accessToken)) {
                $fbErrMsg = $tokenData['error']['message'] ?? 'No access token in Facebook response.';
                log_message('error', 'fbProcess: code exchange failed — ' . $fbErrMsg);
                echo json_encode(['flag' => 'F', 'msg' => $fbErrMsg]);
                return;
            }
        }

        $host      = parse_url($returnOrigin, PHP_URL_HOST);
        $parts     = explode('.', $host);
        $subdomain = count($parts) >= 3 ? $parts[0] : $host;
        $tenantApiUrl = rtrim($returnOrigin, '/') . '/API/whatsapp/authorize';
        $payload = json_encode([
            'company_id'       => $companyId,
            'access_token'     => $accessToken,
            'integration_type' => 'whatsapp',
            'embedded_signup'  => !empty($authCode) ? 'y' : 'n',
            'waba_id'          => $signupEvent['waba_id'] ?? null,
            'business_id'      => $signupEvent['business_id'] ?? null,
            'phone_number_id'  => $signupEvent['phone_number_id'] ?? null,
        ]);

        $ch = curl_init($tenantApiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Accept: application/json',
                'X-WEBTRIX-SOURCE: wahub-oauth',
                'X-WEBTRIX-SUBDOMAIN: ' . $subdomain,
            ],
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $apiResponse = curl_exec($ch);
        $curlError   = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            log_message('error', 'fbProcess: tenant API cURL error: ' . $curlError);
            echo json_encode(['flag' => 'F', 'msg' => 'Could not reach your account server. Please try again.']);
            return;
        }

        $apiData = json_decode($apiResponse, true);
        if (($apiData['flag'] ?? '') !== 'S') {
            $errMsg = $apiData['msg'] ?? 'Account server returned an error.';
            log_message('error', 'fbProcess: tenant API flag != S — ' . $errMsg);
            echo json_encode(['flag' => 'F', 'msg' => $errMsg]);
            return;
        }

        log_message('info', "fbProcess: embedded signup success for subdomain={$subdomain} company={$companyId}");
        echo json_encode(['flag' => 'S', 'msg' => 'Embedded signup completed successfully.']);
    }

    /**
     * Step 2 — Facebook OAuth callback.
     *
     * URL: GET https://my.webtrix24.com/API/fb-callback?code=...&state=...
     *
     * 1. Verifies the CSRF nonce from session.
     * 2. Exchanges the authorization code for an access token via server-side cURL
     *    (token is NEVER sent to the browser).
     * 3. Calls the tenant's /API/whatsapp/authorize endpoint server-to-server.
     * 4. Renders a minimal HTML page that sends postMessage('wa_fb_success') to the
     *    opener and closes the popup.
     */
    public function fbCallback()
    {
        $this->load->library('session');
        log_message('info', 'fbCallback: callback endpoint reached.');
        $code  = $this->input->get('code');
        $state = $this->input->get('state');
        $fbErr = $this->input->get('error_description') ?? $this->input->get('error');

        $stored = $this->session->userdata('fb_oauth_state');
        $this->session->unset_userdata('fb_oauth_state'); // one-time use

        $returnOrigin = isset($stored['return_origin'])
            ? htmlspecialchars($stored['return_origin'], ENT_QUOTES, 'UTF-8')
            : null;

        // --- Error from Facebook (user denied, etc.) ---
        if (!empty($fbErr)) {
            $this->load->view('meta/fb_callback', [
                'return_origin' => $returnOrigin,
                'error'         => htmlspecialchars($fbErr, ENT_QUOTES, 'UTF-8'),
            ]);
            return;
        }

        // --- Missing session or code ---
        if (empty($stored) || empty($code)) {
            $this->load->view('meta/fb_callback', [
                'return_origin' => $returnOrigin,
                'error'         => 'OAuth session expired or missing. Please try again.',
            ]);
            return;
        }

        // --- CSRF nonce check ---
        if ($state !== $stored['nonce']) {
            log_message('error', 'fbCallback: CSRF nonce mismatch.');
            $this->load->view('meta/fb_callback', [
                'return_origin' => $returnOrigin,
                'error'         => 'Security check failed (invalid state). Please try again.',
            ]);
            return;
        }

        $appId       = $this->config->item('FB_APP_ID') ?: getenv('FB_APP_ID');
        $appSecret   = $this->config->item('FB_APP_SECRET') ?: getenv('FB_APP_SECRET');
        $redirectUri = $this->config->item('FB_REDIRECT_URI') ?: getenv('FB_REDIRECT_URI') ?: 'https://my.webtrix24.com/API/fb-callback';
        
        // --- Exchange code → access token (server-side, never in browser) ---
        $tokenUrl = 'https://graph.facebook.com/v17.0/oauth/access_token?' . http_build_query([
            'client_id'     => $appId,
            'client_secret' => $appSecret,
            'redirect_uri'  => $redirectUri,
            'code'          => $code,
        ]);

        $ch = curl_init($tokenUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $tokenResponse = curl_exec($ch);
        $curlError     = curl_error($ch);
        curl_close($ch);

        if ($curlError || empty($tokenResponse)) {
            log_message('error', 'fbCallback: token exchange cURL error: ' . $curlError);
            $this->load->view('meta/fb_callback', [
                'return_origin' => $returnOrigin,
                'error'         => 'Failed to contact Facebook. Please try again.',
            ]);
            return;
        }

        $tokenData   = json_decode($tokenResponse, true);
        $accessToken = $tokenData['access_token'] ?? null;

        if (empty($accessToken)) {
            $fbErrMsg = $tokenData['error']['message'] ?? 'No access token in Facebook response.';
            log_message('error', 'fbCallback: no access_token — ' . $fbErrMsg);
            $this->load->view('meta/fb_callback', [
                'return_origin' => $returnOrigin,
                'error'         => htmlspecialchars($fbErrMsg, ENT_QUOTES, 'UTF-8'),
            ]);
            return;
        }

        log_message('info', 'fbCallback: access token received successfully from Facebook OAuth.');

        // --- Call the tenant's API server-to-server ---
        $tenantOrigin = $stored['return_origin'];
        $companyId    = $stored['company_id'];

        // Derive X-WEBTRIX-SUBDOMAIN header from the origin hostname
        $host      = parse_url($tenantOrigin, PHP_URL_HOST);
        $parts     = explode('.', $host);
        $subdomain = count($parts) >= 3 ? $parts[0] : $host;

        $tenantApiUrl = rtrim($tenantOrigin, '/') . '/API/whatsapp/authorize';
        //$tenantApiUrl ='https://cms.coachgenie.in/API/whatsapp/authorize';
        log_message('info', 'fbCallback: API called: ' . $tenantApiUrl);
        $payload = json_encode([
            'company_id'       => $companyId,
            'access_token'     => $accessToken,
            'integration_type' => 'whatsapp',
        ]);

        $ch = curl_init($tenantApiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Accept: application/json',
                'X-WEBTRIX-SOURCE: wahub-oauth',
                'X-WEBTRIX-SUBDOMAIN: ' . $subdomain,
            ],
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $apiResponse = curl_exec($ch);
        $apiError    = curl_error($ch);
        curl_close($ch);
        //print $tenantApiUrl; exit;
        log_message('error', 'fbCallback: response: ' . $apiResponse);
        if ($apiError) {
            log_message('error', 'fbCallback: tenant API cURL error: ' . $apiError);
            $this->load->view('meta/fb_callback', [
                'return_origin' => $returnOrigin,
                'error'         => 'Could not reach your account server. Please try again.',
            ]);
            return;
        }

        $apiData = json_decode($apiResponse, true);
        if (($apiData['flag'] ?? '') !== 'S') {
            $errMsg = $apiData['msg'] ?? 'Account server returned an error.';
            log_message('error', 'fbCallback: tenant API flag != S — ' . $errMsg);
            $this->load->view('meta/fb_callback', [
                'return_origin' => $returnOrigin,
                'error'         => htmlspecialchars($errMsg, ENT_QUOTES, 'UTF-8'),
            ]);
            return;
        }

        // --- All done — notify the opener and close ---
        log_message('info', "fbCallback: success for subdomain={$subdomain} company={$companyId}");
        $this->load->view('meta/fb_callback', [
            'return_origin' => $returnOrigin,
            'error'         => null,
        ]);
    }
}
