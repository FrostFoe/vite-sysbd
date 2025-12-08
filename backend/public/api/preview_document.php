<?php
require_once "../../src/config/db.php";

header("Content-Type: application/json");

try {
    $docId = isset($_GET["id"]) ? $_GET["id"] : null;

    if (!$docId) {
        throw new Exception("Document ID required");
    }

    $stmt = $pdo->prepare(
        "SELECT id, file_path, file_type, display_name_bn, display_name_en FROM documents WHERE id = ? LIMIT 1",
    );
    $stmt->execute([$docId]);
    $doc = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$doc) {
        http_response_code(404);
        throw new Exception("Document not found");
    }

    $filePath = __DIR__ . "/../" . $doc["file_path"];

    // Check if file exists
    if (!file_exists($filePath)) {
        http_response_code(404);
        throw new Exception("File not found on server");
    }

    // For images, send them directly
    $imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

    if (in_array($ext, $imageExtensions)) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        header("Content-Type: " . $mime);
        header("Cache-Control: public, max-age=31536000");
        readfile($filePath);
    } else {
        // For other files, return JSON with info
        echo json_encode([
            "success" => true,
            "document" => [
                "id" => $doc["id"],
                "name_bn" => $doc["display_name_bn"],
                "name_en" => $doc["display_name_en"],
                "type" => $doc["file_type"],
                "size" => filesize($filePath),
                "exists" => true,
            ],
        ]);
    }
} catch (Exception $e) {
    http_response_code(400);
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
    ]);
}
?>
