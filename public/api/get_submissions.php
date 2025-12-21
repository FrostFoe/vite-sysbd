<?php
require_once "api_header.php";
require_once __DIR__ . "/../lib/CacheManager.php";
require_once __DIR__ . "/../lib/session.php";

if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    send_response(["error" => "Unauthorized"], 403);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_response(["error" => "Method not allowed"], 405);
}

$cache = new CacheManager();
$cacheKey = $cache->generateKey(["admin_submissions"]);

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

    $cache->set($cacheKey, $result, 600);

    send_response($result);
} catch (PDOException $e) {
    send_response(["success" => false, "error" => $e->getMessage()], 500);
}
?>
