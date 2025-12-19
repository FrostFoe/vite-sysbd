<?php

require_once "../config/db.php";
require_once "../lib/security.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    exit(json_encode(["success" => false, "error" => "Method not allowed"]));
}

try {
    $stmt = $pdo->prepare('
        SELECT 
            a.id,
            a.title_bn,
            a.title_en,
            COUNT(d.id) as doc_count
        FROM articles a
        LEFT JOIN documents d ON a.id = d.article_id
        WHERE a.status = "published"
        GROUP BY a.id, a.title_bn, a.title_en
        ORDER BY a.title_en ASC
    ');

    $stmt->execute();
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($articles as &$article) {
        $article["doc_count"] = (int) $article["doc_count"];
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $articles,
        "message" => count($articles) . " articles found",
    ]);
} catch (Exception $e) {
    error_log("Get articles for docs error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "সার্ভার ত্রুটি (Server error)",
    ]);
}
?>
