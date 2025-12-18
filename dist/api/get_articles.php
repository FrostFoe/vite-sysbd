<?php
require_once "api_header.php";
require_once __DIR__ . "/../lib/CacheManager.php";
session_start();

// --- Authorization Check ---
// Allow public access to fetch published articles
// Only admin can access drafts/archived articles
$status = isset($_GET["status"]) ? $_GET["status"] : "all";
$isAdmin = isset($_SESSION["user_role"]) && $_SESSION["user_role"] === "admin";

// If status is anything other than "published", user must be admin
if ($status !== "published" && !$isAdmin) {
    send_response(["error" => "Unauthorized"], 403);
    exit();
}
// --- End Authorization Check ---

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_response(["error" => "Method not allowed"], 405);
}
$search = isset($_GET["search"]) ? trim($_GET["search"]) : "";
$catFilter = isset($_GET["cat"]) ? $_GET["cat"] : "";

// Create cache key for this specific query
$cache = new CacheManager();
$cacheKey = $cache->generateKey([
    "admin_articles",
    $status,
    $search,
    $catFilter,
]);

// Don't cache if there are filters applied or for admin views that might change frequently
if (empty($search) && $catFilter === "" && $status === "all") {
    // Try to get from cache first (for unfiltered admin view, cache for 5 minutes)
    $cachedArticles = $cache->get($cacheKey);
    if ($cachedArticles) {
        send_response($cachedArticles);
        exit();
    }
}
$lang = isset($_GET["lang"]) ? $_GET["lang"] : "bn"; // Language for title fallback and category names

try {
    // Fetch Articles
    $sql = "SELECT a.id, a.title_bn, a.title_en, a.status, a.image, a.created_at, a.published_at, c.title_en as cat_en, c.title_bn as cat_bn 
            FROM articles a 
            LEFT JOIN categories c ON a.category_id = c.id 
            WHERE 1=1";
    $params = [];

    if ($status !== "all") {
        $sql .= " AND a.status = ?";
        $params[] = $status;
    }

    if (!empty($search)) {
        $sql .= " AND (a.title_bn LIKE ? OR a.title_en LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    if (!empty($catFilter)) {
        $sql .= " AND a.category_id = ?";
        $params[] = $catFilter;
    }

    $sql .= " ORDER BY a.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rawArticles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $articles = [];
    foreach ($rawArticles as $art) {
        $articles[] = [
            "id" => $art["id"],
            "title_bn" => $art["title_bn"],
            "title_en" => $art["title_en"],
            "title" =>
                $lang === "bn"
                    ? $art["title_bn"] ?? $art["title_en"]
                    : $art["title_en"] ?? $art["title_bn"], // Fallback
            "status" => $art["status"],
            "image" => $art["image"],
            "created_at" => $art["created_at"],
            "published_at" => $art["published_at"],
            "category_id" => $art["category_id"],
            "category" =>
                $lang === "bn"
                    ? $art["cat_bn"] ?? $art["cat_en"]
                    : $art["cat_en"] ?? $art["cat_bn"], // Fallback
        ];
    }

    $result = ["success" => true, "articles" => $articles];

    // Cache only the unfiltered results
    if (empty($search) && $catFilter === "" && $status === "all") {
        $cache->set($cacheKey, $result, 300); // Cache for 5 minutes
    }

    send_response($result);
} catch (PDOException $e) {
    error_log("Admin articles list database error: " . $e->getMessage());
    send_response(["success" => false, "error" => "Database error"], 500);
}
?>
