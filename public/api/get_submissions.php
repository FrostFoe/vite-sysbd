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

// Create cache key for admin submissions
$cache = new CacheManager();
$cacheKey = $cache->generateKey(['admin_submissions']);

// Try to get from cache first (admin submissions list might be accessed frequently)
$cachedSubmissions = $cache->get($cacheKey);
if ($cachedSubmissions) {
    send_response($cachedSubmissions);
    exit();
}

try {
    $sql = "SELECT s.*, a.title_en, a.title_bn
            FROM article_submissions s
            LEFT JOIN articles a ON s.article_id = a.id
            ORDER BY s.created_at DESC";
    $stmt = $pdo->query($sql);
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = ["success" => true, "submissions" => $submissions];

    // Cache for 10 minutes since submissions don't change that frequently
    $cache->set($cacheKey, $result, 600);

    send_response($result);
} catch (PDOException $e) {
    send_response(["success" => false, "error" => $e->getMessage()], 500);
}
?>
