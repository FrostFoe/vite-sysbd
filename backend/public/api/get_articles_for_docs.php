<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../src/config/db.php";
require_once __DIR__ . "/check_auth.php";

// Admin-only check
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

try {
    $articlesStmt = $pdo->query("
        SELECT a.id, a.title_bn, a.title_en, COUNT(d.id) as doc_count
        FROM articles a
        LEFT JOIN documents d ON a.id = d.article_id
        GROUP BY a.id
        ORDER BY a.published_at DESC
    ");
    $articles = $articlesStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $articles,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
