<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Instagram Business Login — connects directly to an Instagram professional account (no
 * Facebook Page involved), using Instagram's own OAuth endpoints. This is a genuine server-side
 * redirect flow (unlike the Pages connector's FB.login() JS SDK popup, which never navigates the
 * browser at all) — Instagram redirects the popup here after the user authorizes.
 */
class InstagramLogin extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->model('CommonModel');
    }

    /**
     * GET https://my.webtrix24.com/API/instagram-callback?code=...&state=...
     * `state` carries return_origin + company_id through the redirect (base64url JSON) since
     * there's no session available on this GET request the way a popup-hosted view would have one.
     */
    public function callback()
    {
        $code  = $this->input->get('code');
        $state = $this->input->get('state');
        $error = $this->input->get('error_description') ?? $this->input->get('error');

        $stateData    = $this->_decodeState((string) $state);
        $returnOrigin = $stateData['return_origin'] ?? null;
        $companyId    = (int) ($stateData['company_id'] ?? 0);

        if (!empty($error)) {
            $this->_renderResult($returnOrigin, (string) $error);
            return;
        }

        if (empty($code) || empty($returnOrigin) || empty($companyId)) {
            $this->_renderResult($returnOrigin, 'Missing code or state from Instagram.');
            return;
        }

        $appId       = $this->config->item('INSTAGRAM_APP_ID');
        $appSecret   = $this->config->item('INSTAGRAM_APP_SECRET');
        $redirectUri = $this->config->item('INSTAGRAM_REDIRECT_URI') ?: 'https://my.webtrix24.com/API/instagram-callback';

        if (empty($appId) || empty($appSecret)) {
            log_message('error', 'InstagramLogin: INSTAGRAM_APP_ID/SECRET not configured.');
            $this->_renderResult($returnOrigin, 'Instagram is not configured on this server.');
            return;
        }

        // Step 1: short-lived token
        $ch = curl_init('https://api.instagram.com/oauth/access_token');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => http_build_query([
                'client_id'     => $appId,
                'client_secret' => $appSecret,
                'grant_type'    => 'authorization_code',
                'redirect_uri'  => $redirectUri,
                'code'          => $code,
            ]),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
        ]);
        $shortResp  = curl_exec($ch);
        $curlError1 = curl_error($ch);
        curl_close($ch);

        $shortData  = json_decode((string) $shortResp, true);
        $shortToken = $shortData['access_token'] ?? null;
        $igUserId   = $shortData['user_id'] ?? null;

        if ($curlError1 || empty($shortToken) || empty($igUserId)) {
            log_message('error', 'InstagramLogin: short-lived token exchange failed: ' . ($curlError1 ?: $shortResp));
            $this->_renderResult($returnOrigin, $shortData['error_message'] ?? 'Failed to exchange Instagram authorization code.');
            return;
        }

        // Step 2: exchange for a long-lived token (~60 days)
        $longUrl = 'https://graph.instagram.com/access_token?' . http_build_query([
            'grant_type'    => 'ig_exchange_token',
            'client_secret' => $appSecret,
            'access_token'  => $shortToken,
        ]);
        $ch = curl_init($longUrl);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20]);
        $longResp = curl_exec($ch);
        curl_close($ch);

        $longData  = json_decode((string) $longResp, true);
        $finalToken = $longData['access_token'] ?? $shortToken; // fall back to short-lived if the exchange itself fails

        // Forward to the tenant
        $host      = parse_url($returnOrigin, PHP_URL_HOST);
        $parts     = explode('.', (string) $host);
        $subdomain = count($parts) >= 3 ? $parts[0] : $host;

        $tenantApiUrl = rtrim($returnOrigin, '/') . '/API/instagram/authorize';
        $payload = json_encode([
            'company_id'   => $companyId,
            'ig_user_id'   => $igUserId,
            'access_token' => $finalToken,
        ]);

        $ch = curl_init($tenantApiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Accept: application/json',
                'X-WEBTRIX-SOURCE: ig-oauth',
                'X-WEBTRIX-SUBDOMAIN: ' . $subdomain,
            ],
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
        ]);
        $apiResponse = curl_exec($ch);
        $curlError2  = curl_error($ch);
        curl_close($ch);

        if ($curlError2) {
            log_message('error', 'InstagramLogin: tenant API cURL error: ' . $curlError2);
            $this->_renderResult($returnOrigin, 'Could not reach your account server. Please try again.');
            return;
        }

        $apiData = json_decode((string) $apiResponse, true);
        if (($apiData['flag'] ?? '') !== 'S') {
            $this->_renderResult($returnOrigin, $apiData['msg'] ?? 'Account server returned an error.');
            return;
        }

        $this->_renderResult($returnOrigin, null);
    }

    /**
     * Called by the tenant BE to register an Instagram account in the central hub's
     * ab_instagram_accounts table, keyed by ig_user_id -> tenant_id. Required for Instagram DM
     * webhook resolution (meta/FacebookConnect::_queueInstagramEventForTenant).
     * Route: POST /API/InstagramLogin/storeAccount
     */
    public function storeAccount()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input)) $input = $this->input->post();

        $subdomain = $this->input->get_request_header('X-WEBTRIX-SUBDOMAIN', true);
        if (empty($subdomain)) {
            $host = $_SERVER['HTTP_HOST'] ?? '';
            $parts = explode('.', strtolower($host));
            $subdomain = count($parts) >= 3 ? $parts[0] : null;
        } else {
            $subdomain = strtolower($subdomain);
        }

        if (empty($subdomain)) {
            echo json_encode(['flag' => 'F', 'msg' => 'Unauthorized or unknown tenant. No subdomain found.']);
            return;
        }

        $tenant = $this->CommonModel->getMasterDetails('customer', '*', ['sub_domain_name' => $subdomain]);
        if (empty($tenant)) {
            echo json_encode(['flag' => 'F', 'msg' => "Unauthorized tenant: {$subdomain}"]);
            return;
        }

        if (empty($input['company_id']) || empty($input['ig_user_id'])) {
            echo json_encode(['flag' => 'F', 'msg' => 'Missing required fields']);
            return;
        }

        $where = [
            'tenant_id'  => $tenant[0]->customer_id,
            'ig_user_id' => $input['ig_user_id'],
        ];

        $data = [
            'tenant_id'     => $tenant[0]->customer_id,
            'company_id'    => $input['company_id'],
            'ig_user_id'    => $input['ig_user_id'],
            'modified_date' => date('Y-m-d H:i:s'),
        ];

        $exists = $this->CommonModel->getMasterDetails('instagram_accounts', '*', $where);
        if (!empty($exists)) {
            $res = $this->CommonModel->updateMasterDetails('instagram_accounts', $data, $where);
        } else {
            $data['created_date'] = date('Y-m-d H:i:s');
            $res = $this->CommonModel->saveMasterDetails('instagram_accounts', $data);
        }

        if (!$res) {
            echo json_encode(['flag' => 'F', 'msg' => 'DB Error']);
            return;
        }

        echo json_encode(['flag' => 'S', 'msg' => 'Instagram account registered.']);
    }

    private function _decodeState(string $state): array
    {
        if (empty($state)) {
            return [];
        }
        $json = base64_decode(strtr($state, '-_', '+/'), true);
        $data = json_decode((string) $json, true);
        return is_array($data) ? $data : [];
    }

    private function _renderResult(?string $returnOrigin, ?string $error): void
    {
        $this->load->view('meta/instagram_callback', [
            'return_origin' => $returnOrigin ? htmlspecialchars($returnOrigin, ENT_QUOTES, 'UTF-8') : null,
            'error'         => $error,
        ]);
    }
}
