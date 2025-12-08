<?php
require_once "../../src/config/db.php";
require_once "../../src/lib/security.php";

header("Content-Type: application/json");

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $docId = isset($input["id"]) ? $input["id"] : null;

    if (!$docId) {
        throw new Exception("Document ID required");
    }

    // Get document info first
    $stmt = $pdo->prepare(
        "SELECT file_path, download_url FROM documents WHERE id = ?",
    );
    $stmt->execute([$docId]);
    $document = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$document) {
        throw new Exception("Document not found");
    }

    // Delete from database
    $delStmt = $pdo->prepare("DELETE FROM documents WHERE id = ?");
    $delStmt->execute([$docId]);

    // Delete file if it exists
    if ($document["file_path"]) {
        $fullPath = __DIR__ . "/../" . $document["file_path"];
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Document deleted",
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
    ]);
}
?>
