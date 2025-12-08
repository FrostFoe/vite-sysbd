<?php
session_start();
require_once "../../src/config/db.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit();
}

$userId = $_SESSION["user_id"];
$data = json_decode(file_get_contents("php://input"), true);
$messageIds = $data["message_ids"] ?? [];

if (empty($messageIds)) {
    echo json_encode([
        "success" => false,
        "error" => "No message IDs provided",
    ]);
    exit();
}

try {
    $placeholders = implode(",", array_fill(0, count($messageIds), "?"));
    $stmt = $pdo->prepare("
        UPDATE messages 
        SET is_read = 1, read_at = NOW()
        WHERE id IN ($placeholders) AND recipient_id = ?
    ");

    $params = array_merge($messageIds, [$userId]);
    $stmt->execute($params);

    echo json_encode(["success" => true, "updated" => $stmt->rowCount()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
