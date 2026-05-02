<?php
// Order routes — MySQL version

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/sanitize.php';
require_once __DIR__ . '/../utils/pakfollowers.php';

$MARKUP   = (float)($_ENV['MARKUP_MULTIPLIER'] ?? 1.0);
$CACHE_TTL = 10 * 60;

// ── GET /api/orders/balance ─────────────────────────────────────────────────
function handleGetBalance(): void {
    try {
        jsonResponse(callPakfollowersAPI(['action' => 'balance']));
    } catch (Exception $e) {
        jsonError($e->getMessage(), 500);
    }
}

// ── GET /api/orders/services ────────────────────────────────────────────────
function handleGetServices(): void {
    global $MARKUP;

    if (function_exists('apcu_fetch')) {
        $cached = apcu_fetch('services_cache', $ok);
        if ($ok) jsonResponse($cached);
    }

    try {
        $rawData = callPakfollowersAPI(['action' => 'services']);
        $db      = getDB();
        $stmt    = $db->query('SELECT * FROM service_overrides WHERE hidden = 0');
        $overrides = $stmt->fetchAll();

        // Build overrides map
        $ovMap = [];
        foreach ($overrides as $ov) $ovMap[$ov['service_id']] = $ov;

        $result = [];
        if (is_array($rawData)) {
            foreach ($rawData as $s) {
                $sid      = (string)($s['service'] ?? '');
                $ov       = $ovMap[$sid] ?? [];

                // Skip if explicitly hidden via override
                if (!empty($ov) && !empty($ov['hidden'])) continue;

                $baseRate = (float)($s['rate'] ?? 0) * $MARKUP * 315;
                $entry    = [
                    'service'  => $sid,
                    'name'     => $ov['name']     ?? ($s['name']     ?? null),
                    'category' => $ov['category'] ?? ($s['category'] ?? null),
                    'rate'     => $ov['rate']      ?? number_format($baseRate, 2, '.', ''),
                    'min'      => $ov['min_qty']   ?? ($s['min']      ?? null),
                    'max'      => $ov['max_qty']   ?? ($s['max']      ?? null),
                    '_apiRate' => (float)($s['rate'] ?? 0),
                ];
                if ($entry['name']) $result[] = $entry;
            }
        }

        if (function_exists('apcu_store')) apcu_store('services_cache', $result, $CACHE_TTL);
        jsonResponse($result);
    } catch (Exception $e) {
        jsonError($e->getMessage(), 500);
    }
}

// ── POST /api/orders/place-order ────────────────────────────────────────────
function handlePlaceOrder(): void {
    global $MARKUP;
    $body      = getBody();
    $userId    = $body['userId']    ?? '';
    $serviceId = sanitizeString($body['serviceId'] ?? '', 50);
    $link      = sanitizeUrl($body['link']         ?? '');
    $quantity  = sanitizePositiveInt($body['quantity'] ?? 0);

    if (!$userId || !$serviceId || !$link || !$quantity)
        jsonError('Missing or invalid required fields', 400);

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) jsonError('User not found', 404);

    // Get services from cache or API
    $services = null;
    if (function_exists('apcu_fetch')) {
        $services = apcu_fetch('services_cache', $ok) ?: null;
    }
    if (!$services) {
        try { $services = callPakfollowersAPI(['action' => 'services']); } catch (Exception $e) {}
    }

    $service = null;
    if (is_array($services)) {
        foreach ($services as $s) {
            if ((string)($s['service'] ?? '') === (string)$serviceId) { $service = $s; break; }
        }
    }
    if (!$service) jsonError('Invalid service ID', 400);

    $ratePerUnit  = (float)($service['rate'] ?? 0) / 1000;
    $apiRateUSD   = (float)($service['_apiRate'] ?? 0);
    $apiCost      = ($apiRateUSD / 1000) * $quantity;
    $chargeToUser = $ratePerUnit * $quantity;

    if ((float)$user['balance'] < $chargeToUser)
        jsonError('Insufficient internal balance', 400);

    try {
        $apiRes = callPakfollowersAPI([
            'action'   => 'add',
            'service'  => $serviceId,
            'link'     => $link,
            'quantity' => $quantity,
        ]);
    } catch (Exception $e) {
        jsonError('API Error: ' . $e->getMessage(), 500);
    }

    if (!empty($apiRes['error'])) jsonError('API Error: ' . $apiRes['error'], 400);

    // Deduct balance
    $db->prepare('UPDATE users SET balance = balance - ? WHERE id = ?')
       ->execute([$chargeToUser, $userId]);

    $stmt = $db->prepare('INSERT INTO orders (user_id, service_id, service_name, link, quantity, price, api_cost, api_order_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $userId,
        $serviceId,
        $service['name'] ?? '',
        $link,
        $quantity,
        $chargeToUser,
        $apiCost,
        (string)($apiRes['order'] ?? ''),
        'pending',
    ]);
    $orderId = $db->lastInsertId();

    $newBalance = (float)$user['balance'] - $chargeToUser;
    $order = fetchOrder($db, $orderId);

    jsonResponse(['success' => true, 'order' => $order, 'newBalance' => $newBalance]);
}

