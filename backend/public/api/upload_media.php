<?php
require_once "../../src/config/db.php";
require_once "../../src/lib/security.php";
require_once "../../src/lib/FileUploader.php";

header("Content-Type: application/json");

try {
    // Check authentication
    session_start();
    if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
        throw new Exception("Unauthorized");
    }

    if (
        !isset($_FILES["media"]) ||
        $_FILES["media"]["error"] !== UPLOAD_ERR_OK
    ) {
        throw new Exception("Media upload failed");
    }

    $uploader = new FileUploader();
    $file = $_FILES["media"];
    $fileExt = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

    // Determine type
    $videoExtensions = ["mp4", "webm", "avi", "mov", "mkv"];
    $audioExtensions = ["mp3", "wav", "ogg", "m4a", "flac"];
    $isVideo = in_array($fileExt, $videoExtensions);
    $isAudio = in_array($fileExt, $audioExtensions);

    if (!$isVideo && !$isAudio) {
        throw new Exception("File must be video or audio");
    }

    $mediaPath = $isVideo
        ? $uploader->uploadVideo($file)
        : $uploader->uploadAudio($file);

    echo json_encode([
        "success" => true,
        "url" => $mediaPath,
        "type" => $isVideo ? "video" : "audio",
        "size" => $file["size"],
        "message" => "Media uploaded successfully",
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
    ]);
}
?>
