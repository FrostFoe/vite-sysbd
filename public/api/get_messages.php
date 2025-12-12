<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/CacheManager.php";
require_once "api_header.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    send_response(["success" => false, "error" => "Unauthorized"], 401);
    exit();
}

$userId = $_SESSION["user_id"];
$isAdmin = $_SESSION["user_role"] === "admin";
$otherUserId = $_GET["user_id"] ?? null;

if (!$otherUserId) {
    send_response(["success" => false, "error" => "Missing user_id"], 400);
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
            type,
            status,
            created_at
        FROM messages
        WHERE (sender_id = ? AND recipient_id = ?)
           OR (sender_id = ? AND recipient_id = ?)
        ORDER BY created_at ASC
        LIMIT 500
    ");

    $stmt->execute([$userId, $otherUserId, $otherUserId, $userId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    send_response([
        "success" => true,
        "messages" => $messages,
        "count" => count($messages),
    ]);
} catch (Exception $e) {
    send_response(["success" => false, "error" => $e->getMessage()], 500);
}
?>