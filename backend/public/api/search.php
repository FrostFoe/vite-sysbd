<?php
require_once __DIR__ . "/../../src/config/db.php";
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

$sql = "SELECT id, {$titleCol} as title, {$summaryCol} as summary, image, category_id, published_at, {$readTimeCol} as read_time, is_video 
        FROM articles 
        WHERE ({$titleCol} LIKE ? OR {$summaryCol} LIKE ?) AND status = 'published'
        ORDER BY published_at DESC 
        LIMIT 20";

$stmt = $pdo->prepare($sql);
$searchTerm = "%" . $query . "%";
$stmt->execute([$searchTerm, $searchTerm]);
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch category names
foreach ($results as &$article) {
    $catName = null;
    if ($article["category_id"]) {
        $catStmt = $pdo->prepare(
            "SELECT title_bn, title_en FROM categories WHERE id = ?",
        );
        $catStmt->execute([$article["category_id"]]);
        $catRow = $catStmt->fetch();
        if ($catRow) {
            $catName =
                $lang === "en" ? $catRow["title_en"] : $catRow["title_bn"];
        }
    }
    $article["category"] = $catName ?? ($lang === "bn" ? "অন্যান্য" : "Other");
    $article["timestamp"] = $article["published_at"];
    $article["isVideo"] = (bool) $article["is_video"];
}

echo json_encode($results);
?>
