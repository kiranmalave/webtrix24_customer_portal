<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * CampaignCron — Central Campaign Cron Dispatcher
 * ================================================
 * Loops all active, setup-complete tenants from the central `ab_customer`
 * table and calls campaign cron endpoints on each tenant's BE server
 * in parallel batches using curl_multi.
 *
 * TWO SEPARATE CRON JOBS (recommended):
 *
 *   1. dispatchCampaigns  — every 10 min
 *      Runs: recurring (enroll + execute) → enrollments (resume wait nodes)
 *      curl -s "https://my.webtrix24.com/API/cron/campaigns/dispatch/campaigns?cron_secret=SECRET"
 *
 *   2. dispatchMessages   — every 2 min
 *      Runs: messages (send queued WhatsApp / email / SMS)
 *      curl -s "https://my.webtrix24.com/API/cron/campaigns/dispatch/messages?cron_secret=SECRET"
 *
 * SCALING (1 000+ tenants):
 *   - Tenants with no work return in <100 ms (lock check exits fast).
 *   - curl_multi fires `cron_batch_size` (default 50) calls concurrently.
 *   - 1 000 tenants / 50 parallel = 20 batches × 2 waves = 40 curl rounds for campaigns.
 *   - Increase $config['cron_batch_size'] for faster dispatch on beefy servers.
 */
class CampaignCron extends CI_Controller
{
    /** All available wave paths on each tenant BE. */
    private const ALL_WAVES = [
        'recurring'   => '/campaigns/engine/cron/recurring',
        'enrollments' => '/campaigns/engine/cron/enrollments',
        'messages'    => '/campaigns/engine/cron/messages',
    ];

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
     * GET|POST /cron/campaigns/dispatch/campaigns   (every 10 min)
     *
     * Wave 1: recurring   — enroll matching records, execute workflows, queue messages.
     * Wave 2: enrollments — resume enrollments paused on wait nodes.
     */
    public function dispatchCampaigns()
    {
        $this->_run(['recurring', 'enrollments']);
    }

    /**
     * GET|POST /cron/campaigns/dispatch/messages   (every 2 min)
     *
     * Wave 1: messages — send all queued messages via WhatsApp / email / SMS.
     */
    public function dispatchMessages()
    {
        $this->_run(['messages']);
    }

