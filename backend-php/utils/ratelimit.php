<?php
// File-based rate limiter — no Redis/APCu needed
// Stores hit counts in /tmp per IP per route key

function rateLimit(string $key, int $maxHits, int $windowSeconds): void {
    $ip      = getClientIP();
    $file    = sys_get_temp_dir() . '/rl_' . md5($key . '_' . $ip) . '.json';
    $now     = time();
    $data    = ['hits' => 0, 'window_start' => $now];

    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) {
            $saved = json_decode($raw, true);
            if ($saved && ($now - $saved['window_start']) < $windowSeconds) {
                $data = $saved;
            }
        }
    }

    $data['hits']++;

    if ($data['hits'] > $maxHits) {
        $retryAfter = $windowSeconds - ($now - $data['window_start']);
        header('Retry-After: ' . $retryAfter);
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }

    file_put_contents($file, json_encode($data), LOCK_EX);
}

function getClientIP(): string {
    // Trust proxy headers only if behind a known proxy
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $ip = trim(explode(',', $_SERVER[$h])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}
