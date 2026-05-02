<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../utils/response.php';

function requireAuth(): array {
    // Apache/shared hosting may strip Authorization header
    // Check multiple sources: header, X-Auth-Token, cookie, query param
    $header = $_SERVER['HTTP_AUTHORIZATION']
           ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
           ?? (function_exists('apache_request_headers') ? (apache_request_headers()['Authorization'] ?? '') : '')
           ?? '';

    // Fallback: X-Auth-Token header (not stripped by most hosts)
    if (!$header && !empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $header = 'Bearer ' . $_SERVER['HTTP_X_AUTH_TOKEN'];
    }

    // Fallback: token in query string ?token=xxx
    if (!$header && !empty($_GET['token'])) {
        $header = 'Bearer ' . $_GET['token'];
    }

    // Fallback: token in cookie
    if (!$header && !empty($_COOKIE['gr_token'])) {
        $header = 'Bearer ' . $_COOKIE['gr_token'];
    }

    if (!str_starts_with($header, 'Bearer '))
        jsonError('Unauthorized', 401);

    $token   = substr($header, 7);
    $secret  = $_ENV['JWT_SECRET'] ?? 'getReach_secret';
    $payload = jwtDecode($token, $secret);
    if (!$payload) jsonError('Invalid or expired token', 401);
    return $payload;
}

function requireAdmin(): array {
    $payload = requireAuth();
    if (($payload['role'] ?? '') !== 'admin')
        jsonError('Admin access required', 403);
    return $payload;
}
