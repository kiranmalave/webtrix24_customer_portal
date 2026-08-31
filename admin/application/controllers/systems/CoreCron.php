<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * CoreCron — Central Core-System Cron Dispatcher
 * =============================================
 * Loops all active, setup-complete tenants from the central `customer` table
 * and calls each tenant's core cron endpoint (/API/core/cron/run) in parallel
 * batches via curl_multi.
 *
 * The tenant side (webtrix_24_BE: core/jobs/CoreCron) decides what to do —
 * currently follow-up reminder notifications; more core jobs will hang off the
 * same endpoint. Every tenant is called regardless of crm_type; the tenant
 * reads its own crm_type from config/core_notifications.php.
 *
 * CRON JOB (every minute — 5-minute minimum reminder lead time):
 *
 *   * * * * * curl -s "https://my.webtrix24.com/API/cron/core/dispatch?cron_secret=SECRET" > /dev/null 2>&1
 *
 * Config keys (application/config/config.php): tenant_base_domain,
 *   tenant_test_domain, tenant_test_subdomains, cron_dev_mode, cron_secret,
 *   cron_batch_size, cron_timeout_sec.
 */
class CoreCron extends CI_Controller
{
    private const RUN_PATH = '/core/cron/run';

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->library('response');
    }

    /**
     * GET|POST /cron/core/dispatch
     */
    public function dispatchCron()
    {
        if (!$this->_isAuthorized()) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'Unauthorized']);
            return;
        }

        set_time_limit(0);

        $baseDomain     = (string)$this->config->item('tenant_base_domain');
        $testDomain     = (string)($this->config->item('tenant_test_domain') ?? $baseDomain);
        $testSubdomains = (array)($this->config->item('tenant_test_subdomains') ?? []);
        $devMode        = true;//(bool)($this->config->item('cron_dev_mode') ?? true);
        $cronSecret     = (string)($this->config->item('cron_secret') ?? '');
        $batchSize      = max(1, (int)($this->config->item('cron_batch_size') ?? 50));
        $timeoutSec     = max(20, (int)($this->config->item('cron_timeout_sec') ?? 60));
        $startedAt      = time();

        if ($devMode && empty($testSubdomains)) {
            header('Content-Type: application/json');
            echo json_encode(['ok' => false, 'msg' => 'cron_dev_mode is ON but tenant_test_subdomains is empty.']);
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
                'url'       => 'https://' . $t['sub_domain_name'] . '.' . $domain . '/API' . self::RUN_PATH,
            ];
        }
        $waveResult = $this->_runWave($tenantEntries, $cronSecret, $batchSize, $timeoutSec);

        header('Content-Type: application/json');
        echo json_encode(['ok' => true, 'data' => [
            'total_tenants' => count($tenantEntries),
            'succeeded'     => $waveResult['succeeded'],
            'failed'        => $waveResult['failed'],
            'errors'        => $waveResult['errors'],
            'runtime_sec'   => time() - $startedAt,
        ]], JSON_PRETTY_PRINT);
    }

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

        $headers = ['Content-Type: application/json', 'Accept: application/json'];
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
     * X-Cron-Secret header / ?cron_secret= / CLI 4th segment must match
     * $config['cron_secret']. Empty config secret = allow all (dev mode).
     */
    private function _isAuthorized()
    {
        $expected = (string)($this->config->item('cron_secret') ?? '');
        if ($expected === '') {
            return true;
        }

        $fromHeader = isset($_SERVER['HTTP_X_CRON_SECRET']) ? $_SERVER['HTTP_X_CRON_SECRET'] : '';
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
