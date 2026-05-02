<?php
// Input sanitization helpers

// Strip tags, trim whitespace, limit length
function sanitizeString(mixed $val, int $maxLen = 500): string {
    if (!is_string($val)) return '';
    return mb_substr(trim(strip_tags($val)), 0, $maxLen);
}

// Validate and sanitize email
function sanitizeEmail(mixed $val): string {
    $email = filter_var(trim((string)$val), FILTER_SANITIZE_EMAIL);
    return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';
}

// Validate positive number
function sanitizePositiveNumber(mixed $val): float {
    $n = filter_var($val, FILTER_VALIDATE_FLOAT);
    return ($n !== false && $n > 0) ? $n : 0.0;
}

// Validate positive integer
function sanitizePositiveInt(mixed $val): int {
    $n = filter_var($val, FILTER_VALIDATE_INT);
    return ($n !== false && $n > 0) ? (int)$n : 0;
}

// Validate MongoDB ObjectId format (24 hex chars)
function isValidObjectId(mixed $val): bool {
    return is_string($val) && preg_match('/^[a-f0-9]{24}$/i', $val);
}

// Validate URL — only http/https allowed (blocks javascript: etc.)
function sanitizeUrl(mixed $val, int $maxLen = 2000): string {
    $url = mb_substr(trim((string)$val), 0, $maxLen);
    if (!filter_var($url, FILTER_VALIDATE_URL)) return '';
    $scheme = strtolower(parse_url($url, PHP_URL_SCHEME) ?? '');
    if (!in_array($scheme, ['http', 'https'], true)) return '';
    return $url;
}

// Alphanumeric + common chars only (for TIDs, codes)
function sanitizeAlphanumeric(mixed $val, int $maxLen = 100): string {
    $str = mb_substr(trim((string)$val), 0, $maxLen);
    return preg_replace('/[^a-zA-Z0-9\-_]/', '', $str);
}
