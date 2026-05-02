<?php
// Calls PakFollowers SMM API with retry logic

function callPakfollowersAPI(array $data, int $retries = 3): array {
    $url = $_ENV['PAKFOLLOWERS_API_URL'] ?? '';
    $key = $_ENV['PAKFOLLOWERS_API_KEY'] ?? '';

    if (!$url || !$key) {
        throw new RuntimeException('Pakfollowers API credentials missing in .env');
    }

    $data['key'] = $key;
    $body = http_build_query($data);

    $lastError = 'Unknown error';

    for ($attempt = 1; $attempt <= $retries; $attempt++) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST              => true,
            CURLOPT_POSTFIELDS        => $body,
            CURLOPT_RETURNTRANSFER    => true,
            CURLOPT_TIMEOUT           => 15,
            CURLOPT_CONNECTTIMEOUT    => 10,
            CURLOPT_HTTPHEADER        => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_SSL_VERIFYPEER    => false,   // required on many shared hosts / XAMPP
            CURLOPT_SSL_VERIFYHOST    => false,
            CURLOPT_FOLLOWLOCATION    => true,
            CURLOPT_MAXREDIRS         => 3,
            CURLOPT_USERAGENT         => 'GetReach/1.0',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        // cURL transport error — retry
        if ($response === false) {
            $lastError = $curlErr ?: 'cURL transport error';
            if ($attempt < $retries) usleep(500000 * $attempt);
            continue;
        }

        // Got a response — try to decode
        $decoded = json_decode($response, true);

        if ($decoded !== null) {
            return $decoded;
        }

        // JSON decode failed — log raw response for debugging
        $lastError = "JSON decode failed (HTTP $httpCode). Raw: " . substr($response, 0, 300);

        // Don't retry on non-200 or bad JSON — it won't change
        if ($httpCode !== 200) {
            throw new RuntimeException("Pakfollowers API returned HTTP $httpCode: " . substr($response, 0, 200));
        }

        if ($attempt < $retries) usleep(500000 * $attempt);
    }

    throw new RuntimeException("Pakfollowers API failed after $retries attempts: $lastError");
}
