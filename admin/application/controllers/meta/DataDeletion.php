<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Meta's required Data Deletion Request Callback — registered once in the Meta App Dashboard
 * (Settings > Basic > Data Deletion Request URL), not per-tenant.
 *
 * Important scope note: this app does not store any data keyed by a connecting user's personal
 * Facebook user_id — only by Page ID / Instagram Business Account ID / access tokens for those
 * assets (see ab_fb_pages, and each tenant's meta_connections). So there is nothing indexed by
 * the requester's own user_id to actually delete today. This endpoint still does everything
 * Meta requires: verifies the signed request, logs it for audit/compliance, and returns a valid
 * confirmation + status URL. If a future feature stores anything keyed by a personal FB user_id,
 * add the actual deletion there and update the log's status accordingly.
 */
class DataDeletion extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->model('CommonModel');
    }

    /** POST /API/facebook/data-deletion — Meta calls this with a signed_request param */
    public function callback()
    {
        header('Content-Type: application/json');

        $signedRequest = $this->input->post('signed_request');
        if (empty($signedRequest)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing signed_request']);
            return;
        }

        $appSecret = (string) ($this->config->item('FB_APP_SECRET') ?: '');
        $data = $this->_parseSignedRequest($signedRequest, $appSecret);

        if ($data === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid signed_request']);
            return;
        }

        $fbUserId = $data['user_id'] ?? null;
        $confirmationCode = bin2hex(random_bytes(16));

        $this->CommonModel->saveMasterDetails('fb_data_deletion_requests', [
            'fb_user_id'         => $fbUserId,
            'confirmation_code'  => $confirmationCode,
            'status'             => 'completed', // nothing indexed by personal user_id to delete — see class docblock
            'raw_signed_request' => $signedRequest,
            'created_date'       => date('Y-m-d H:i:s'),
        ]);

        log_message('info', "DataDeletion: request received for fb_user_id={$fbUserId}, code={$confirmationCode}");

        echo json_encode([
            'url'               => site_url("facebook/data-deletion-status?id={$confirmationCode}"),
            'confirmation_code' => $confirmationCode,
        ]);
    }

    /** GET /API/facebook/data-deletion-status?id=... — public status page shown to the requesting user */
    public function status()
    {
        $code = $this->input->get('id');
        $row  = !empty($code)
            ? $this->CommonModel->getMasterDetails('fb_data_deletion_requests', 'confirmation_code,status,created_date', ['confirmation_code' => $code])
            : [];

        header('Content-Type: text/html; charset=UTF-8');

        if (empty($row)) {
            http_response_code(404);
            echo '<p>No deletion request found for this confirmation code.</p>';
            return;
        }

        echo '<p>Deletion request <strong>' . htmlspecialchars($row[0]->confirmation_code, ENT_QUOTES, 'UTF-8') . '</strong> — status: '
            . htmlspecialchars($row[0]->status, ENT_QUOTES, 'UTF-8') . ' (received ' . htmlspecialchars($row[0]->created_date, ENT_QUOTES, 'UTF-8') . ').</p>';
    }

    /**
     * Meta's documented signed_request verification: base64url(sig).base64url(json_payload),
     * signature is HMAC-SHA256 of the payload segment, keyed with the app secret.
     */
    private function _parseSignedRequest(string $signedRequest, string $secret): ?array
    {
        if (empty($secret)) {
            log_message('error', 'DataDeletion: FB_APP_SECRET is not configured — cannot verify signed_request.');
            return null;
        }

        $parts = explode('.', $signedRequest, 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$encodedSig, $payload] = $parts;

        $sig  = $this->_base64UrlDecode($encodedSig);
        $data = json_decode($this->_base64UrlDecode($payload), true);

        if (!is_array($data) || strtoupper($data['algorithm'] ?? '') !== 'HMAC-SHA256') {
            log_message('error', 'DataDeletion: missing/unsupported algorithm in signed_request.');
            return null;
        }

        $expectedSig = hash_hmac('sha256', $payload, $secret, true);

        if (!hash_equals($expectedSig, $sig)) {
            log_message('error', 'DataDeletion: signature verification failed.');
            return null;
        }

        return $data;
    }

    private function _base64UrlDecode(string $input): string
    {
        return (string) base64_decode(strtr($input, '-_', '+/'), true);
    }
}