// ── GET /api/orders/order-status/:orderId ───────────────────────────────────
function handleOrderStatus(string $orderId): void {
    $db    = getDB();
    $order = fetchOrder($db, $orderId);
    if (!$order) jsonError('Order not found', 404);
    if (empty($order['apiOrderId'])) jsonError('Order has no API reference ID', 400);

    try {
        $apiRes = callPakfollowersAPI(['action' => 'status', 'order' => $order['apiOrderId']]);
    } catch (Exception $e) {
        jsonError('API Error: ' . $e->getMessage(), 400);
    }

    if (!empty($apiRes['error'])) jsonError('API Error: ' . $apiRes['error'], 400);

    $newStatus = strtolower($apiRes['status'] ?? '');
    if ($newStatus && $newStatus !== strtolower($order['status'])) {
        $db->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$newStatus, $orderId]);
    }

    jsonResponse(['success' => true, 'apiStatus' => $apiRes]);
}

// ── GET /api/orders/all ─────────────────────────────────────────────────────
function handleGetAllOrders(): void {
    requireAdmin();
    $db   = getDB();
    $stmt = $db->query('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 100');
    $rows = $stmt->fetchAll();
    $out  = array_map(fn($o) => serializeOrderRow($o), $rows);
    jsonResponse($out);
}

// ── GET /api/orders/user/:userId ────────────────────────────────────────────
function handleGetUserOrders(string $userId): void {
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();
    jsonResponse(array_map(fn($o) => serializeOrderRow($o), $rows));
}

// ── POST /api/orders/cancel/:orderId ────────────────────────────────────────
function handleCancelOrder(string $orderId): void {
    $db    = getDB();
    $order = fetchOrder($db, $orderId);
    if (!$order) jsonError('Order not found', 404);

    $terminal = ['completed', 'partial', 'cancelled', 'refunded'];
    if (in_array(strtolower($order['status']), $terminal))
        jsonError('Order cannot be cancelled at this stage.', 400);

    // Call PakFollowers API to cancel the order
    $apiMessage = null;
    if (!empty($order['apiOrderId'])) {
        try {
            $apiRes = callPakfollowersAPI(['action' => 'cancel', 'order' => $order['apiOrderId']]);
            if (!empty($apiRes['error'])) {
                jsonError('API Error: ' . $apiRes['error'], 400);
            }
            $apiMessage = $apiRes['message'] ?? null;
        } catch (Exception $e) {
            jsonError('API Error: ' . $e->getMessage(), 500);
        }
    }

    $db->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute(['cancelled', $orderId]);
    $response = ['success' => true, 'order' => fetchOrder($db, $orderId)];
    if ($apiMessage) $response['message'] = $apiMessage;
    jsonResponse($response);
}

