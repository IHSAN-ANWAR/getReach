<?php
// Auth routes: /api/register, /api/login, /api/admin-auth,
//              /api/forgot-password, /api/reset-password

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/sanitize.php';
require_once __DIR__ . '/../utils/email.php';

// ── POST /api/register ──────────────────────────────────────────────────────
function handleRegister(): void {
    $body     = getBody();
    $name     = sanitizeString($body['name']     ?? '', 100);
    $email    = sanitizeEmail($body['email']     ?? '');
    $password = trim($body['password']           ?? '');

    if (!$name || !$email || !$password)
        jsonError('Name, email and password are required.', 400);
    if (strlen($password) < 6)
        jsonError('Password must be at least 6 characters.', 400);

    $db   = getDB();
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) jsonError('An account with this email already exists.', 400);

    $hashed = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    $stmt   = $db->prepare('INSERT INTO users (name, email, password, role, balance) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$name, $email, $hashed, 'user', 0]);
    $id = $db->lastInsertId();

    $secret = $_ENV['JWT_SECRET'] ?? 'getReach_secret';
    $token  = jwtEncode(['id' => $id, 'role' => 'user', 'exp' => time() + 86400], $secret);

    jsonResponse([
        'message' => 'Registration successful',
        'user'    => ['id' => $id, '_id' => $id, 'name' => $name, 'email' => $email, 'role' => 'user', 'balance' => 0],
        'token'   => $token,
    ], 201);
}

// ── POST /api/login ─────────────────────────────────────────────────────────
function handleLogin(): void {
    $body     = getBody();
    $email    = trim($body['email']    ?? '');  // Don't sanitize yet — admin username might not be email format
    $password = trim($body['password'] ?? '');

    if (!$email || !$password) jsonError('Invalid credentials', 401);

    $adminEmail = $_ENV['ADMIN_USERNAME'] ?? '';
    $adminPass  = $_ENV['ADMIN_PASSWORD'] ?? '';

    // Admin bypass — check before email sanitization
    if ($email === $adminEmail && $password === $adminPass) {
        $secret = $_ENV['JWT_SECRET'] ?? 'getReach_secret';
        $token  = jwtEncode(['id' => 'admin_id', 'role' => 'admin', 'exp' => time() + 86400 * 7], $secret);
        jsonResponse([
            'user'  => ['_id' => 'admin_id', 'id' => 'admin_id', 'name' => 'Master Administrator', 'email' => $adminEmail, 'role' => 'admin', 'balance' => 0],
            'token' => $token,
        ]);
    }

    // Now sanitize for regular user login
    $email = sanitizeEmail($email);
    if (!$email) jsonError('Invalid credentials', 401);

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Demo user auto-create
    if (!$user && $email === 'demo@getreach.pk' && $password === '123456') {
        $hashed = password_hash('123456', PASSWORD_BCRYPT, ['cost' => 10]);
        $ins    = $db->prepare('INSERT INTO users (name, email, password, role, balance) VALUES (?, ?, ?, ?, ?)');
        $ins->execute(['GetReach Test Account', $email, $hashed, 'user', 10]);
        $stmt->execute([$email]);
        $user = $stmt->fetch();
    }

    if (!$user) jsonError('Invalid credentials', 401);

    $match = false;
    if (str_starts_with($user['password'], '$2')) {
        $match = password_verify($password, $user['password']);
    } else {
        $match = ($user['password'] === $password);
        if ($match) {
            $hashed = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
            $db->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([$hashed, $user['id']]);
        }
    }

    if (!$match) jsonError('Invalid credentials', 401);

    $secret = $_ENV['JWT_SECRET'] ?? 'getReach_secret';
    $token  = jwtEncode(['id' => $user['id'], 'role' => $user['role'], 'exp' => time() + 86400], $secret);

    jsonResponse([
        'user'  => [
            'id'      => $user['id'],
            '_id'     => $user['id'],
            'name'    => $user['name'],
            'email'   => $user['email'],
            'role'    => $user['role'],
            'balance' => (float) $user['balance'],
        ],
        'token' => $token,
    ]);
}

// ── POST /api/admin-auth ────────────────────────────────────────────────────
function handleAdminAuth(): void {
    $body     = getBody();
    $email    = trim($body['email']    ?? '');  // raw trim — username may not be email format
    $password = trim($body['password'] ?? '');

    if ($email === ($_ENV['ADMIN_USERNAME'] ?? '') && $password === ($_ENV['ADMIN_PASSWORD'] ?? '')) {
        $secret = $_ENV['JWT_SECRET'] ?? 'getReach_secret';
        $token  = jwtEncode(['id' => 'admin_id', 'role' => 'admin', 'exp' => time() + 86400 * 7], $secret);
        jsonResponse([
            'user'  => ['_id' => 'admin_id', 'id' => 'admin_id', 'name' => 'Master Administrator', 'email' => $email, 'role' => 'admin', 'balance' => 0],
            'token' => $token,
        ]);
    }
    jsonError('Invalid admin credentials', 401);
}

// ── POST /api/forgot-password ───────────────────────────────────────────────
function handleForgotPassword(): void {
    $body  = getBody();
    $email = sanitizeEmail($body['email'] ?? '');

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['message' => 'If that email exists, a reset link has been sent.']);
    }

    $token  = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', time() + 3600);
    $db->prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
       ->execute([$token, $expiry, $user['id']]);

    $frontendUrl = $_ENV['FRONTEND_URL'] ?? '';
    $resetUrl    = "$frontendUrl/reset-password?token=$token";
    $name        = $user['name'];

    $html = <<<HTML
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#1A2517;border-radius:16px;color:#F5F0E8;">
  <h2 style="color:#ACC8A2;margin-bottom:8px;">Password Reset</h2>
  <p style="color:rgba(245,240,232,0.7);margin-bottom:24px;">Hi $name, click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
  <a href="$resetUrl" style="display:inline-block;padding:14px 32px;background:#ACC8A2;color:#1A2517;border-radius:10px;font-weight:800;text-decoration:none;font-size:16px;">Reset Password</a>
  <p style="margin-top:24px;color:rgba(245,240,232,0.35);font-size:12px;">If you didn't request this, ignore this email.</p>
</div>
HTML;

    try {
        sendMail($email, 'Reset Your GetReach Password', $html);
    } catch (Exception $e) {
        error_log('Forgot password email error: ' . $e->getMessage());
    }

    jsonResponse(['message' => 'If that email exists, a reset link has been sent.']);
}

// ── POST /api/reset-password ────────────────────────────────────────────────
function handleResetPassword(): void {
    $body        = getBody();
    $token       = $body['token']       ?? '';
    $newPassword = $body['newPassword'] ?? '';

    if (!$token || !$newPassword || strlen($newPassword) < 4)
        jsonError('Invalid request.', 400);

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() LIMIT 1');
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) jsonError('Reset link is invalid or has expired.', 400);

    $hashed = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 10]);
    $db->prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?')
       ->execute([$hashed, $user['id']]);

    jsonResponse(['message' => 'Password reset successfully. You can now log in.']);
}
