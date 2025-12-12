<?php
session_start();
require_once __DIR__ . "/../config/db.php";
require_once "api_header.php";

if (!isset($_SESSION["user_id"])) {
    send_response(["success" => false, "error" => "Unauthorized"], 401);
    exit();
}

$userId = $_SESSION["user_id"];
$isAdmin = $_SESSION["user_role"] === "admin";
$otherUserId = $_POST["user_id"] ?? null;

if (!$otherUserId) {
    send_response(["success" => false, "error" => "Missing user_id"], 400);
    exit();
}

try {
    // Mark messages as read where:
    // 1. The other user sent messages to the current user
    // 2. Messages are currently in 'sent' or 'delivered' status 
    $stmt = $pdo->prepare("
        UPDATE messages 
        SET status = 'read' 
        WHERE sender_id = ? 
          AND recipient_id = ? 
          AND status IN ('sent', 'delivered')
    ");

    $stmt->execute([$otherUserId, $userId]);
    
    $updatedCount = $stmt->rowCount();

    send_response([
        "success" => true,
        "updated_count" => $updatedCount,
    ]);
} catch (Exception $e) {
    send_response(["success" => false, "error" => $e->getMessage()], 500);
}
?>