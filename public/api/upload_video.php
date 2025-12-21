<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/security.php";
require_once __DIR__ . "/../lib/FileUploader.php";

header("Content-Type: application/json");

try {
    require_once __DIR__ . "/../lib/session.php";
    if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
        send_response(["success" => false, "error" => "Unauthorized"], 403);
        exit();
    }

    if (
        !isset($_FILES["video"]) ||
        $_FILES["video"]["error"] !== UPLOAD_ERR_OK
    ) {
        send_response(
            [
                "success" => false,
                "error" => "Video upload failed or no file selected",
            ],
            400,
        );
        exit();
    }

    if ($_FILES["video"]["size"] > 52428800) {
        send_response(
            [
                "success" => false,
                "error" => "File too large (max 50MB)",
            ],
            413,
        );
        exit();
    }

    $uploader = new FileUploader();
    $videoPath = $uploader->uploadVideo($_FILES["video"]);

    $videoUrl = "/" . $videoPath;

    send_response([
        "success" => true,
        "url" => $videoUrl,
        "size" => $_FILES["video"]["size"],
        "message" => "Video uploaded successfully",
    ]);
} catch (Exception $e) {
    send_response(
        [
            "success" => false,
            "error" => $e->getMessage(),
        ],
        400,
    );
}

function send_response($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data);
}
?>
