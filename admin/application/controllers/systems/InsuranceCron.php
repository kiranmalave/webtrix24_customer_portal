<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * InsuranceCron — Central Insurance Renewal Reminder Cron Dispatcher
 * ==================================================================
 * Loops all active insurance tenants (crm_type = 'insurance') from the
 * central `customer` table and calls the renewal reminder cron endpoints
 * on each tenant's BE server in parallel batches using curl_multi.
 *
 * Filters ONLY insurance tenants — general / rental / other CRM types
 * are excluded. Campaign reminders continue to run via CampaignCron.
 *
 * TWO SEPARATE CRON JOBS (recommended):
 *
 *   1. dispatchReminders  — once daily (e.g. 06:00 AM)
 *      Scans policies due today and queues reminder records in the log table.
 *      curl -s "https://my.webtrix24.com/API/cron/insurance/dispatch/reminders?cron_secret=SECRET"
 *
 *   2. dispatchMessages   — every 10–15 min
 *      Picks up queued log records and physically sends WA / Email messages.
 *      curl -s "https://my.webtrix24.com/API/cron/insurance/dispatch/messages?cron_secret=SECRET"
 *
 * Config keys (application/config/config.php):
 *   tenant_base_domain   — production root domain (e.g. webtrix24.com)
 *   cron_secret          — shared secret sent as X-Cron-Key header
 *   cron_batch_size      — max concurrent curl handles per batch (default 50)
 *   cron_timeout_sec     — per-request timeout in seconds (default 120)
 */
