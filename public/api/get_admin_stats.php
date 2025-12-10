<?php
require_once "api_header.php";
require_once __DIR__ . "/../lib/CacheManager.php";
session_start();

// --- Authorization Check ---
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    send_response(["error" => "Unauthorized"], 403);
    exit();
}
// --- End Authorization Check ---

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_response(["error" => "Method not allowed"], 405);
}

// Create cache key for admin stats
$cache = new CacheManager();
$cacheKey = $cache->generateKey(["admin_stats"]);

// Try to get from cache first (stats change relatively infrequently)
$cachedStats = $cache->get($cacheKey);
if ($cachedStats) {
    send_response($cachedStats);
    exit();
}

try {
    $stats = [
        "articles" => $pdo
            ->query("SELECT COUNT(*) FROM articles")
            ->fetchColumn(),
        "comments" => $pdo
            ->query("SELECT COUNT(*) FROM comments")
            ->fetchColumn(),
        "drafts" => $pdo
            ->query("SELECT COUNT(*) FROM articles WHERE status = 'draft'")
            ->fetchColumn(),
        "users" => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
    ];

    $result = ["success" => true, "stats" => $stats];

    // Cache for 5 minutes since stats update frequently but not on every request
    $cache->set($cacheKey, $result, 300);

    send_response($result);
} catch (PDOException $e) {
    error_log("Admin stats database error: " . $e->getMessage());
    send_response(["success" => false, "error" => "Database error"], 500);
}
?>
