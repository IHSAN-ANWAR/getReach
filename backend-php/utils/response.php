<?php
// JSON response helpers

function jsonResponse(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function jsonError(string $message, int $status = 400): never {
    jsonResponse(['error' => $message], $status);
}

function getBody(): array {
    static $body = null;
    if ($body === null) {
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true) ?? [];
    }
    return $body;
}

function getQuery(): array {
    return $_GET;
}