class InsuranceCron extends CI_Controller
{
    /** Tenant-side paths for each cron wave. */
    private const WAVE_PATHS = [
        'reminders' => '/insurance/renewal-reminders/cron/run',
        'messages'  => '/insurance/renewal-reminders/cron/send-queued',
    ];

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->library('response');
    }

    // =========================================================================
    // Public endpoints
    // =========================================================================

    /**
     * GET|POST /cron/insurance/dispatch/reminders   (daily, e.g. 06:00 AM)
     *
     * Dispatches the "queue reminders" wave to all active insurance tenants.
     * Each tenant scans policies due today and inserts queued log records.
     *
     * Cron tab entry:
     *   0 6 * * * curl -s "https://my.webtrix24.com/API/cron/insurance/dispatch/reminders?cron_secret=SECRET" > /dev/null 2>&1
     */
    public function dispatchReminders()
    {
        $this->_run('reminders');
    }

    /**
     * GET|POST /cron/insurance/dispatch/messages   (every 10–15 min)
     *
     * Dispatches the "send queued messages" wave to all active insurance tenants.
     * Each tenant picks up queued log records and sends WA / Email messages.
     *
     * Cron tab entry:
     *   *\/10 * * * * curl -s "https://my.webtrix24.com/API/cron/insurance/dispatch/messages?cron_secret=SECRET" > /dev/null 2>&1
     */
    public function dispatchMessages()
    {
        $this->_run('messages');
    }

    /**
     * GET|POST /cron/insurance/dispatch   (legacy — runs both waves sequentially)
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

        set_time_limit(0);

        $baseDomain = (string)$this->config->item('tenant_base_domain');
        $cronSecret = (string)($this->config->item('cron_secret') ?? '');
        $batchSize  = max(1, (int)($this->config->item('cron_batch_size') ?? 50));
        $timeoutSec = max(30, (int)($this->config->item('cron_timeout_sec') ?? 120));
        $startedAt  = time();

        $tenantEntries = $this->_loadInsuranceTenants($baseDomain);

        $this->_log('InsuranceCron (full) starting', ['total_tenants' => count($tenantEntries)]);

        $waveResults = [];
        foreach (self::WAVE_PATHS as $waveName => $path) {
            $items = array_map(function ($t) use ($path) {
                return array_merge($t, ['url' => $t['base_url'] . $path]);
            }, $tenantEntries);
            $waveResults[$waveName] = $this->_curlMultiBatch($items, $cronSecret, $batchSize, $timeoutSec);
        }

        $runtimeSec = time() - $startedAt;
        $this->_log('InsuranceCron (full) complete', array_merge(['runtime_sec' => $runtimeSec], $waveResults));

        header('Content-Type: application/json');
        echo json_encode([
            'ok'   => true,
            'data' => [
                'total_tenants' => count($tenantEntries),
                'waves'         => $waveResults,
                'runtime_sec'   => $runtimeSec,
            ],
        ], JSON_PRETTY_PRINT);
    }

    // =========================================================================
    // Shared runner
    // =========================================================================

    /**
     * Authorize, load tenants, run one wave, return JSON.
     *
     * @param string $waveName  Key from WAVE_PATHS ('reminders' or 'messages')
     */
    private function _run(string $waveName)
    {
        if (!$this->_isAuthorized()) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'Unauthorized']);
            return;
        }

        set_time_limit(0);

        $baseDomain = (string)$this->config->item('tenant_base_domain');
        $cronSecret = (string)($this->config->item('cron_secret') ?? '');
        $batchSize  = max(1, (int)($this->config->item('cron_batch_size') ?? 50));
        $timeoutSec = max(30, (int)($this->config->item('cron_timeout_sec') ?? 120));
        $startedAt  = time();

        $path          = self::WAVE_PATHS[$waveName];
        $tenantEntries = $this->_loadInsuranceTenants($baseDomain);

        $this->_log("InsuranceCron [{$waveName}] starting", ['total_tenants' => count($tenantEntries)]);

        $items = array_map(function ($t) use ($path) {
            return array_merge($t, ['url' => $t['base_url'] . $path]);
        }, $tenantEntries);

        $result     = $this->_curlMultiBatch($items, $cronSecret, $batchSize, $timeoutSec);
        $runtimeSec = time() - $startedAt;

        $this->_log("InsuranceCron [{$waveName}] complete", array_merge($result, ['runtime_sec' => $runtimeSec]));

        header('Content-Type: application/json');
        echo json_encode([
            'ok'   => true,
            'data' => array_merge(
                ['total_tenants' => count($tenantEntries), 'wave' => $waveName, 'runtime_sec' => $runtimeSec],
                $result
            ),
        ], JSON_PRETTY_PRINT);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    /**
     * Fetch all active insurance tenants from the central `customer` table.
     *
     * @param  string $baseDomain  e.g. "webtrix24.com"
     * @return array  [['tenant_id', 'name', 'base_url'], ...]
     */
    private function _loadInsuranceTenants(string $baseDomain): array
    {
        $tenants = $this->db
            ->select('customer_id, sub_domain_name, name')
            ->where('account_setup', 'y')
            ->where('status', 'active')
            ->where('crm_type', 'insurance')
            ->where('database_name IS NOT NULL', null, false)
            ->where('database_name !=', '')
            ->where('sub_domain_name IS NOT NULL', null, false)
            ->where('sub_domain_name !=', '')
            ->order_by('customer_id', 'ASC')
            ->get('customer')
            ->result_array();

        $entries = [];
        foreach ($tenants as $t) {
            $entries[] = [
                'tenant_id' => (int)$t['customer_id'],
                'name'      => $t['name'],
                'base_url'  => 'https://' . $t['sub_domain_name'] . '.' . $baseDomain . '/API',
            ];
        }
        return $entries;
    }

    /**
     * Execute a batch of GET requests concurrently via curl_multi.
     *
     * Each request:
     *   - Method: GET
     *   - Header: X-Cron-Key: <cronSecret>  (matches the tenant-side check)
     *   - Timeout: $timeoutSec seconds
     *
     * @param  array  $items       [['tenant_id', 'name', 'url'], ...]
     * @param  string $cronSecret
     * @param  int    $batchSize
     * @param  int    $timeoutSec
     * @return array  ['succeeded', 'failed', 'errors']
     */
    private function _curlMultiBatch(array $items, string $cronSecret, int $batchSize, int $timeoutSec): array
    {
        $succeeded = 0;
        $failed    = 0;
        $errors    = [];

        foreach (array_chunk($items, $batchSize) as $batch) {
            $mh      = curl_multi_init();
            $handles = [];

            $headers = ['Accept: application/json'];
            if ($cronSecret !== '') {
                $headers[] = 'X-Cron-Key: ' . $cronSecret;
            }

            foreach ($batch as $item) {
                $ch = curl_init($item['url']);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HTTPGET        => true,
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

            foreach ($handles as $entry) {
                $ch       = $entry['ch'];
                $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curlErr  = curl_error($ch);

                if ($curlErr !== '' || $httpCode < 200 || $httpCode >= 300) {
                    $failed++;
                    $err = [
                        'tenant_id' => $entry['item']['tenant_id'],
                        'name'      => $entry['item']['name'],
                        'url'       => $entry['item']['url'],
                        'http_code' => $httpCode,
                        'error'     => $curlErr ?: 'HTTP ' . $httpCode,
                    ];
                    $errors[] = $err;
                    $this->_log('Tenant cron failed', $err);
                } else {
                    $succeeded++;
                }

                curl_multi_remove_handle($mh, $ch);
                curl_close($ch);
            }

            curl_multi_close($mh);
        }

        return compact('succeeded', 'failed', 'errors');
    }

    /**
     * Verify the inbound request carries the cron secret.
     *
     * Accepted forms:
     *   - X-Cron-Secret header
     *   - ?cron_secret= query param
     *   - CLI 4th URI segment: php index.php systems/InsuranceCron dispatchMessages <secret>
     *
     * If $config['cron_secret'] is empty, all callers are allowed (dev mode).
     */
    private function _isAuthorized(): bool
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

    /**
     * Append a structured log line to today's insurance cron log file.
     */
    private function _log(string $message, array $context = [])
    {
        $logFile = APPPATH . 'logs/cron_insurance_dispatch_' . date('Y-m-d') . '.log';
        $line    = '[' . date('Y-m-d H:i:s') . '] ' . $message;
        if (!empty($context)) {
            $line .= ' ' . json_encode($context, JSON_UNESCAPED_UNICODE);
        }
        $line .= PHP_EOL;
        @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
    }
}
