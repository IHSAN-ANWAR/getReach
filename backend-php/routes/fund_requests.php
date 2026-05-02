<?php
// Fund request routes — MySQL version

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/sanitize.php';

// ── POST /api/fund-requests ─────────────────────────────────────────────────
function handleCreateFundRequest(): void {
    $body   = getBody();
    $userId = $body['userId'] ?? '';
    $method = sanitizeString($body['method'] ?? '', 50);
    $amount = sanitizePositiveNumber($body['amount'] ?? 0);
    $tid    = sanitizeAlphanumeric($body['tid'] ?? '', 100);

    if (!$userId || !$method || !$amount || !$tid)
        jsonError('All fields required.', 400);

    $db   = getDB();
    $stmt = $db->prepare('SELECT id, role FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) jsonError('User not found.', 404);
    if ($user['role'] === 'admin') jsonError('Admin accounts cannot submit fund requests.', 403);
    if ($amount < 50) jsonError('Minimum deposit is Rs 50.', 400);

    $dup = $db->prepare('SELECT id FROM fund_requests WHERE tid = ? LIMIT 1');
    $dup->execute([$tid]);
    if ($dup->fetch()) jsonError('This Transaction ID has already been submitted.', 400);

    $ins = $db->prepare('INSERT INTO fund_requests (user_id, method, amount, tid, status, note) VALUES (?, ?, ?, ?, ?, ?)');
    $ins->execute([$userId, $method, $amount, $tid, 'pending', '']);
    $id = $db->lastInsertId();

    jsonResponse(fetchFR($db, $id), 201);
}

// ── GET /api/fund-requests/user/:userId ─────────────────────────────────────
function handleGetUserFundRequests(string $userId): void {
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM fund_requests WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$userId]);
    jsonResponse(array_map(fn($r) => serializeFRRow($r), $stmt->fetchAll()));
}

// ── GET /api/fund-requests ──────────────────────────────────────────────────
function handleGetAllFundRequests(): void {
    requireAdmin();
    $db   = getDB();
    $stmt = $db->query('SELECT fr.*, u.name as user_name, u.email as user_email, u.balance as user_balance FROM fund_requests fr LEFT JOIN users u ON fr.user_id = u.id ORDER BY fr.created_at DESC');
    $rows = $stmt->fetchAll();
    $out  = [];
    foreach ($rows as $r) {
        $row = serializeFRRow($r);
        $row['userId'] = [
            '_id'     => $r['user_id'],
            'name'    => $r['user_name']    ?? '',
            'email'   => $r['user_email']   ?? '',
            'balance' => (float)($r['user_balance'] ?? 0),
        ];
        $out[] = $row;
    }
    jsonResponse($out);
}

// ── PATCH /api/fund-requests/:id ────────────────────────────────────────────
function handleUpdateFundRequest(string $id): void {
    requireAdmin();
    $body   = getBody();
    $status = $body['status'] ?? '';
    $note   = sanitizeString($body['note'] ?? '', 500);

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM fund_requests WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $fr = $stmt->fetch();

    if (!$fr) jsonError('Request not found.', 404);
    if ($fr['status'] !== 'pending') jsonError('Already processed.', 400);

    $db->prepare('UPDATE fund_requests SET status = ?, note = ? WHERE id = ?')
       ->execute([$status, $note, $id]);

    if ($status === 'approved') {
        $db->prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
           ->execute([(float)$fr['amount'], $fr['user_id']]);
    }

    jsonResponse(['success' => true, 'request' => fetchFR($db, $id)]);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fetchFR(PDO $db, string|int $id): array {
    $stmt = $db->prepare('SELECT * FROM fund_requests WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    return serializeFRRow($stmt->fetch());
}

function serializeFRRow(array $r): array {
    return [
        '_id'       => $r['id'],
        'id'        => $r['id'],
        'userId'    => $r['user_id']   ?? null,
        'method'    => $r['method']    ?? '',
        'amount'    => (float)($r['amount'] ?? 0),
        'tid'       => $r['tid']       ?? '',
        'status'    => $r['status']    ?? 'pending',
        'note'      => $r['note']      ?? '',
        'created'   => $r['created_at'] ?? null,
        'updatedAt' => $r['updated_at'] ?? null,
    ];
}
