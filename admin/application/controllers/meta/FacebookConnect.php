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
			'tenant_id'                     => $tenant[0]->customer_id,
			'company_id'                    => $input['company_id'],
			'business_id'                   => $input['business_id'] ?? null,
			'page_id'                       => $input['page_id'],
			'page_name'                     => $input['page_name'] ?? null,
			'page_access_token'             => $input['page_token'],
			'instagram_business_account_id' => $input['instagram_business_account_id'] ?? null,
			'modified_date'                 => date('Y-m-d H:i:s')
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
	public function fbWebhook()
	{
		log_message("error", "FB Webhook: Called");
		$this->_webhookDebugLog('fbWebhook: CALLED', [
			'method'      => $_SERVER['REQUEST_METHOD'] ?? null,
			'query'       => $_SERVER['QUERY_STRING'] ?? null,
			'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? null,
		]);
		$FB_VERIFY_TOKEN = $this->config->item("FB_VERIFY_TOKEN");

		// -----------------------------------------------------------
		// 1. VERIFY WEBHOOK CHALLENGE
		// -----------------------------------------------------------
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {

			$this->_webhookDebugLog('fbWebhook: GET verification handshake', [
				'hub_verify_token' => $this->input->get('hub_verify_token'),
				'hub_challenge'    => $this->input->get('hub_challenge'),
				'match'            => $this->input->get('hub_verify_token') === $FB_VERIFY_TOKEN,
			]);

			if ($this->input->get('hub_verify_token') === $FB_VERIFY_TOKEN) {
				echo $this->input->get('hub_challenge');
				exit;
			}

			echo "Invalid token";
			exit;
		}

		// -----------------------------------------------------------
		// 2. READ RAW PAYLOAD & VERIFY SIGNATURE
		// -----------------------------------------------------------
		$raw = file_get_contents("php://input");

		$this->_webhookDebugLog('fbWebhook: POST raw payload', ['raw' => $raw]);

		$this->load->library('Meta_signature');
		$sigHeader = $this->input->get_request_header('X-Hub-Signature-256', true);
		$sigValid  = $this->meta_signature->verifyRequest($raw, 'FB_APP_SECRET');

		$this->_webhookDebugLog('fbWebhook: signature check', [
			'header_present' => !empty($sigHeader),
			'valid'          => $sigValid,
		]);

		if (!$sigValid) {
			log_message("error", "FB Webhook: signature verification failed — rejecting.");
			http_response_code(403);
			echo "Invalid signature";
			exit;
		}

		$payload = json_decode($raw, true);

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
		// CASE C: INSTAGRAM OBJECT — separate webhook object type from Page. entry[].id is the
		// Instagram Business Account ID, not a Page ID.
		// -----------------------------------------------------------
		if (($payload['object'] ?? null) === 'instagram') {
			$this->_handleInstagramWebhook($payload, $raw);
			echo "OK";
			exit;
		}

		// -----------------------------------------------------------
		// CASE B: PAGE OBJECT — leadgen (Instant Forms) + Messenger Platform events (entry[])
		//
		// NOTE on shape: leadgen (and other Graph API "subscription field" style events) arrive
		// via entry[].changes[] ({field, value}). Messenger Platform events — messages,
		// messaging_referrals, messaging_optins, messaging_postbacks — are a DIFFERENT delivery
		// mechanism and arrive via entry[].messaging[] instead, where each item directly contains
		// sender/recipient/timestamp plus one of message/referral/postback/optin. Both arrays can
		// be present on the same entry; check both rather than assuming one or the other.
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

				foreach (($entry['changes'] ?? []) as $change)
				{
					$field = $change['field'] ?? null;

					if ($field === 'leadgen') {
						$leadgenId = $change['value']['leadgen_id'] ?? null;

						if (!$leadgenId) {
							log_message("error", "FB Webhook: Missing leadgen_id for page $pageId");
							continue;
						}

						log_message("error", "FB Webhook Lead Received: page=$pageId lead=$leadgenId");
						$this->_queueLeadForTenant($pageId, $leadgenId);
						continue;
					}

					log_message('info', "FB Webhook: unhandled changes field [{$field}] — ignored.");
				}

				foreach (($entry['messaging'] ?? []) as $messagingEvent)
				{
					log_message("info", "FB Webhook Messenger event: page=$pageId");
					$this->_queueMessengerEventForTenant($pageId, $messagingEvent);
				}

				if (empty($entry['changes']) && empty($entry['messaging'])) {
					log_message("error", "FB Webhook: No changes[]/messaging[] found for page: $pageId");
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
    $this->_webhookDebugLog('_queueLeadForTenant: called', ['page_id' => $pageId, 'leadgen_id' => $leadgenId]);

    // 1. Find tenant by page_id — populated by the tenant's
    //    Connections::subscribe() -> _pushPageToHub() when a Page is activated.
    $tenant = $this->CommonModel->getMasterDetails("fb_pages", "*", ['page_id' => $pageId]);

    if (empty($tenant)) {
        log_message("error", "FB Webhook: Tenant not found for page_id $pageId");
        $this->_webhookDebugLog('_queueLeadForTenant: REJECTED no fb_pages row for page_id', ['page_id' => $pageId]);
        return false;
    }

    $tenantInfo = $tenant[0];
    $tenantId   = $tenantInfo->tenant_id;
    $companyId  = $tenantInfo->company_id ?? null;
    // Real column is `page_access_token` (ab_fb_pages) — NOT `page_token`. The migration draft
    // in webtrix_24_BE/sqls/facebook+pages.sql uses `page_token`, but that file was never applied
    // as-is; this is the actual live schema. storeFacebookPage() below writes the same column.
    $pageToken  = $tenantInfo->page_access_token ?? null;

    $this->_webhookDebugLog('_queueLeadForTenant: fb_pages row found', [
        'tenant_id'      => $tenantId,
        'company_id'     => $companyId,
        'has_page_token' => !empty($pageToken),
    ]);

    // 2. Get tenant subdomain/website from the central customer table
    $tenantRow = $this->CommonModel->getMasterDetails("customer", "*", ['customer_id' => $tenantId]);

    if (empty($tenantRow)) {
        log_message("error", "FB Webhook: Tenant record not found for tenant_id $tenantId");
        $this->_webhookDebugLog('_queueLeadForTenant: REJECTED no customer row for tenant_id', ['tenant_id' => $tenantId]);
        return false;
    }

    $subdomain = $tenantRow[0]->sub_domain_name ?? null;
    $website   = $tenantRow[0]->website ?? null;

    if (empty($subdomain) && empty($website)) {
        log_message("error", "FB Webhook: No subdomain/website on file for tenant_id $tenantId");
        $this->_webhookDebugLog('_queueLeadForTenant: REJECTED no subdomain/website', ['tenant_id' => $tenantId]);
        return false;
    }

    $this->_webhookDebugLog('_queueLeadForTenant: forwarding', ['subdomain' => $subdomain, 'website' => $website]);

    $this->_forwardLeadgenToTenant($subdomain, $website, $tenantId, $companyId, $pageId, $leadgenId, $pageToken);

    return true;
}

/**
 * Forward a leadgen pointer to the tenant's internal ingest endpoint over HTTP —
 * mirrors WAHub::forwardToTenant() instead of opening a second live DB connection.
 * The tenant persists the raw event and enqueues it; no Graph API call happens here.
 */
private function _forwardLeadgenToTenant($subdomain, $website, $tenantId, $companyId, $pageId, $leadgenId, $pageToken)
{
    $base = (empty($subdomain) || $subdomain === 'development' || $subdomain === 'cms')
        ? "https://{$website}"
        : "https://{$subdomain}.webtrix24.com";

    $url = $base . '/API/facebook/leadgen/incoming';

    $payload = json_encode([
        'page_id'     => $pageId,
        'leadgen_id'  => $leadgenId,
        'page_token'  => $pageToken,
        'received_at' => date('Y-m-d H:i:s'),
    ]);

    $secret = (string) ($this->config->item('META_TENANT_FORWARD_SECRET') ?: '');

    $headers = [
        'Content-Type: application/json',
        'X-WEBTRIX-SOURCE: fbhub',
        'X-WEBTRIX-TENANT-ID: ' . $tenantId,
        'X-WEBTRIX-COMPANY-ID: ' . ($companyId ?? ''),
        'X-WEBTRIX-META-SECRET: ' . $secret,
    ];

    $this->_webhookDebugLog('_forwardLeadgenToTenant: sending', [
        'url'                => $url,
        'secret_configured'  => !empty($secret),
        'payload'            => $payload,
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);

    $response = curl_exec($ch);
    $error    = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $this->_webhookDebugLog('_forwardLeadgenToTenant: response', [
        'http_code'    => $httpCode,
        'curl_error'   => $error,
        'raw_response' => $response,
    ]);

    if ($error) {
        log_message('error', "FB Webhook -> Tenant forward error for lead={$leadgenId}: {$error}");
    } else {
        log_message('info', "FB Webhook -> Tenant forward response for lead={$leadgenId}: {$response}");
    }
}

/**
 * Resolve tenant for a Page-object Messenger event (messaging_referrals/optins/postbacks) and
 * forward it to the tenant's Messenger ingest endpoint. Mirrors _queueLeadForTenant's tenant
 * resolution against ab_fb_pages, just forwarding a different field/value shape.
 */
private function _queueMessengerEventForTenant($pageId, array $messagingEvent)
{
    $this->_webhookDebugLog('_queueMessengerEventForTenant: called', ['page_id' => $pageId, 'event' => $messagingEvent]);

    $tenant = $this->CommonModel->getMasterDetails("fb_pages", "*", ['page_id' => $pageId]);
    if (empty($tenant)) {
        log_message("error", "FB Webhook: Tenant not found for page_id $pageId (messenger)");
        $this->_webhookDebugLog('_queueMessengerEventForTenant: REJECTED no fb_pages row', ['page_id' => $pageId]);
        return false;
    }

    $tenantInfo = $tenant[0];
    $tenantId   = $tenantInfo->tenant_id;
    $companyId  = $tenantInfo->company_id ?? null;
    $pageToken  = $tenantInfo->page_access_token ?? null;

    $tenantRow = $this->CommonModel->getMasterDetails("customer", "*", ['customer_id' => $tenantId]);
    if (empty($tenantRow)) {
        log_message("error", "FB Webhook: Tenant record not found for tenant_id $tenantId");
        return false;
    }

    $subdomain = $tenantRow[0]->sub_domain_name ?? null;
    $website   = $tenantRow[0]->website ?? null;

    if (empty($subdomain) && empty($website)) {
        log_message("error", "FB Webhook: No subdomain/website on file for tenant_id $tenantId");
        return false;
    }

    $base = (empty($subdomain) || $subdomain === 'development' || $subdomain === 'cms')
        ? "https://{$website}"
        : "https://{$subdomain}.webtrix24.com";

    $url = $base . '/API/facebook/messenger/incoming';

    $payload = json_encode([
        'page_id'         => $pageId,
        'messaging_event' => $messagingEvent,
        'page_token'      => $pageToken,
        'received_at'     => date('Y-m-d H:i:s'),
    ]);

    $secret = (string) ($this->config->item('META_TENANT_FORWARD_SECRET') ?: '');

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-WEBTRIX-SOURCE: fbhub',
            'X-WEBTRIX-TENANT-ID: ' . $tenantId,
            'X-WEBTRIX-COMPANY-ID: ' . ($companyId ?? ''),
            'X-WEBTRIX-META-SECRET: ' . $secret,
        ],
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);

    $response = curl_exec($ch);
    $error    = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $this->_webhookDebugLog('_queueMessengerEventForTenant: forward response', [
        'http_code'    => $httpCode,
        'curl_error'   => $error,
        'raw_response' => $response,
    ]);

    return true;
}

