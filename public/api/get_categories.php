<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/CacheManager.php";
require_once "api_header.php";

$cache = new CacheManager();
$cacheKey = $cache->generateKey(["categories_all"]);

$cachedCategories = $cache->get($cacheKey);
if ($cachedCategories) {
    $json = json_encode($cachedCategories);
    $etag = '"' . md5($json) . '"';

    if (
        isset($_SERVER["HTTP_IF_NONE_MATCH"]) &&
        trim($_SERVER["HTTP_IF_NONE_MATCH"]) === $etag
    ) {
        header("ETag: " . $etag);
        header("Cache-Control: public, max-age=3600");
        http_response_code(304);
        exit();
    }

    header("ETag: " . $etag);
    header("Cache-Control: public, max-age=3600");
    echo $json;
    exit();
}

try {
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY id ASC");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [
        "success" => true,
        "data" => $categories,
    ];

    $cache->set($cacheKey, $result, 3600);

    $json = json_encode($result);
    $etag = '"' . md5($json) . '"';
    header("ETag: " . $etag);
    header("Cache-Control: public, max-age=3600");
    echo $json;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>
