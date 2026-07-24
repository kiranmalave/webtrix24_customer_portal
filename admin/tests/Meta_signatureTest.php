<?php

use PHPUnit\Framework\TestCase;

final class Meta_signatureTest extends TestCase
{
    private const SECRET = 'test-app-secret';

    private function sign(string $body, string $secret = self::SECRET): string
    {
        return 'sha256=' . hash_hmac('sha256', $body, $secret);
    }

    public function testValidSignaturePasses(): void
    {
        $body = json_encode(['object' => 'page', 'entry' => [['id' => '123']]]);
        $header = $this->sign($body);

        $this->assertTrue(Meta_signature::verify($body, $header, self::SECRET));
    }

    public function testTamperedBodyFails(): void
    {
        $original = json_encode(['object' => 'page', 'entry' => [['id' => '123']]]);
        $header = $this->sign($original);

        $tampered = json_encode(['object' => 'page', 'entry' => [['id' => '999']]]);

        $this->assertFalse(Meta_signature::verify($tampered, $header, self::SECRET));
    }

    public function testWrongSecretFails(): void
    {
        $body = json_encode(['object' => 'page', 'entry' => []]);
        $header = $this->sign($body, 'a-different-secret');

        $this->assertFalse(Meta_signature::verify($body, $header, self::SECRET));
    }

    public function testMissingHeaderFails(): void
    {
        $body = json_encode(['object' => 'page', 'entry' => []]);

        $this->assertFalse(Meta_signature::verify($body, null, self::SECRET));
        $this->assertFalse(Meta_signature::verify($body, '', self::SECRET));
    }

    public function testMissingSecretFails(): void
    {
        $body = json_encode(['object' => 'page', 'entry' => []]);
        $header = $this->sign($body);

        $this->assertFalse(Meta_signature::verify($body, $header, ''));
    }

    public function testHeaderWithoutSha256PrefixFails(): void
    {
        $body = json_encode(['object' => 'page', 'entry' => []]);
        $rawHash = hash_hmac('sha256', $body, self::SECRET);

        $this->assertFalse(Meta_signature::verify($body, $rawHash, self::SECRET));
    }

    public function testDuplicateDeliveryWithSameBodyStillVerifies(): void
    {
        // Meta retries webhooks verbatim — the same body + same signature must keep verifying true
        // so the idempotency check further downstream (dedupe_key) is what stops the duplicate,
        // not a signature false-negative.
        $body = json_encode(['object' => 'page', 'entry' => [['id' => 'retry-me']]]);
        $header = $this->sign($body);

        $this->assertTrue(Meta_signature::verify($body, $header, self::SECRET));
        $this->assertTrue(Meta_signature::verify($body, $header, self::SECRET));
    }
}
