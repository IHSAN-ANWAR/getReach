<?php
// GetReach PHP Backend — main entry point
// Requires: PHP 8.1+, PDO MySQL extension, PHPMailer (via composer)

declare(strict_types=1);

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/utils/response.php';
require_once __DIR__ . '/utils/sanitize.php';
require_once __DIR__ . '/utils/ratelimit.php';
require_once __DIR__ . '/utils/pakfollowers.php';
require_once __DIR__ . '/utils/email.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/users.php';
require_once __DIR__ . '/routes/orders.php';
require_once __DIR__ . '/routes/fund_requests.php';
require_once __DIR__ . '/routes/tickets.php';
require_once __DIR__ . '/routes/admin.php';

// ── CORS ─────────────────────────────────────────────────────────────────────
$allowedOrigins = array_filter(array_map('trim', explode(',',
    $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173'
)));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true) || empty($allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: ' . ($allowedOrigins[0] ?? ''));
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Remove PHP fingerprint
header_remove('X-Powered-By');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Router ────────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');

// Strip base path if deployed in a subdirectory (e.g. /backend-php)
$base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
if ($base && str_starts_with($uri, $base)) {
    $uri = substr($uri, strlen($base));
}
$uri = $uri ?: '/';

// ── Health check ──────────────────────────────────────────────────────────────
if ($uri === '/health' && $method === 'GET') {
    jsonResponse(['status' => 'ok']);
}

// ── Debug: token verify ───────────────────────────────────────────────────────
if ($uri === '/debug/token' && $method === 'GET') {
    $h1 = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    $h2 = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    $h3 = function_exists('apache_request_headers') ? (apache_request_headers()['Authorization'] ?? null) : null;
    $header = $h1 ?? $h2 ?? $h3 ?? 'NO_HEADER';
    $secret  = $_ENV['JWT_SECRET'] ?? 'NOT_SET';
    $token   = str_starts_with($header, 'Bearer ') ? substr($header, 7) : null;
    $decoded = $token ? jwtDecode($token, $secret) : null;
    jsonResponse([
        'HTTP_AUTHORIZATION'          => $h1,
        'REDIRECT_HTTP_AUTHORIZATION' => $h2,
        'apache_request_headers'      => $h3,
        'header_used'   => $header,
        'secret_set'    => !empty($_ENV['JWT_SECRET']),
        'token_found'   => !is_null($token),
        'decoded'       => $decoded,
    ]);
}

// ── Debug: test pakfollowers API directly ─────────────────────────────────────
if ($uri === '/debug/api-test' && $method === 'GET') {
    try {
        $result = callPakfollowersAPI(['action' => 'balance']);
        jsonResponse(['status' => 'ok', 'response' => $result]);
    } catch (Exception $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// ── Debug: check admin env vars ───────────────────────────────────────────────
if ($uri === '/debug/admin-env' && $method === 'GET') {
    $user = $_ENV['ADMIN_USERNAME'] ?? 'NOT_SET';
    $pass = $_ENV['ADMIN_PASSWORD'] ?? 'NOT_SET';
    jsonResponse([
        'username'      => $user,
        'username_len'  => strlen($user),
        'password_len'  => strlen($pass),
        'password_first3' => substr($pass, 0, 3),
        'password_last3'  => substr($pass, -3),
    ]);
}

// ── Debug: test services fetch ────────────────────────────────────────────────
if ($uri === '/debug/services-test' && $method === 'GET') {
    try {
        $result = callPakfollowersAPI(['action' => 'services']);
        jsonResponse([
            'status'       => 'ok',
            'is_array'     => is_array($result),
            'count'        => is_array($result) ? count($result) : 0,
            'first_item'   => is_array($result) && !empty($result) ? $result[0] : null,
            'raw_error'    => $result['error'] ?? null,
        ]);
    } catch (Exception $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// ── Auth routes ───────────────────────────────────────────────────────────────
if ($uri === '/api/register'         && $method === 'POST') { /* rateLimit('register', 10, 3600); */ handleRegister();        }
if ($uri === '/api/login'            && $method === 'POST') { /* rateLimit('login', 10, 900); */     handleLogin();           }
if ($uri === '/api/admin-auth'       && $method === 'POST') { /* rateLimit('admin-auth', 5, 900); */ handleAdminAuth();       }
if ($uri === '/api/forgot-password'  && $method === 'POST') { /* rateLimit('forgot-pw', 5, 3600); */ handleForgotPassword();  }
if ($uri === '/api/reset-password'   && $method === 'POST') { /* rateLimit('reset-pw', 5, 3600); */  handleResetPassword();   }

// ── User routes ───────────────────────────────────────────────────────────────
if ($uri === '/api/users' && $method === 'GET') { handleGetUsers(); }

if (preg_match('#^/api/users/([^/]+)/reset-password$#', $uri, $m) && $method === 'PATCH') {
    handleAdminResetPassword($m[1]);
}
if (preg_match('#^/api/users/([^/]+)/add-balance$#', $uri, $m) && $method === 'PATCH') {
    handleAddBalance($m[1]);
}

// ── Order routes ──────────────────────────────────────────────────────────────
if ($uri === '/api/orders/balance'       && $method === 'GET')  { handleGetBalance();    }
if ($uri === '/api/orders/services'      && $method === 'GET')  { handleGetServices();   }
if ($uri === '/api/orders/place-order'   && $method === 'POST') { handlePlaceOrder();    }
if ($uri === '/api/orders/all'           && $method === 'GET')  { handleGetAllOrders();  }
if ($uri === '/api/orders/admin/services'&& $method === 'GET')  { handleAdminGetServices(); }

if (preg_match('#^/api/orders/order-status/([^/]+)$#', $uri, $m) && $method === 'GET') {
    handleOrderStatus($m[1]);
}
if (preg_match('#^/api/orders/user/([^/]+)$#', $uri, $m) && $method === 'GET') {
    handleGetUserOrders($m[1]);
}
if (preg_match('#^/api/orders/cancel/([^/]+)$#', $uri, $m) && $method === 'POST') {
    handleCancelOrder($m[1]);
}
if (preg_match('#^/api/orders/refill/([^/]+)$#', $uri, $m) && $method === 'POST') {
    handleRefillOrder($m[1]);
}
if (preg_match('#^/api/orders/admin/services/([^/]+)$#', $uri, $m)) {
    if ($method === 'PUT')    { handleAdminSaveServiceOverride($m[1]); }
    if ($method === 'DELETE') { handleAdminDeleteServiceOverride($m[1]); }
}

// ── Fund request routes ───────────────────────────────────────────────────────
if ($uri === '/api/fund-requests' && $method === 'POST') { handleCreateFundRequest();   }
if ($uri === '/api/fund-requests' && $method === 'GET')  { handleGetAllFundRequests();  }

if (preg_match('#^/api/fund-requests/user/([^/]+)$#', $uri, $m) && $method === 'GET') {
    handleGetUserFundRequests($m[1]);
}
if (preg_match('#^/api/fund-requests/([^/]+)$#', $uri, $m) && $method === 'PATCH') {
    handleUpdateFundRequest($m[1]);
}

// ── Ticket routes ─────────────────────────────────────────────────────────────
if ($uri === '/api/tickets' && $method === 'POST') { handleCreateTicket(); }
if ($uri === '/api/tickets' && $method === 'GET')  { handleGetTickets();   }

if (preg_match('#^/api/tickets/([^/]+)$#', $uri, $m) && $method === 'PATCH') {
    handleUpdateTicket($m[1]);
}

// ── Admin routes ──────────────────────────────────────────────────────────────
if ($uri === '/api/admin/stats'   && $method === 'GET') { handleAdminStats();   }
if ($uri === '/api/admin/revenue' && $method === 'GET') { handleAdminRevenue(); }

// ── 404 ───────────────────────────────────────────────────────────────────────
jsonError('Not found', 404);