// ── POST /api/orders/refill/:orderId ─────────────────────────────────────────
function handleRefillOrder(string $orderId): void {
    $db    = getDB();
    $order = fetchOrder($db, $orderId);
    if (!$order) jsonError('Order not found', 404);

    if (empty($order['apiOrderId']))
        jsonError('Order has no API reference ID', 400);

    // Only completed or partial orders can be refilled
    $refillable = ['completed', 'partial'];
    if (!in_array(strtolower($order['status']), $refillable))
        jsonError('Only completed or partial orders are eligible for refill.', 400);

    try {
        $apiRes = callPakfollowersAPI(['action' => 'refill', 'order' => $order['apiOrderId']]);
    } catch (Exception $e) {
        jsonError('API Error: ' . $e->getMessage(), 500);
    }

    if (!empty($apiRes['error'])) jsonError('API Error: ' . $apiRes['error'], 400);

    jsonResponse([
        'success' => true,
        'message' => $apiRes['message'] ?? 'Refill request submitted successfully.',
        'order'   => $order,
    ]);
}

// ── GET /api/orders/admin/services ──────────────────────────────────────────
function handleAdminGetServices(): void {
    global $MARKUP;
    requireAdmin();
    try {
        $rawData = callPakfollowersAPI(['action' => 'services']);

        // API returned an error object instead of a list
        if (!empty($rawData['error'])) {
            jsonError('PakFollowers API error: ' . $rawData['error'], 502);
        }

        // API returned empty or non-array
        if (!is_array($rawData) || empty($rawData)) {
            jsonError('PakFollowers API returned no services. Check API key and URL in .env', 502);
        }

        // If the first element has an 'error' key it's a wrapped error
        if (isset($rawData[0]) && !isset($rawData[0]['service'])) {
            jsonError('Unexpected API response format: ' . json_encode(array_slice($rawData, 0, 2)), 502);
        }

        $db      = getDB();
        $stmt    = $db->query('SELECT * FROM service_overrides');
        $ovRows  = $stmt->fetchAll();
        $ovMap   = [];
        foreach ($ovRows as $o) $ovMap[$o['service_id']] = $o;

        $PKR    = 315;
        $merged = [];
        foreach ($rawData as $s) {
            if (!isset($s['service'])) continue; // skip malformed entries
            $sid = (string)$s['service'];
            $ov  = $ovMap[$sid] ?? [];
            $merged[] = [
                'service'      => $sid,
                '_rawName'     => $s['name']     ?? '',
                '_rawCategory' => $s['category'] ?? '',
                '_rawRate'     => number_format((float)($s['rate'] ?? 0) * $MARKUP * $PKR, 2, '.', ''),
                '_rawMin'      => $s['min']  ?? null,
                '_rawMax'      => $s['max']  ?? null,
                '_apiRate'     => (float)($s['rate'] ?? 0),
                'name'         => $ov['name']     ?? ($s['name']     ?? ''),
                'category'     => $ov['category'] ?? ($s['category'] ?? ''),
                'displayRate'  => $ov['rate']     ?? number_format((float)($s['rate'] ?? 0) * $MARKUP * $PKR, 2, '.', ''),
                'min'          => $ov['min_qty']  ?? ($s['min'] ?? null),
                'max'          => $ov['max_qty']  ?? ($s['max'] ?? null),
                'hidden'       => (bool)($ov['hidden'] ?? false),
                '_hasOverride' => !empty($ovMap[$sid]),
            ];
        }
        jsonResponse($merged);
    } catch (Exception $e) {
        jsonError($e->getMessage(), 500);
    }
}

