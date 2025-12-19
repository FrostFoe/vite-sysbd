<?php
require_once "../config/db.php";
require_once "../lib/security.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["userId"])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "ব্যবহারকারী ID প্রয়োজন",
    ]);
    exit();
}

$userId = intval($data["userId"]);

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "error" => "ব্যবহারকারী পাওয়া যায়নি",
        ]);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    $stmt = $pdo->prepare("DELETE FROM comments WHERE user_id = ?");
    $stmt->execute([$userId]);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "ব্যবহারকারী সফলভাবে ডিলিট হয়েছে",
    ]);
} catch (Exception $e) {
    error_log("Delete user error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "সার্ভার ত্রুটি"]);
}