    /**
     * GET|POST /cron/campaigns/dispatch   (legacy — runs all three waves)
     *
     * Kept for backward compatibility. Prefer the two split endpoints above.
     */
    public function dispatch()
    {
        if (!$this->_isAuthorized()) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'Unauthorized']);
            return;
        }

        set_time_limit(0); // dispatcher may take a few minutes for large tenant counts

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
                'base_url'  => 'https://' . $t['sub_domain_name'] . '.' . $domain . '/API',
            ];
        }

        $results = [
            'total_tenants' => count($tenantEntries),
            'waves'         => [],
            'runtime_sec'   => 0,
        ];

        foreach (self::ALL_WAVES as $waveName => $path) {
            $results['waves'][$waveName] = $this->_runWave(
                $waveName, $path, $tenantEntries, $cronSecret, $batchSize, $timeoutSec
            );
        }

        $results['runtime_sec'] = time() - $startedAt;

        header('Content-Type: application/json');
        echo json_encode(['ok' => true, 'data' => $results], JSON_PRETTY_PRINT);
    }

    // -------------------------------------------------------------------------
    // Shared runner (used by all public endpoints)
    // -------------------------------------------------------------------------

    /**
     * Load tenants and run the requested waves in order.
     *
     * @param string[] $waveKeys  Keys from ALL_WAVES to run, e.g. ['recurring', 'enrollments']
     */
    private function _run(array $waveKeys)
    {
        if (!$this->_isAuthorized()) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'Unauthorized']);
            return;
        }

        set_time_limit(0);

        $baseDomain  = (string)$this->config->item('tenant_base_domain');
        $cronSecret  = (string)($this->config->item('cron_secret') ?? '');
        $batchSize   = max(1, (int)($this->config->item('cron_batch_size') ?? 50));
        $timeoutSec  = max(30, (int)($this->config->item('cron_timeout_sec') ?? 120));
        $startedAt   = time();

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
            $tenantEntries[] = [
                'tenant_id' => $t['customer_id'],
                'name'      => $t['name'],
                'base_url'  => 'https://' . $t['sub_domain_name'] . '.' . $baseDomain . '/API',
            ];
        }

        $results = [
            'total_tenants' => count($tenantEntries),
            'waves'         => [],
            'runtime_sec'   => 0,
        ];

        foreach ($waveKeys as $waveName) {
            $path = self::ALL_WAVES[$waveName] ?? null;
            if ($path === null) continue;
            $results['waves'][$waveName] = $this->_runWave(
                $waveName, $path, $tenantEntries, $cronSecret, $batchSize, $timeoutSec
            );
        }

        $results['runtime_sec'] = time() - $startedAt;

        header('Content-Type: application/json');
        echo json_encode(['ok' => true, 'data' => $results], JSON_PRETTY_PRINT);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Run one wave (e.g. "recurring") across all tenants in parallel batches.
     *
     * @param string $waveName     Human-readable name for logging.
     * @param string $path         API path, e.g. /campaigns/engine/cron/recurring
     * @param array  $tenants      Array of ['tenant_id', 'name', 'base_url']
     * @param string $cronSecret   Shared secret header value.
     * @param int    $batchSize    Max concurrent curl handles per batch.
     * @param int    $timeoutSec   Per-request timeout in seconds.
     * @return array               Summary: succeeded, failed, error list.
     */
    private function _runWave($waveName, $path, array $tenants, $cronSecret, $batchSize, $timeoutSec)
    {
        $succeeded = 0;
        $failed    = 0;
        $errors    = [];

        foreach (array_chunk($tenants, $batchSize) as $batch) {
            // Build request items for this batch
            $items = array_map(function ($t) use ($path) {
                return array_merge($t, ['url' => $t['base_url'] . $path]);
            }, $batch);

            $result     = $this->_curlMultiBatch($items, $cronSecret, $timeoutSec);
            $succeeded += $result['succeeded'];
            $failed    += $result['failed'];
            $errors     = array_merge($errors, $result['errors']);
        }

        return [
            'wave'      => $waveName,
            'succeeded' => $succeeded,
            'failed'    => $failed,
            // Only failed tenants are included to keep the response small
            'errors'    => $errors,
        ];
    }

    /**
     * Execute a batch of POST requests concurrently via curl_multi.
     *
     * Each request:
     *   - Method: POST (body: empty JSON object)
     *   - Header: X-Cron-Secret: <cronSecret>
     *   - Timeout: $timeoutSec seconds
     *
     * @param array  $items       [['tenant_id', 'name', 'url'], ...]
     * @param string $cronSecret
     * @param int    $timeoutSec
     * @return array ['succeeded', 'failed', 'errors']
     */
    private function _curlMultiBatch(array $items, $cronSecret, $timeoutSec)
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

        foreach ($items as $item) {
            $ch = curl_init($item['url']);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => '{}',
                CURLOPT_HTTPHEADER     => $headers,
                CURLOPT_TIMEOUT        => $timeoutSec,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_FOLLOWLOCATION => false,
            ]);
            curl_multi_add_handle($mh, $ch);
            $handles[] = ['ch' => $ch, 'item' => $item];
        }

        // Run all handles concurrently
        do {
            $status = curl_multi_exec($mh, $running);
            if ($running) {
                curl_multi_select($mh, 1.0);
            }
        } while ($running > 0 && $status === CURLM_OK);

        // Collect results
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
     *
     * If $config['cron_secret'] is empty, all callers are allowed (dev mode).
     */
    private function _isAuthorized()
    {
        $expected = (string)($this->config->item('cron_secret') ?? '');
        if ($expected === '') {
            return true; // dev mode — no secret configured
        }

        $fromHeader = isset($_SERVER['HTTP_X_CRON_SECRET'])
            ? $_SERVER['HTTP_X_CRON_SECRET']
            : '';
        $fromQuery  = (string)($this->input->get('cron_secret', true) ?? '');

        return hash_equals($expected, $fromHeader)
            || hash_equals($expected, $fromQuery);
    }
}
