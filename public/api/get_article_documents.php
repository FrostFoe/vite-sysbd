<?php
require_once "../config/db.php";
require_once "../lib/security.php";

header("Content-Type: application/json");

try {
    $articleId = isset($_GET["id"]) ? $_GET["id"] : null;

    if (!$articleId) {
        throw new Exception("Article ID required");
    }

    $stmt = $pdo->prepare(
        "SELECT id, display_name_bn, display_name_en, file_type, file_name, description_bn, description_en, download_url, file_size FROM documents WHERE article_id = ? ORDER BY sort_order ASC",
    );
    $stmt->execute([$articleId]);
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "documents" => $documents,
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
    ]);
}
?>
