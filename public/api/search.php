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

$titleCol = "title_{$lang}";
$summaryCol = "summary_{$lang}";
$contentCol = "content_{$lang}";
$readTimeCol = "read_time_{$lang}";

$sql = "SELECT
            a.id,
            a.{$titleCol} as title,
            a.{$summaryCol} as summary,
            a.image,
            a.category_id,
            a.published_at,
            a.{$readTimeCol} as read_time,
            COALESCE(c.title_{$lang}, c.title_bn) as category_title
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.status = 'published'
        AND MATCH(a.{$titleCol}, a.{$summaryCol}, a.{$contentCol}) AGAINST (? IN BOOLEAN MODE)
        ORDER BY MATCH(a.{$titleCol}, a.{$summaryCol}, a.{$contentCol}) AGAINST (? IN BOOLEAN MODE) DESC, a.published_at DESC
        LIMIT 20";

$stmt = $pdo->prepare($sql);
$stmt->execute([$query, $query]);
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($results as &$article) {
    $catName = null;
    if (!empty($article["category_title"])) {
        $catName = $article["category_title"];
    }
    $article["category"] = $catName ?? ($lang === "bn" ? "অন্যান্য" : "Other");
    $article["timestamp"] = $article["published_at"];

    unset($article["category_title"]);
}

echo json_encode($results);
?>
