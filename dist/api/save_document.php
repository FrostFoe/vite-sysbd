<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/security.php";
require_once __DIR__ . "/../lib/FileUploader.php";

header("Content-Type: application/json");

try {
    $docId = isset($_POST["id"]) ? $_POST["id"] : null;
    $articleId = isset($_POST["article_id"]) ? $_POST["article_id"] : null;
    $displayNameBn = isset($_POST["display_name_bn"])
        ? trim($_POST["display_name_bn"])
        : "";
    $displayNameEn = isset($_POST["display_name_en"])
        ? trim($_POST["display_name_en"])
        : "";
    $descriptionBn = isset($_POST["description_bn"])
        ? trim($_POST["description_bn"])
        : "";
    $descriptionEn = isset($_POST["description_en"])
        ? trim($_POST["description_en"])
        : "";
    $downloadUrl = isset($_POST["download_url"])
        ? trim($_POST["download_url"])
        : "";
    $sortOrder = isset($_POST["sort_order"]) ? (int) $_POST["sort_order"] : 0;

    if (!$articleId) {
        throw new Exception("Article ID required");
    }

    if (!$displayNameBn && !$displayNameEn) {
        throw new Exception("Display name required (Bengali or English)");
    }

    $artStmt = $pdo->prepare("SELECT id FROM articles WHERE id = ?");
    $artStmt->execute([$articleId]);
    if (!$artStmt->fetch()) {
        throw new Exception("Article not found");
    }

    $filePath = null;
    $fileName = null;
    $fileType = null;
    $fileSize = null;

    if (isset($_FILES["file"]) && $_FILES["file"]["error"] === UPLOAD_ERR_OK) {
        try {
            $dangerousExtensions = [
                "php",
                "phtml",
                "php3",
                "php4",
                "php5",
                "php7",
                "php8",
                "phps",
                "pht",
                "phar",
                "html",
                "htm",
                "js",
                "jsp",
                "jspx",
                "pl",
                "py",
                "rb",
                "sh",
                "sql",
                "htaccess",
                "htpasswd",
                "exe",
                "com",
                "bat",
                "cmd",
                "pif",
                "scr",
                "vbs",
                "vbe",
                "jar",
                "shtml",
                "shtm",
                "stm",
                "asa",
                "asax",
                "ascx",
                "ashx",
                "asmx",
                "axd",
                "c",
                "cpp",
                "csharp",
                "vb",
                "asp",
                "aspx",
                "asmx",
                "swf",
                "cgi",
                "dll",
                "sys",
                "ps1",
                "psm1",
                "psd1",
                "reg",
                "msi",
                "msp",
                "lnk",
                "inf",
                "application",
                "gadget",
                "hta",
                "cpl",
                "msc",
                "ws",
                "wsf",
                "wsh",
                "jse",
            ];

            $originalExt = pathinfo(
                $_FILES["file"]["name"],
                PATHINFO_EXTENSION,
            );
            if (in_array(strtolower($originalExt), $dangerousExtensions)) {
                throw new Exception(
                    "File type not allowed (potentially dangerous): ." .
                        $originalExt,
                );
            }

            $uploader = new FileUploader();
            $filePath = $uploader->uploadDocument($_FILES["file"]);

            $file = $_FILES["file"];
            $fileExt = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
            $fileName = $file["name"];
            $fileType = strtoupper($fileExt);
            $fileSize = $file["size"];
        } catch (Exception $e) {
            throw $e;
        }
    }

    if ($docId) {
        $docStmt = $pdo->prepare(
            "SELECT file_path, file_size, file_name, file_type FROM documents WHERE id = ?",
        );
        $docStmt->execute([$docId]);
        $existingDoc = $docStmt->fetch();

        if (!$existingDoc) {
            throw new Exception("Document not found");
        }

        if (!$filePath) {
            $filePath = $existingDoc["file_path"];
            $fileName = $existingDoc["file_name"];
            $fileType = $existingDoc["file_type"];
            $fileSize = $existingDoc["file_size"];
        }

        $updateStmt = $pdo->prepare("
            UPDATE documents 
            SET display_name_bn = ?, display_name_en = ?, description_bn = ?, description_en = ?,
                download_url = ?, sort_order = ?, file_path = ?, file_name = ?, file_type = ?, file_size = ?
            WHERE id = ?
        ");
        $updateStmt->execute([
            $displayNameBn,
            $displayNameEn,
            $descriptionBn,
            $descriptionEn,
            $downloadUrl ?: null,
            $sortOrder,
            $filePath,
            $fileName,
            $fileType,
            $fileSize,
            $docId,
        ]);
    } else {
        if (!$filePath && !$downloadUrl) {
            throw new Exception(
                "Either file upload or external URL is required",
            );
        }

        $newId = "doc_" . bin2hex(random_bytes(8));
        $insertStmt = $pdo->prepare("
            INSERT INTO documents (id, article_id, display_name_bn, display_name_en, description_bn, description_en, 
                                    download_url, sort_order, file_path, file_name, file_type, file_size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insertStmt->execute([
            $newId,
            $articleId,
            $displayNameBn,
            $displayNameEn,
            $descriptionBn,
            $descriptionEn,
            $downloadUrl ?: null,
            $sortOrder,
            $filePath,
            $fileName,
            $fileType,
            $fileSize,
        ]);
    }

    echo json_encode([
        "success" => true,
        "message" => $docId ? "Document updated" : "Document created",
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
    ]);
}
?>
