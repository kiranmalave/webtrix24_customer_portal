<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * InsuranceDigestWA — Central WhatsApp Dispatcher for Admin Digest
 * =================================================================
 * Called by tenant AdminDigest controller to send the weekly WA summary.
 * Resolves WA credentials from the TENANT database (not central DB),
 * sends template messages via Meta Graph API, returns counts only.
 *
 * No message content is logged here or in the tenant DB.
 *
 * Endpoint:
 *   POST /API/insurance/digest/send-wa
 *   Headers: X-WEBTRIX-SUBDOMAIN: <tenant-subdomain>
 *   Body: {
 *     company_id: int,
 *     recipients: [{ phone: "919xxxxxxxx", params: ["3 policies", ...] }]
 *   }
 *
 * Template:
 *   Name: insurance_admin_digest  (hardcoded — must be Meta-approved)
 *   Body params {{1}}…{{8}}:
 *     {{1}} renewals_today    {{2}} renewals_week    {{3}} renewals_month
 *     {{4}} overdue_renewals  {{5}} followups_today  {{6}} followups_overdue
 *     {{7}} birthdays_week    {{8}} new_policies_week
 */
class InsuranceDigestWA extends CI_Controller
{
    private const TEMPLATE_NAME  = 'insurance_admin_digest';
    private const META_API_BASE  = 'https://graph.facebook.com/v21.0';
    private const CURL_TIMEOUT   = 15;

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->model('CommonModel');
        $this->load->library('response');
    }

    /* ═══════════════════════════════════════════════════════
       POST /API/insurance/digest/send-wa
    ═══════════════════════════════════════════════════════ */
    public function sendWA()
    {
        header('Content-Type: application/json');

        // ── Authenticate: valid tenant subdomain required ──────────────────
        // $subdomain = $this->_detectSubdomain();
        // if (empty($subdomain)) {
        //     http_response_code(400);
        //     echo json_encode(['flag' => 'F', 'msg' => 'X-WEBTRIX-SUBDOMAIN header required']);
        //     return;
        // }

        $tenant = $this->CommonModel->getMasterDetails('customer', '*', [
            'sub_domain_name' => 'webtrix-solutions',
        ]);

        if (empty($tenant)) {
            http_response_code(403);
            echo json_encode(['flag' => 'F', 'msg' => 'Unknown or inactive insurance tenant: ' . $subdomain]);
            return;
        }

        $tenantRow = $tenant[0];

        // ── Parse body ─────────────────────────────────────────────────────
        $input      = json_decode(file_get_contents('php://input'), true) ?: [];
        $companyId  = 1;
        $recipients = $input['recipients'] ?? [];

        if ($companyId <= 0 || empty($recipients) || !is_array($recipients)) {
            http_response_code(422);
            echo json_encode(['flag' => 'F', 'msg' => 'company_id and recipients[] required']);
            return;
        }

        // ── Get tenant WA credentials from tenant DB ───────────────────────
        $creds = $this->_getTenantWaCreds($tenantRow, $companyId);
        if (!$creds['ok']) {
            log_message('error', "InsuranceDigestWA: no WA creds for subdomain={$subdomain} company={$companyId}: " . $creds['msg']);
            echo json_encode([
                'flag' => 'F',
                'msg'  => 'WhatsApp not configured for this account: ' . $creds['msg'],
                'data' => ['sent' => 0, 'failed' => count($recipients)],
            ]);
            return;
        }

        // ── Send to each recipient ─────────────────────────────────────────
        $sent   = 0;
        $failed = 0;

        foreach ($recipients as $r) {
            $phone  = preg_replace('/\D/', '', (string)($r['phone']  ?? ''));
            $params = is_array($r['params'] ?? null) ? $r['params'] : [];

            if (empty($phone)) { $failed++; continue; }

            $result = $this->_sendTemplate($phone, $params, $creds['access_token'], $creds['phone_number_id']);
            $result ? $sent++ : $failed++;
        }

        log_message('info', "InsuranceDigestWA: subdomain={$subdomain} sent={$sent} failed={$failed}");

        echo json_encode([
            'flag'       => 'S',
            'msg'        => "Digest WA dispatched: {$sent} sent, {$failed} failed",
            'data'       => ['sent' => $sent, 'failed' => $failed],
        ]);
    }

    /* ═══════════════════════════════════════════════════════
       PRIVATE — Connect to tenant DB and resolve WA credentials
    ═══════════════════════════════════════════════════════ */
    private function _getTenantWaCreds(object $tenantRow, int $companyId): array
    {
        if (empty($tenantRow->database_name) || empty($tenantRow->dbUserName) || empty($tenantRow->dbpassword)) {
            return ['ok' => false, 'msg' => 'Tenant DB credentials not configured'];
        }
        log_message('info', "InsuranceDigestWA: connecting to tenant DB for company_id={$tenantRow->dbUserName}  pass: {$tenantRow->dbpassword} database={$tenantRow->database_name}");
        $dbConfig = [
            'hostname' => 'localhost',
            'username' => $tenantRow->dbUserName,
            'password' => $tenantRow->dbpassword,
            'database' => 'webtrix24_customers_' . $tenantRow->database_name,
            'dbdriver' => 'mysqli',
            'dbprefix' => 'ab_',
            'pconnect' => FALSE,
            'db_debug' => TRUE,
            'char_set' => 'utf8',
            'dbcollat' => 'utf8_general_ci'
        ];

        try {
            $tenantDb = $this->load->database($dbConfig, true);
        } catch (Exception $e) {
            return ['ok' => false, 'msg' => 'Cannot connect to tenant DB: ' . $e->getMessage()];
        }

        if (!$tenantDb) {
            return ['ok' => false, 'msg' => 'Tenant DB connection failed'];
        }

        // Get WA settings (access_token lives in config_json)
        $settingRow = $tenantDb
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->order_by('is_default', 'DESC')
            ->order_by('id', 'DESC')
            ->limit(1)
            ->get('integration_whatsapp_settings')
            ->row_array();

        if (empty($settingRow)) {
            return ['ok' => false, 'msg' => 'No active WA integration found in tenant DB'];
        }

        $config = is_array($settingRow['config_json'] ?? null)
            ? $settingRow['config_json']
            : (json_decode($settingRow['config_json'] ?? '{}', true) ?: []);

        $accessToken = $config['access_token'] ?? '';
        if (empty($accessToken)) {
            return ['ok' => false, 'msg' => 'WA access_token missing from tenant integration config'];
        }

        // Get active phone number
        $numberRow = $tenantDb
            ->where('company_id', $companyId)
            ->where('is_active', 'y')
            ->order_by('is_default', 'DESC')
            ->order_by('id', 'DESC')
            ->limit(1)
            ->get('whatsapp_numbers')
            ->row_array();

        if (empty($numberRow) || empty($numberRow['id'])) {
            return ['ok' => false, 'msg' => 'No active WhatsApp number found in tenant DB'];
        }

        return [
            'ok'              => true,
            'access_token'    => $accessToken,
            'phone_number_id' => $numberRow['id'],
        ];
    }

    /* ═══════════════════════════════════════════════════════
       PRIVATE — Send one WA template message via Meta Graph API
    ═══════════════════════════════════════════════════════ */
    private function _sendTemplate(string $to, array $params, string $accessToken, string $phoneNumberId): bool
    {
        $url = self::META_API_BASE . '/' . $phoneNumberId . '/messages';

        $payload = [
            'messaging_product' => 'whatsapp',
            'to'                => $to,
            'type'              => 'template',
            'template'          => [
                'name'     => self::TEMPLATE_NAME,
                'language' => ['code' => 'en_US'],
            ],
        ];

        if (!empty($params)) {
            $payload['template']['components'][] = [
                'type'       => 'body',
                'parameters' => array_map(fn($p) => ['type' => 'text', 'text' => (string)$p], $params),
            ];
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => self::CURL_TIMEOUT,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $accessToken,
            ],
        ]);

        $response  = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            log_message('error', 'InsuranceDigestWA _sendTemplate curl error to ' . $to . ': ' . $curlError);
            return false;
        }

        $result = json_decode($response, true);
        $ok     = !empty($result['messages'][0]['id']);

        if (!$ok) {
            $errMsg = $result['error']['message'] ?? $response;
            log_message('error', 'InsuranceDigestWA _sendTemplate Meta error to ' . $to . ': ' . $errMsg);
        }

        return $ok;
    }

    /* ═══════════════════════════════════════════════════════
       PRIVATE — Detect calling tenant subdomain from header
    ═══════════════════════════════════════════════════════ */
    private function _detectSubdomain(): ?string
    {
        $header = $this->input->get_request_header('X-WEBTRIX-SUBDOMAIN', true);
        if (!empty($header)) return strtolower(trim($header));

        $host  = $_SERVER['HTTP_HOST'] ?? '';
        $parts = explode('.', strtolower($host));
        return count($parts) >= 3 ? $parts[0] : null;
    }
}
