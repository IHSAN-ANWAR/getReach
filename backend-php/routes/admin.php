<?php
// Admin routes: /api/admin/stats, /api/admin/revenue — MySQL version

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/response.php';

// ── GET /api/admin/stats ────────────────────────────────────────────────────
function handleAdminStats(): void {
    requireAdmin();
    $db = getDB();

    $totalUsers   = $db->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $totalOrders  = $db->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    $totalTickets = $db->query('SELECT COUNT(*) FROM tickets')->fetchColumn();
    $openTickets  = $db->query("SELECT COUNT(*) FROM tickets WHERE status IN ('Open','In Review')")->fetchColumn();
    $totalRevenue = $db->query('SELECT COALESCE(SUM(price),0) FROM orders')->fetchColumn();

    $since7 = date('Y-m-d H:i:s', time() - 6 * 86400);

    $usersLast7 = $db->prepare("SELECT DATE(created_at) as _id, COUNT(*) as count FROM users WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY _id ASC");
    $usersLast7->execute([$since7]);

    $ordersLast7 = $db->prepare("SELECT DATE(created_at) as _id, COUNT(*) as count FROM orders WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY _id ASC");
    $ordersLast7->execute([$since7]);

    $recentUsers  = $db->query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5')->fetchAll();
    $recentOrders = $db->query('SELECT id, service_name, price, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5')->fetchAll();

    jsonResponse([
        'totalUsers'   => (int)$totalUsers,
        'totalOrders'  => (int)$totalOrders,
        'totalTickets' => (int)$totalTickets,
        'openTickets'  => (int)$openTickets,
        'totalRevenue' => (float)$totalRevenue,
        'usersLast7'   => array_map(fn($r) => ['_id' => $r['_id'], 'count' => (int)$r['count']], $usersLast7->fetchAll()),
        'ordersLast7'  => array_map(fn($r) => ['_id' => $r['_id'], 'count' => (int)$r['count']], $ordersLast7->fetchAll()),
        'recentUsers'  => array_map(fn($u) => ['_id' => $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'created' => $u['created_at']], $recentUsers),
        'recentOrders' => array_map(fn($o) => ['_id' => $o['id'], 'serviceName' => $o['service_name'], 'price' => (float)$o['price'], 'status' => $o['status'], 'created' => $o['created_at']], $recentOrders),
    ]);
}

// ── GET /api/admin/revenue ──────────────────────────────────────────────────
function handleAdminRevenue(): void {
    requireAdmin();
    $db   = getDB();
    $days = (int)(getQuery()['period'] ?? 30);
    $since = date('Y-m-d H:i:s', time() - $days * 86400);

    $totals = $db->query('SELECT COALESCE(SUM(price),0) as totalRevenue, COALESCE(SUM(api_cost),0) as totalApiCost, COUNT(*) as totalOrders FROM orders')->fetch();

    $daily = $db->prepare("SELECT DATE(created_at) as _id, SUM(price) as revenue, SUM(api_cost) as apiCost, COUNT(*) as orders FROM orders WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY _id ASC");
    $daily->execute([$since]);

    $top = $db->prepare("SELECT service_name as _id, SUM(price) as revenue, SUM(api_cost) as apiCost, COUNT(*) as orders FROM orders WHERE created_at >= ? GROUP BY service_name ORDER BY revenue DESC LIMIT 8");
    $top->execute([$since]);

    jsonResponse([
        'totalRevenue' => (float)$totals['totalRevenue'],
        'totalApiCost' => (float)$totals['totalApiCost'],
        'totalProfit'  => (float)$totals['totalRevenue'] - (float)$totals['totalApiCost'],
        'totalOrders'  => (int)$totals['totalOrders'],
        'daily'        => array_map(fn($r) => ['_id' => $r['_id'], 'revenue' => (float)$r['revenue'], 'apiCost' => (float)$r['apiCost'], 'orders' => (int)$r['orders']], $daily->fetchAll()),
        'topServices'  => array_map(fn($r) => ['_id' => $r['_id'], 'revenue' => (float)$r['revenue'], 'apiCost' => (float)$r['apiCost'], 'orders' => (int)$r['orders']], $top->fetchAll()),
    ]);
}
