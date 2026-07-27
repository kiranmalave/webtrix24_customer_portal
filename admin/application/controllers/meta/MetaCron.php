<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * MetaCron — Central Meta Sync Job Dispatcher
 * ============================================
 * Loops all active, setup-complete tenants from the central `customer` table and calls each
 * tenant's /API/meta/cron/work endpoint (drains that tenant's meta_sync_jobs queue) in parallel
 * batches using curl_multi. Mirrors systems/TaskCron.php's dispatch pattern exactly.
 *
 * CRON JOB (recommended: every 1 minute):
 *
 *   curl -s "https://my.webtrix24.com/API/meta/cron/dispatch?cron_secret=SECRET"
 *
 * Frequency note: this only makes a Graph API call per tenant PER QUEUED JOB — an idle tenant
 * with nothing queued costs one cheap HTTP round-trip and zero Graph calls. Running every minute
 * is what keeps lead latency low (webhook -> queued -> picked up within ~60s) and is NOT a rate
 * limit risk by itself, since call volume is bounded by actual lead volume, not dispatch
 * frequency — see docs/OPERATIONS.md (or ask) for the reconciliation (hourly) and token
 * validation (daily) crons, which are separate, coarser-grained jobs not yet built.
 *
 * SCALING:
 *   - curl_multi fires `cron_batch_size` (default 50) calls concurrently.
 *   - Tenants that have nothing queued return quickly (table_exists guard + empty claim).
 */
class MetaCron extends CI_Controller
{
    private const META_CRON_PATH = '/meta/cron/work';

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->library('response');
    }

    /**
     * GET|POST /meta/cron/dispatch?limit=20
     *
     * Triggers the Meta sync job worker on all active tenants. `limit` (default 20) is the max
     * jobs each tenant claims per run — forwarded to every tenant's /API/meta/cron/work call.
     */
    public function dispatch()
    {
        if (!$this->_isAuthorized()) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'Unauthorized']);
            return;
        }

        set_time_limit(0);

        $baseDomain     = (string) $this->config->item('tenant_base_domain');
        $testDomain     = (string) ($this->config->item('tenant_test_domain') ?? $baseDomain);
        $testSubdomains = (array) ($this->config->item('tenant_test_subdomains') ?? []);
        $devMode        = (bool) ($this->config->item('cron_dev_mode') ?? true);
        $cronSecret     = (string) ($this->config->item('cron_secret') ?? '');
        $batchSize      = max(1, (int) ($this->config->item('cron_batch_size') ?? 50));
        $timeoutSec     = max(30, (int) ($this->config->item('cron_timeout_sec') ?? 120));
        $limit          = max(1, (int) ($this->input->get('limit') ?: 20));
        $startedAt      = time();

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
                'url'       => 'https://' . $t['sub_domain_name'] . '.' . $domain . '/API' . self::META_CRON_PATH . '?limit=' . $limit,
            ];
        }

        $waveResult = $this->_runWave($tenantEntries, $cronSecret, $batchSize, $timeoutSec);

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
    // Private helpers — identical pattern to systems/TaskCron.php
    // -------------------------------------------------------------------------

    private function _runWave(array $tenants, $cronSecret, $batchSize, $timeoutSec)
    {
        $succeeded = 0;
        $failed    = 0;
        $errors    = [];

        foreach (array_chunk($tenants, $batchSize) as $batch) {
            $result     = $this->_curlMultiBatch($batch, $cronSecret, $timeoutSec);
            $succeeded += $result['succeeded'];
            $failed    += $result['failed'];
            $errors     = array_merge($errors, $result['errors']);
        }

        return compact('succeeded', 'failed', 'errors');
    }

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
            $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
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
     * Verify the inbound request carries the cron secret. Same convention as
     * systems/TaskCron.php: X-Cron-Secret header, ?cron_secret= query param, or CLI 4th segment.
     * If $config['cron_secret'] is empty, all callers are allowed (dev mode).
     */
    private function _isAuthorized()
    {
        $expected = (string) ($this->config->item('cron_secret') ?? '');
        if ($expected === '') {
            return true;
        }

        $fromHeader = isset($_SERVER['HTTP_X_CRON_SECRET']) ? $_SERVER['HTTP_X_CRON_SECRET'] : '';
        $fromQuery  = (string) ($this->input->get('cron_secret', true) ?? '');

        $fromCli = '';
        if ($this->input->is_cli_request()) {
            $fromCli = (string) ($this->uri->segment(4) ?? '');
        }

        return hash_equals($expected, $fromHeader)
            || hash_equals($expected, $fromQuery)
            || ($fromCli !== '' && hash_equals($expected, $fromCli));
    }
}