/**
 * Dispatch every Instagram-object entry to tenant resolution. NOTE: this hasn't been verified
 * against a live Instagram messaging webhook payload — Meta's docs/behavior for this have
 * shifted across API versions, and the events may arrive as entry[].messaging[]
 * (Messenger-Platform-style) or entry[].changes[] depending on subscription mode. Handling both
 * defensively; check meta_webhook_debug.log on first real delivery to confirm the actual shape.
 */
private function _handleInstagramWebhook(array $payload, string $raw)
{
    foreach (($payload['entry'] ?? []) as $entry) {
        $igId = $entry['id'] ?? null;

        if (!$igId) {
            log_message('error', "FB Webhook (instagram): missing entry id: $raw");
            continue;
        }

        $events = $entry['messaging'] ?? $entry['changes'] ?? [];

        if (empty($events)) {
            log_message('warning', "FB Webhook (instagram): no messaging/changes[] found for ig_id={$igId}: $raw");
            $this->_webhookDebugLog('_handleInstagramWebhook: unrecognized entry shape', ['ig_id' => $igId, 'entry' => $entry]);
            continue;
        }

        foreach ($events as $event) {
            $this->_webhookDebugLog('_handleInstagramWebhook: event', ['ig_id' => $igId, 'event' => $event]);
            $this->_queueInstagramEventForTenant($igId, $event);
        }
    }
}