// ── PUT /api/orders/admin/services/:serviceId ────────────────────────────────
function handleAdminSaveServiceOverride(string $serviceId): void {
    requireAdmin();
    $body = getBody();
    $db   = getDB();

    $fields = ['name', 'category', 'rate', 'min_qty' => 'min', 'max_qty' => 'max', 'hidden'];
    $set    = [];
    $vals   = [];

    if (array_key_exists('name',     $body)) { $set[] = 'name = ?';     $vals[] = sanitizeString($body['name'], 255); }
    if (array_key_exists('category', $body)) { $set[] = 'category = ?'; $vals[] = sanitizeString($body['category'], 100); }
    if (array_key_exists('rate',     $body)) { $set[] = 'rate = ?';     $vals[] = (float)$body['rate']; }
    if (array_key_exists('min',      $body)) { $set[] = 'min_qty = ?';  $vals[] = (int)$body['min']; }
    if (array_key_exists('max',      $body)) { $set[] = 'max_qty = ?';  $vals[] = (int)$body['max']; }
    if (array_key_exists('hidden',   $body)) { $set[] = 'hidden = ?';   $vals[] = $body['hidden'] ? 1 : 0; }

    // Check if exists
    $exists = $db->prepare('SELECT id FROM service_overrides WHERE service_id = ?');
    $exists->execute([$serviceId]);

    if ($exists->fetch()) {
        if (!empty($set)) {
            $vals[] = $serviceId;
            $db->prepare('UPDATE service_overrides SET ' . implode(', ', $set) . ' WHERE service_id = ?')->execute($vals);
        }
    } else {
        $vals[] = $serviceId;
        $db->prepare('INSERT INTO service_overrides (' . implode(', ', array_map(fn($s) => explode(' =', $s)[0], $set)) . ', service_id) VALUES (' . implode(', ', array_fill(0, count($vals), '?')) . ')')->execute($vals);
    }

    if (function_exists('apcu_delete')) apcu_delete('services_cache');

    $row = $db->prepare('SELECT * FROM service_overrides WHERE service_id = ?');
    $row->execute([$serviceId]);
    jsonResponse(['success' => true, 'override' => serializeOverrideRow($row->fetch())]);
}

// ── DELETE /api/orders/admin/services/:serviceId ─────────────────────────────
function handleAdminDeleteServiceOverride(string $serviceId): void {
    requireAdmin();
    $db = getDB();
    $db->prepare('DELETE FROM service_overrides WHERE service_id = ?')->execute([$serviceId]);
    if (function_exists('apcu_delete')) apcu_delete('services_cache');
    jsonResponse(['success' => true]);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fetchOrder(PDO $db, string|int $id): ?array {
    $stmt = $db->prepare('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? serializeOrderRow($row) : null;
}

function serializeOrderRow(array $o): array {
    $out = [
        '_id'         => $o['id'],
        'id'          => $o['id'],
        'serviceId'   => $o['service_id']   ?? '',
        'serviceName' => $o['service_name'] ?? '',
        'link'        => $o['link']         ?? '',
        'quantity'    => (int)($o['quantity'] ?? 0),
        'price'       => (float)($o['price']   ?? 0),
        'apiCost'     => (float)($o['api_cost'] ?? 0),
        'apiOrderId'  => $o['api_order_id'] ?? '',
        'status'      => $o['status']       ?? 'pending',
        'created'     => $o['created_at']   ?? null,
        'updatedAt'   => $o['updated_at']   ?? null,
    ];
    if (isset($o['user_name'])) {
        $out['userId'] = ['_id' => $o['user_id'], 'name' => $o['user_name'], 'email' => $o['user_email']];
    } else {
        $out['userId'] = $o['user_id'] ?? null;
    }
    return $out;
}

function serializeOverrideRow(array $o): array {
    return [
        '_id'       => $o['id'],
        'serviceId' => $o['service_id'] ?? '',
        'name'      => $o['name']       ?? null,
        'category'  => $o['category']   ?? null,
        'rate'      => $o['rate']       ?? null,
        'min'       => $o['min_qty']    ?? null,
        'max'       => $o['max_qty']    ?? null,
        'hidden'    => (bool)($o['hidden'] ?? false),
    ];
}
