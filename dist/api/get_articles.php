<?php
require_once "api_header.php";
require_once __DIR__ . "/../lib/CacheManager.php";
session_start();

$status = isset($_GET["status"]) ? $_GET["status"] : "all";
$isAdmin = isset($_SESSION["user_role"]) && $_SESSION["user_role"] === "admin";

if ($status !== "published" && !$isAdmin) {
    send_response(["error" => "Unauthorized"], 403);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_response(["error" => "Method not allowed"], 405);
}
$search = isset($_GET["search"]) ? trim($_GET["search"]) : "";
$catFilter = isset($_GET["cat"]) ? $_GET["cat"] : "";

$page = isset($_GET["page"]) ? max(1, (int)$_GET["page"]) : 1;
$limit = isset($_GET["limit"]) ? min(100, max(1, (int)$_GET["limit"])) : 20;
$offset = ($page - 1) * $limit;

$cache = new CacheManager();
$cacheKey = $cache->generateKey([
    "admin_articles",
    $status,
    $search,
    $catFilter,
]);

if (empty($search) && $catFilter === "" && $status === "all") {
    $cachedArticles = $cache->get($cacheKey);
    if ($cachedArticles) {
        send_response($cachedArticles);
        exit();
    }
}
$lang = isset($_GET["lang"]) ? $_GET["lang"] : "bn";

try {
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
    
    $countSql = "SELECT COUNT(*) as total FROM articles a WHERE 1=1";
    $countParams = [];

    if ($status !== "all") {
        $countSql .= " AND a.status = ?";
        $countParams[] = $status;
    }

    if (!empty($search)) {
        $countSql .= " AND (a.title_bn LIKE ? OR a.title_en LIKE ?)";
        $countParams[] = "%$search%";
        $countParams[] = "%$search%";
    }

    if (!empty($catFilter)) {
        $countSql .= " AND a.category_id = ?";
        $countParams[] = $catFilter;
    }

    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $countResult = $countStmt->fetch(PDO::FETCH_ASSOC);
    $total = (int)$countResult['total'];
    $totalPages = ceil($total / $limit);

    $sql .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;

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
                    : $art["title_en"] ?? $art["title_bn"],
            "status" => $art["status"],
            "image" => $art["image"],
            "created_at" => $art["created_at"],
            "published_at" => $art["published_at"],
            "category_id" => $art["category_id"],
            "category" =>
                $lang === "bn"
                    ? $art["cat_bn"] ?? $art["cat_en"]
                    : $art["cat_en"] ?? $art["cat_bn"],
        ];
    }

    $result = [
        "success" => true,
        "articles" => $articles,
        "pagination" => [
            "page" => $page,
            "limit" => $limit,
            "total" => $total,
            "totalPages" => $totalPages,
            "hasNextPage" => $page < $totalPages,
            "hasPrevPage" => $page > 1
        ]
    ];

    if (empty($search) && $catFilter === "" && $status === "all") {
        $cache->set($cacheKey, $result, 300);
    }

    send_response($result);
} catch (PDOException $e) {
    error_log("Admin articles list database error: " . $e->getMessage());
    send_response(["success" => false, "error" => "Database error"], 500);
}
?>