/**
 * Resolve tenant for an Instagram account ID and forward the raw event to the tenant's
 * Instagram ingest endpoint. Instagram Business Login connects standalone (no Facebook Page),
 * so ab_instagram_accounts (ig_user_id -> tenant) is the primary lookup; the ab_fb_pages
 * instagram_business_account_id column is kept as a fallback for any account that was instead
 * connected via a Page's linked Instagram Business Account.
 */
private function _queueInstagramEventForTenant($igId, array $event)
{
    $tenantId  = null;
    $companyId = null;
    $igToken   = null;

    $igAccount = $this->CommonModel->getMasterDetails("instagram_accounts", "*", ['ig_user_id' => $igId]);
    if (!empty($igAccount)) {
        $tenantId  = $igAccount[0]->tenant_id;
        $companyId = $igAccount[0]->company_id ?? null;
    } else {
        $pageFallback = $this->CommonModel->getMasterDetails("fb_pages", "*", ['instagram_business_account_id' => $igId]);
        if (!empty($pageFallback)) {
            $tenantId  = $pageFallback[0]->tenant_id;
            $companyId = $pageFallback[0]->company_id ?? null;
            $igToken   = $pageFallback[0]->page_access_token ?? null; // Page-linked IG uses the Page's token
        }
    }

    if (empty($tenantId)) {
        log_message("error", "FB Webhook: Tenant not found for ig_user_id $igId");
        $this->_webhookDebugLog('_queueInstagramEventForTenant: REJECTED no instagram_accounts/fb_pages row', ['ig_id' => $igId]);
        return false;
    }

    $pageToken = $igToken;

    $tenantRow = $this->CommonModel->getMasterDetails("customer", "*", ['customer_id' => $tenantId]);
    if (empty($tenantRow)) {
        log_message("error", "FB Webhook: Tenant record not found for tenant_id $tenantId");
        return false;
    }

    $subdomain = $tenantRow[0]->sub_domain_name ?? null;
    $website   = $tenantRow[0]->website ?? null;

    if (empty($subdomain) && empty($website)) {
        log_message("error", "FB Webhook: No subdomain/website on file for tenant_id $tenantId");
        return false;
    }

    $base = (empty($subdomain) || $subdomain === 'development' || $subdomain === 'cms')
        ? "https://{$website}"
        : "https://{$subdomain}.webtrix24.com";

    $url = $base . '/API/instagram/incoming';

    $payload = json_encode([
        'ig_id'       => $igId,
        'event'       => $event,
        'page_token'  => $pageToken,
        'received_at' => date('Y-m-d H:i:s'),
    ]);

    $secret = (string) ($this->config->item('META_TENANT_FORWARD_SECRET') ?: '');

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-WEBTRIX-SOURCE: fbhub',
            'X-WEBTRIX-TENANT-ID: ' . $tenantId,
            'X-WEBTRIX-COMPANY-ID: ' . ($companyId ?? ''),
            'X-WEBTRIX-META-SECRET: ' . $secret,
        ],
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);

    $response = curl_exec($ch);
    $error    = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $this->_webhookDebugLog('_queueInstagramEventForTenant: forward response', [
        'http_code'    => $httpCode,
        'curl_error'   => $error,
        'raw_response' => $response,
    ]);

    return true;
}

