<?php
require_once "api_header.php";
require_once __DIR__ . "/../lib/CacheManager.php";
session_start();

// --- Authorization Check ---
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    send_response(["error" => "Unauthorized"], 403);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_response(["error" => "Method not allowed"], 405);
}

// Create cache key for users list
$cache = new CacheManager();
$cacheKey = $cache->generateKey(['admin_users']);

// Try to get from cache first (admin data changes less frequently)
$cachedUsers = $cache->get($cacheKey);
if ($cachedUsers) {
    send_response($cachedUsers);
    exit();
}

try {
    $users = $pdo
        ->query(
            "
        SELECT u.id, u.email, u.role, u.created_at,
               m.id as is_muted, m.reason, m.created_at as muted_at
        FROM users u
        LEFT JOIN muted_users m ON u.id = m.user_id
        ORDER BY u.role DESC, u.created_at DESC
    ",
        )
        ->fetchAll(PDO::FETCH_ASSOC);

    $result = ["success" => true, "users" => $users];

    // Cache for 10 minutes since user data changes less frequently
    $cache->set($cacheKey, $result, 600);

    send_response($result);
} catch (PDOException $e) {
    send_response(["success" => false, "error" => $e->getMessage()], 500);
}
?>
