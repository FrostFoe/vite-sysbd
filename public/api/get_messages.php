<?php
session_start();
require_once __DIR__ . "/../config/db.php";

header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit();
}

$userId = $_SESSION["user_id"];
$isAdmin = $_SESSION["user_role"] === "admin";
$otherUserId = $_GET["user_id"] ?? null;

if (!$otherUserId) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing user_id"]);
    exit();
}

try {
    // Fetch all messages between current user and the other user
    $stmt = $pdo->prepare("
        SELECT 
            id,
            sender_id,
            sender_type,
            recipient_id,
            content,
            created_at
        FROM messages
        WHERE (sender_id = ? AND recipient_id = ?) 
           OR (sender_id = ? AND recipient_id = ?)
        ORDER BY created_at ASC
        LIMIT 500
    ");

    $stmt->execute([$userId, $otherUserId, $otherUserId, $userId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "messages" => $messages,
        "count" => count($messages),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
