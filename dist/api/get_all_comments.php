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

// Create cache key for admin comments
$cache = new CacheManager();
$cacheKey = $cache->generateKey(["admin_all_comments"]);

// Try to get from cache first (admin comments list might be accessed frequently)
$cachedComments = $cache->get($cacheKey);
if ($cachedComments) {
    send_response($cachedComments);
    exit();
}

try {
    $comments = $pdo
        ->query(
            "
        SELECT c.id, c.text, c.created_at, c.user_name, a.title_en, a.title_bn, a.id as article_id
        FROM comments c
        JOIN articles a ON c.article_id = a.id
        ORDER BY c.created_at DESC
        LIMIT 100
    ",
        )
        ->fetchAll(PDO::FETCH_ASSOC);

    $result = ["success" => true, "comments" => $comments];

    // Cache for 5 minutes since comments change frequently
    $cache->set($cacheKey, $result, 300);

    send_response($result);
} catch (PDOException $e) {
    send_response(["success" => false, "error" => $e->getMessage()], 500);
}
?>
