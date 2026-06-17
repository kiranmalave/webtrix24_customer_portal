<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * TaskCron — Central Task Repeat Cron Dispatcher
 * ===============================================
 * Loops all active, setup-complete tenants from the central `customer` table
 * and calls the task repeat cron endpoint on each tenant's BE server in
 * parallel batches using curl_multi.
 *
 * CRON JOB (recommended: daily at midnight or desired repeat time):
 *
 *   curl -s "https://my.webtrix24.com/API/cron/tasks/dispatch/repeat?cron_secret=SECRET"
 *
 * SCALING:
 *   - curl_multi fires `cron_batch_size` (default 50) calls concurrently.
 *   - Tenants that have nothing to repeat return quickly.
 */
class TaskCron extends CI_Controller
{
    private const REPEAT_PATH = '/tasks/cron/repeat';

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->library('response');
    }

    // -------------------------------------------------------------------------
    // Public endpoints
    // -------------------------------------------------------------------------

    /**
     * GET|POST /cron/tasks/dispatch/repeat
     *
     * Triggers the task repeat generation on all active tenants.
     * Pass an optional `date` (Y-m-d) body param to override today's date
     * across all tenants — useful for backfill.
     */
    public function dispatchRepeat()
    {
        if (!$this->_isAuthorized()) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'Unauthorized']);
            return;
        }

        set_time_limit(0);

        $baseDomain      = (string)$this->config->item('tenant_base_domain');     // production domain
        $testDomain      = (string)($this->config->item('tenant_test_domain') ?? $baseDomain); // test/staging domain
        $testSubdomains  = (array)($this->config->item('tenant_test_subdomains') ?? []);       // subdomains on test server
        $devMode         = (bool)($this->config->item('cron_dev_mode') ?? true);              // true = test tenants only
        $cronSecret      = (string)($this->config->item('cron_secret') ?? '');
        $batchSize       = max(1, (int)($this->config->item('cron_batch_size') ?? 50));
        $timeoutSec      = max(30, (int)($this->config->item('cron_timeout_sec') ?? 120));
        $startedAt       = time();

        // In dev mode, refuse to run if no test subdomains are configured — safety guard.
        if ($devMode && empty($testSubdomains)) {
            header('Content-Type: application/json');
            echo json_encode(['ok' => false, 'msg' => 'cron_dev_mode is ON but tenant_test_subdomains is empty. Add test subdomains to config before running.']);
            return;
        }

        // Optional date override forwarded to each tenant
        $rawBody    = file_get_contents('php://input');
        $payload    = $rawBody ? (json_decode($rawBody, true) ?? []) : [];
        $dateParam  = isset($payload['date']) ? trim($payload['date']) : '';

        $tenants = $this->db
            ->select('customer_id, sub_domain_name, name')
            ->where('account_setup', 'y')
            ->where('status', 'active')
            ->where('database_name IS NOT NULL', null, false)
            ->where('database_name !=', '')
            ->where('sub_domain_name IS NOT NULL', null, false)
            ->where('sub_domain_name !=', '')
            ->order_by('customer_id', 'ASC')
            ->get('customer')
            ->result_array();

        $tenantEntries = [];
        foreach ($tenants as $t) {
            $isTestSub = in_array($t['sub_domain_name'], $testSubdomains, true);
            if ($devMode && !$isTestSub) {
                continue;
            }
            $domain = $isTestSub ? $testDomain : $baseDomain;
            $tenantEntries[] = [
                'tenant_id' => $t['customer_id'],
                'name'      => $t['name'],
                'url'       => 'https://' . $t['sub_domain_name'] . '.' . $domain . '/API' . self::REPEAT_PATH,
            ];
        }

        $waveResult = $this->_runWave($tenantEntries, $cronSecret, $batchSize, $timeoutSec, $dateParam);

        $results = [
            'total_tenants' => count($tenantEntries),
            'succeeded'     => $waveResult['succeeded'],
            'failed'        => $waveResult['failed'],
            'errors'        => $waveResult['errors'],
            'runtime_sec'   => time() - $startedAt,
        ];

        header('Content-Type: application/json');
        echo json_encode(['ok' => true, 'data' => $results], JSON_PRETTY_PRINT);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Run the repeat wave across all tenants in parallel batches.
     */
    private function _runWave(array $tenants, $cronSecret, $batchSize, $timeoutSec, $dateParam)
    {
        $succeeded = 0;
        $failed    = 0;
        $errors    = [];

        foreach (array_chunk($tenants, $batchSize) as $batch) {
            $result     = $this->_curlMultiBatch($batch, $cronSecret, $timeoutSec, $dateParam);
            $succeeded += $result['succeeded'];
            $failed    += $result['failed'];
            $errors     = array_merge($errors, $result['errors']);
        }

        return compact('succeeded', 'failed', 'errors');
    }

    /**
     * Execute a batch of POST requests concurrently via curl_multi.
     */
    private function _curlMultiBatch(array $items, $cronSecret, $timeoutSec, $dateParam)
    {
        $mh      = curl_multi_init();
        $handles = [];

        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
        ];
        if ($cronSecret !== '') {
            $headers[] = 'X-Cron-Secret: ' . $cronSecret;
        }

        $body = $dateParam !== '' ? json_encode(['date' => $dateParam]) : '{}';

        foreach ($items as $item) {
            $ch = curl_init($item['url']);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $body,
                CURLOPT_HTTPHEADER     => $headers,
                CURLOPT_TIMEOUT        => $timeoutSec,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_FOLLOWLOCATION => false,
            ]);
            curl_multi_add_handle($mh, $ch);
            $handles[] = ['ch' => $ch, 'item' => $item];
        }

        do {
            $status = curl_multi_exec($mh, $running);
            if ($running) {
                curl_multi_select($mh, 1.0);
            }
        } while ($running > 0 && $status === CURLM_OK);

        $succeeded = 0;
        $failed    = 0;
        $errors    = [];

        foreach ($handles as $entry) {
            $ch       = $entry['ch'];
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlErr  = curl_error($ch);

            if ($curlErr !== '' || $httpCode < 200 || $httpCode >= 300) {
                $failed++;
                $errors[] = [
                    'tenant_id' => $entry['item']['tenant_id'],
                    'name'      => $entry['item']['name'],
                    'url'       => $entry['item']['url'],
                    'http_code' => $httpCode,
                    'error'     => $curlErr ?: 'HTTP ' . $httpCode,
                ];
            } else {
                $succeeded++;
            }

            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
        }

        curl_multi_close($mh);

        return compact('succeeded', 'failed', 'errors');
    }

    /**
     * Verify the inbound request carries the cron secret.
     *
     * Accepted forms:
     *   - X-Cron-Secret header
     *   - ?cron_secret= query param
     *   - CLI 4th URI segment: php index.php systems/TaskCron dispatchRepeat <secret>
     *
     * If $config['cron_secret'] is empty, all callers are allowed (dev mode).
     */
    private function _isAuthorized()
    {
        $expected = (string)($this->config->item('cron_secret') ?? '');
        if ($expected === '') {
            return true;
        }

        $fromHeader = isset($_SERVER['HTTP_X_CRON_SECRET'])
            ? $_SERVER['HTTP_X_CRON_SECRET']
            : '';
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
