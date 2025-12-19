<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/security.php";
require_once __DIR__ . "/../lib/FileUploader.php";

header("Content-Type: application/json");

try {
    session_start();
    if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
        send_response(["success" => false, "error" => "Unauthorized"], 403);
        exit();
    }

    if (
        !isset($_FILES["image"]) ||
        $_FILES["image"]["error"] !== UPLOAD_ERR_OK
    ) {
        send_response(
            [
                "success" => false,
                "error" => "Image upload failed or no file selected",
            ],
            400,
        );
        exit();
    }

    if ($_FILES["image"]["size"] > 5242880) {
        send_response(
            [
                "success" => false,
                "error" => "File too large (max 5MB)",
            ],
            413,
        );
        exit();
    }

    $uploader = new FileUploader();
    $imagePath = $uploader->uploadImage($_FILES["image"]);

    $imageUrl = "/" . $imagePath;

    send_response([
        "success" => true,
        "url" => $imageUrl,
        "size" => $_FILES["image"]["size"],
        "message" => "Image uploaded successfully",
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
    exit();
}
?>
