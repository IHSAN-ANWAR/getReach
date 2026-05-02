<?php
// Ticket routes — MySQL version

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/sanitize.php';

// ── POST /api/tickets ───────────────────────────────────────────────────────
function handleCreateTicket(): void {
    $body    = getBody();
    $userId  = $body['userId']  ?? '';
    $subject = sanitizeString($body['subject'] ?? '', 200);
    $message = sanitizeString($body['message'] ?? '', 2000);

    if (!$subject || !$message) jsonError('subject and message are required', 400);

    $db = getDB();

    // Resolve userId — fall back to system user
    $resolvedUserId = null;
    if ($userId) {
        $stmt = $db->prepare('SELECT id FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        if ($stmt->fetch()) $resolvedUserId = $userId;
    }

    if (!$resolvedUserId) {
        $sys = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $sys->execute(['system@getreach.pk']);
        $sysUser = $sys->fetch();
        if (!$sysUser) {
            $db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
               ->execute(['System', 'system@getreach.pk', 'system', 'user']);
            $resolvedUserId = $db->lastInsertId();
        } else {
            $resolvedUserId = $sysUser['id'];
        }
    }

    $db->prepare('INSERT INTO tickets (user_id, subject, message, status, admin_reply) VALUES (?, ?, ?, ?, ?)')
       ->execute([$resolvedUserId, $subject, $message, 'Open', '']);
    $ticketId = $db->lastInsertId();

    // Insert first message
    $db->prepare('INSERT INTO ticket_messages (ticket_id, sender, text) VALUES (?, ?, ?)')
       ->execute([$ticketId, 'user', $message]);

    jsonResponse(fetchTicket($db, $ticketId), 201);
}

// ── GET /api/tickets ────────────────────────────────────────────────────────
function handleGetTickets(): void {
    $query  = getQuery();
    $db     = getDB();

    if (!empty($query['userId'])) {
        $stmt = $db->prepare('SELECT t.*, u.name as user_name, u.email as user_email FROM tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.user_id = ? ORDER BY t.created_at DESC');
        $stmt->execute([$query['userId']]);
    } else {
        $stmt = $db->query('SELECT t.*, u.name as user_name, u.email as user_email FROM tickets t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC');
    }

    $tickets = $stmt->fetchAll();
    $out = [];
    foreach ($tickets as $t) {
        $row = fetchTicket($db, $t['id']);
        $row['userId'] = ['_id' => $t['user_id'], 'name' => $t['user_name'] ?? '', 'email' => $t['user_email'] ?? ''];
        $out[] = $row;
    }
    jsonResponse($out);
}

// ── PATCH /api/tickets/:id ──────────────────────────────────────────────────
function handleUpdateTicket(string $id): void {
    $body       = getBody();
    $status     = sanitizeString($body['status']     ?? '', 50) ?: null;
    $adminReply = isset($body['adminReply']) ? sanitizeString($body['adminReply'], 2000) : null;
    $userReply  = isset($body['userReply'])  ? sanitizeString($body['userReply'],  2000) : null;

    $db  = getDB();
    $set = [];
    $vals = [];

    if ($status) { $set[] = 'status = ?'; $vals[] = $status; }

    if ($adminReply !== null && $adminReply !== '') {
        $set[]  = 'admin_reply = ?'; $vals[] = $adminReply;
        $set[]  = 'replied_at = NOW()';
        if (!$status) { $set[] = 'status = ?'; $vals[] = 'In Review'; }
        $db->prepare('INSERT INTO ticket_messages (ticket_id, sender, text) VALUES (?, ?, ?)')
           ->execute([$id, 'admin', $adminReply]);
    }

    if ($userReply !== null && $userReply !== '') {
        if (!$status) { $set[] = 'status = ?'; $vals[] = 'Open'; }
        $db->prepare('INSERT INTO ticket_messages (ticket_id, sender, text) VALUES (?, ?, ?)')
           ->execute([$id, 'user', $userReply]);
    }

    if (!empty($set)) {
        $vals[] = $id;
        $db->prepare('UPDATE tickets SET ' . implode(', ', $set) . ' WHERE id = ?')->execute($vals);
    }

    jsonResponse(fetchTicket($db, $id));
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fetchTicket(PDO $db, string|int $id): array {
    $stmt = $db->prepare('SELECT * FROM tickets WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $t = $stmt->fetch();

    $msgs = $db->prepare('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY sent_at ASC');
    $msgs->execute([$id]);
    $messages = array_map(fn($m) => [
        'sender' => $m['sender'],
        'text'   => $m['text'],
        'sentAt' => $m['sent_at'],
    ], $msgs->fetchAll());

    return [
        '_id'        => $t['id'],
        'id'         => $t['id'],
        'userId'     => $t['user_id']    ?? null,
        'subject'    => $t['subject']    ?? '',
        'message'    => $t['message']    ?? '',
        'status'     => $t['status']     ?? 'Open',
        'adminReply' => $t['admin_reply'] ?? '',
        'repliedAt'  => $t['replied_at'] ?? null,
        'messages'   => $messages,
        'created'    => $t['created_at'] ?? null,
    ];
}
