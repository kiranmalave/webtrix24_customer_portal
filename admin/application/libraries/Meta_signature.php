<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Verifies Meta's X-Hub-Signature-256 webhook signature.
 * Must always be checked against the RAW request body — never a re-encoded/re-decoded payload —
 * or a byte-for-byte-different-but-semantically-equal payload would fail verification.
 */
#[\AllowDynamicProperties]
class Meta_signature
{
    private $CI;

    public function __construct()
    {
        $this->CI = &get_instance();
    }

    /**
     * Pure signature check — no CI dependency, so it can be unit tested in isolation.
     *
     * @param string      $rawBody exact bytes of php://input
     * @param string|null $header  value of the X-Hub-Signature-256 header, e.g. "sha256=abcd..."
     * @param string      $secret  app secret used as the HMAC key
     */
    public static function verify(string $rawBody, ?string $header, string $secret): bool
    {
        if (empty($header) || empty($secret) || strpos($header, 'sha256=') !== 0) {
            return false;
        }

        $expectedHash = hash_hmac('sha256', $rawBody, $secret);
        $providedHash = substr($header, strlen('sha256='));

        return hash_equals($expectedHash, $providedHash);
    }

    /**
     * Convenience wrapper for controllers: reads the header + configured secret and verifies
     * the given raw body. Logs and returns false on any failure instead of throwing, so callers
     * can respond 403 and move on without a stack trace reaching Meta's retry logic.
     *
     * @param string $rawBody
     * @param string $secretConfigKey config() key holding the app secret (default FB_APP_SECRET)
     */
    public function verifyRequest(string $rawBody, string $secretConfigKey = 'FB_APP_SECRET'): bool
    {
        $header = $this->CI->input->get_request_header('X-Hub-Signature-256', true);
        $secret = (string) ($this->CI->config->item($secretConfigKey) ?: '');

        if (empty($secret) || $secret === 'REPLACE_WITH_YOUR_APP_SECRET') {
            log_message('error', 'Meta_signature: app secret is not configured — rejecting webhook.');
            return false;
        }

        $valid = self::verify($rawBody, $header, $secret);

        if (!$valid) {
            log_message('error', 'Meta_signature: signature verification failed. Header present: ' . (empty($header) ? 'no' : 'yes'));
        }

        return $valid;
    }
}