/**
 * Step 1 — Open the central popup page for Facebook Login for Business (Pages / Lead Ads).
 * Uses its OWN config_id (FB_PAGES_CONFIG_ID) — a separate Business Login Configuration from
 * the WhatsApp Embedded Signup config IDs, so this flow never touches WhatsApp's tokens/session.
 *
 * URL: GET https://my.webtrix24.com/API/fb-pages-connect
 *        ?return_origin=https://tenant.webtrix24.com
 *        &company_id=42
 */
public function pagesConnect()
{
    $returnOrigin = trim((string) $this->input->get('return_origin'));
    $companyId    = (int) $this->input->get('company_id');

    $appId    = $this->config->item('FB_APP_ID') ?: getenv('FB_APP_ID');
    $configId = $this->config->item('FB_PAGES_CONFIG_ID') ?: getenv('FB_PAGES_CONFIG_ID');

    if (empty($returnOrigin) || empty($companyId)) {
        show_error('Missing return origin or company ID.', 400);
        return;
    }

    if (empty($appId)) {
        log_message('error', 'pagesConnect: FB_APP_ID is not configured.');
        show_error('Facebook App ID is not configured on this server.', 500);
        return;
    }

    if (empty($configId) || $configId === 'REPLACE_WITH_PAGES_LOGIN_CONFIG_ID') {
        log_message('error', 'pagesConnect: FB_PAGES_CONFIG_ID is not configured.');
        show_error('Facebook Login for Business (Pages) is not configured on this server.', 500);
        return;
    }

    $this->load->view('meta/fb_pages_connect', [
        'return_origin' => htmlspecialchars($returnOrigin, ENT_QUOTES, 'UTF-8'),
        'company_id'    => $companyId,
        'app_id'        => htmlspecialchars($appId, ENT_QUOTES, 'UTF-8'),
        'config_id'     => htmlspecialchars((string) $configId, ENT_QUOTES, 'UTF-8'),
        'process_url'   => site_url('fb-pages-process'),
    ]);
}

