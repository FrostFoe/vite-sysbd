<?php
require_once "../config/db.php";
require_once "../lib/security.php";

header("Content-Type: application/json");

try {
    $docId = isset($_GET["id"]) ? $_GET["id"] : null;

    if (!$docId) {
        throw new Exception("Document ID required");
    }

    $stmt = $pdo->prepare("SELECT * FROM documents WHERE id = ?");
    $stmt->execute([$docId]);
    $document = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$document) {
        throw new Exception("Document not found");
    }

    echo json_encode([
        "success" => true,
        "document" => $document,
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
    ]);
}
?>
