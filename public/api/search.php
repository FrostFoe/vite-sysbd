<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../api/api_header.php";

$query = isset($_GET["q"]) ? trim($_GET["q"]) : "";
$lang = isset($_GET["lang"]) ? $_GET["lang"] : "bn";
$lang = $lang === "en" ? "en" : "bn";

if (mb_strlen($query) < 2) {
    echo json_encode([]);
    exit();
}

// Search in specific language columns
$titleCol = "title_{$lang}";
$summaryCol = "summary_{$lang}";
$readTimeCol = "read_time_{$lang}";

// Optimized search with JOIN to get category names in one query
$sql = "SELECT
            a.id,
            a.{$titleCol} as title,
            a.{$summaryCol} as summary,
            a.image,
            a.category_id,
            a.published_at,
            a.{$readTimeCol} as read_time,
            a.is_video,
            COALESCE(c.title_{$lang}, c.title_bn) as category_title
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE (a.{$titleCol} LIKE ? OR a.{$summaryCol} LIKE ?) AND a.status = 'published'
        ORDER BY a.published_at DESC
        LIMIT 20";

$stmt = $pdo->prepare($sql);
$searchTerm = "%" . $query . "%";
$stmt->execute([$searchTerm, $searchTerm]);
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Process results
foreach ($results as &$article) {
    $catName = null;
    if (!empty($article["category_title"])) {
        $catName = $article["category_title"];
    }
    $article["category"] = $catName ?? ($lang === "bn" ? "অন্যান্য" : "Other");
    $article["timestamp"] = $article["published_at"];
    $article["isVideo"] = (bool) $article["is_video"];
    // Clean up temporary field
    unset($article["category_title"]);
}

echo json_encode($results);
?>