/**
 * Step 2 — Receive the code/token from the Pages login popup, exchange it server-side if
 * needed (never in the browser), then forward it to the tenant's
 * /API/facebook/pages/authorize endpoint server-to-server.
 */
public function pagesProcess()
{
    header('Content-Type: application/json');

    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $redirectBase  = $this->config->item('FB_REDIRECT_URI') ?: getenv('FB_REDIRECT_URI') ?: site_url();
    $allowedHost   = parse_url($redirectBase, PHP_URL_HOST);
    $originHost    = !empty($requestOrigin) ? parse_url($requestOrigin, PHP_URL_HOST) : '';

    if (!empty($requestOrigin) && !empty($allowedHost) && strcasecmp((string) $originHost, (string) $allowedHost) !== 0) {
        $this->_debugLog('pagesProcess: REJECTED forbidden origin', ['requestOrigin' => $requestOrigin, 'allowedHost' => $allowedHost]);
        http_response_code(403);
        echo json_encode(['flag' => 'F', 'msg' => 'Forbidden.']);
        return;
    }

    $input        = json_decode(file_get_contents('php://input'), true);
    $accessToken  = $input['access_token'] ?? null;
    $authCode     = $input['code'] ?? null;
    $returnOrigin = $input['return_origin'] ?? null;
    $companyId    = (int) ($input['company_id'] ?? 0);

    $this->_debugLog('pagesProcess: request received', [
        'has_code'         => !empty($authCode),
        'has_access_token' => !empty($accessToken),
        'code_prefix'      => $authCode ? substr($authCode, 0, 12) . '…' : null,
        'return_origin'    => $returnOrigin,
        'company_id'       => $companyId,
    ]);

    if ((empty($accessToken) && empty($authCode)) || empty($returnOrigin) || empty($companyId)) {
        $this->_debugLog('pagesProcess: REJECTED missing required fields', $input);
        echo json_encode(['flag' => 'F', 'msg' => 'Missing required fields.']);
        return;
    }

    $parsedOrigin = parse_url($returnOrigin);
    $originScheme = strtolower((string) ($parsedOrigin['scheme'] ?? ''));
    $originHostR  = strtolower((string) ($parsedOrigin['host'] ?? ''));
    $isLocalDev   = in_array($originHostR, ['localhost', '127.0.0.1'], true);

    if (empty($originHostR) || !in_array($originScheme, ['https', 'http'], true) || ($originScheme !== 'https' && !$isLocalDev)) {
        echo json_encode(['flag' => 'F', 'msg' => 'Invalid return origin.']);
        return;
    }

    $graphVersion = $this->config->item('META_GRAPH_VERSION') ?: 'v23.0';

    if (empty($accessToken) && !empty($authCode)) {
        $appId     = $this->config->item('FB_APP_ID') ?: getenv('FB_APP_ID');
        $appSecret = $this->config->item('FB_APP_SECRET') ?: getenv('FB_APP_SECRET');

        if (empty($appId) || empty($appSecret)) {
            echo json_encode(['flag' => 'F', 'msg' => 'Facebook App is not configured on this server.']);
            return;
        }

        // FALLBACK PATH — normally unreached. fb_pages_connect.php requests response_type:'token'
        // now, so the popup hands back an access_token directly and this branch is skipped.
        // This code-exchange path is kept only in case a client ever sends a `code` instead
        // (e.g. an older cached popup page). Note: passing redirect_uri='' here was tried while
        // debugging "Error validating verification code... redirect_uri must be identical" (code
        // 100 / subcode 36008) and did NOT resolve it — that error persisted regardless of
        // redirect_uri value, which is why the popup no longer requests 'code' at all. Don't
        // trust this comment's redirect_uri value as a confirmed fix if this path is ever hit again.
        $tokenUrl = "https://graph.facebook.com/{$graphVersion}/oauth/access_token?" . http_build_query([
            'client_id'     => $appId,
            'client_secret' => $appSecret,
            'redirect_uri'  => '',
            'code'          => $authCode,
        ]);

        $this->_debugLog('pagesProcess: exchanging code', [
            'graph_version' => $graphVersion,
            'app_id'        => $appId,
            'url_no_secret' => "https://graph.facebook.com/{$graphVersion}/oauth/access_token?" . http_build_query([
                'client_id'    => $appId,
                'redirect_uri' => '',
                'code'         => substr($authCode, 0, 12) . '…',
            ]),
        ]);

        $ch = curl_init($tokenUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $tokenResponse = curl_exec($ch);
        $curlError     = curl_error($ch);
        $httpCode      = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $this->_debugLog('pagesProcess: code exchange response', [
            'http_code'     => $httpCode,
            'curl_error'    => $curlError,
            'raw_response'  => $tokenResponse,
        ]);

        if ($curlError || empty($tokenResponse)) {
            log_message('error', 'pagesProcess: code exchange cURL error: ' . $curlError);
            echo json_encode(['flag' => 'F', 'msg' => 'Failed to exchange Facebook code.']);
            return;
        }

        $tokenData   = json_decode($tokenResponse, true);
        $accessToken = $tokenData['access_token'] ?? null;

        if (empty($accessToken)) {
            $fbErrMsg = $tokenData['error']['message'] ?? 'No access token in Facebook response.';
            $this->_debugLog('pagesProcess: REJECTED no access_token', $tokenData);
            log_message('error', 'pagesProcess: code exchange failed — ' . $fbErrMsg);
            echo json_encode(['flag' => 'F', 'msg' => $fbErrMsg]);
            return;
        }
    }

    $host      = parse_url($returnOrigin, PHP_URL_HOST);
    $parts     = explode('.', $host);
    $subdomain = count($parts) >= 3 ? $parts[0] : $host;
    $tenantApiUrl = rtrim($returnOrigin, '/') . '/API/facebook/pages/authorize';

    $payload = json_encode([
        'company_id'   => $companyId,
        'access_token' => $accessToken,
    ]);

    $ch = curl_init($tenantApiUrl);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
            'X-WEBTRIX-SOURCE: fbhub-pages-oauth',
            'X-WEBTRIX-SUBDOMAIN: ' . $subdomain,
        ],
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $apiResponse = curl_exec($ch);
    $curlError2  = curl_error($ch);
    $tenantHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $this->_debugLog('pagesProcess: tenant authorize response', [
        'tenant_api_url' => $tenantApiUrl,
        'http_code'      => $tenantHttpCode,
        'curl_error'     => $curlError2,
        'raw_response'   => $apiResponse,
    ]);

    if ($curlError2) {
        log_message('error', 'pagesProcess: tenant API cURL error: ' . $curlError2);
        echo json_encode(['flag' => 'F', 'msg' => 'Could not reach your account server. Please try again.']);
        return;
    }

    $apiData = json_decode($apiResponse, true);
    if (($apiData['flag'] ?? '') !== 'S') {
        $errMsg = $apiData['msg'] ?? 'Account server returned an error.';
        log_message('error', 'pagesProcess: tenant API flag != S — ' . $errMsg);
        echo json_encode(['flag' => 'F', 'msg' => $errMsg]);
        return;
    }

    log_message('info', "pagesProcess: pages discovery success for subdomain={$subdomain} company={$companyId}");
    echo json_encode(['flag' => 'S', 'msg' => 'Facebook Pages connected successfully.', 'data' => $apiData['data'] ?? []]);
}

/**
 * Debug-only logger — writes to its own file rather than depending on CI's log_message(),
 * since $config['log_threshold'] is 0 (logging disabled) in this app and flipping that
 * globally would affect every other log_message() call across the codebase.
 * Safe to delete this method and its call sites once the relevant flow is confirmed working.
 */
private function _debugLog($label, $data = null, $file = 'meta_pages_debug.log')
{
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $label;
    if ($data !== null) {
        $line .= ' ' . json_encode($data, JSON_UNESCAPED_SLASHES);
    }
    $line .= "\n";

    @file_put_contents(APPPATH . 'logs/' . $file, $line, FILE_APPEND | LOCK_EX);
}

private function _webhookDebugLog($label, $data = null)
{
    $this->_debugLog($label, $data, 'meta_webhook_debug.log');
}

}
