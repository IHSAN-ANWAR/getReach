<?php
// User routes: /api/users, /api/users/:id/reset-password, /api/users/:id/add-balance

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/response.php';

// ── GET /api/users ──────────────────────────────────────────────────────────
function handleGetUsers(): void {
    requireAdmin();
    $db   = getDB();
    $stmt = $db->query('SELECT id, name, email, role, balance, created_at FROM users ORDER BY created_at DESC');
    $users = $stmt->fetchAll();
    $out = array_map(fn($u) => [
        '_id'     => $u['id'],
        'id'      => $u['id'],
        'name'    => $u['name'],
        'email'   => $u['email'],
        'role'    => $u['role'],
        'balance' => (float) $u['balance'],
        'created' => $u['created_at'],
    ], $users);
    jsonResponse($out);
}

// ── PATCH /api/users/:id/reset-password ────────────────────────────────────
function handleAdminResetPassword(string $id): void {
    requireAdmin();
    $body        = getBody();
    $newPassword = $body['newPassword'] ?? '';

    if (!$newPassword || strlen($newPassword) < 4)
        jsonError('Password must be at least 4 characters', 400);

    $db     = getDB();
    $hashed = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 10]);
    $stmt   = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([$hashed, $id]);

    if ($stmt->rowCount() === 0) jsonError('User not found', 404);
    jsonResponse(['success' => true, 'message' => 'Password reset successfully']);
}

// ── PATCH /api/users/:id/add-balance ───────────────────────────────────────
function handleAddBalance(string $id): void {
    requireAdmin();
    $body   = getBody();
    $amount = $body['amount'] ?? null;

    if ($amount === null || !is_numeric($amount) || (float)$amount <= 0)
        jsonError('Valid amount required', 400);

    $db   = getDB();
    $stmt = $db->prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
    $stmt->execute([(float)$amount, $id]);

    if ($stmt->rowCount() === 0) jsonError('User not found', 404);

    $row = $db->prepare('SELECT balance FROM users WHERE id = ?');
    $row->execute([$id]);
    $user = $row->fetch();

    jsonResponse(['success' => true, 'newBalance' => (float)$user['balance']]);
}
