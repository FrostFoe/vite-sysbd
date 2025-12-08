<?php
session_start();
require_once "../../src/config/db.php";

header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit();
}

$userId = $_SESSION["user_id"];
$isAdmin = $_SESSION["user_role"] === "admin";

// Get request data
$data = json_decode(file_get_contents("php://input"), true);
$recipientId = $data["recipient_id"] ?? null;
$content = $data["content"] ?? null;

if (!$recipientId || !$content) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing recipient or content",
    ]);
    exit();
}

// Validate content
if (strlen(trim($content)) < 1) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Message cannot be empty",
    ]);
    exit();
}

if (strlen($content) > 5000) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Message too long (max 5000 chars)",
    ]);
    exit();
}

try {
    // Users can only message admin, admins can message any user
    if (!$isAdmin && $recipientId != 1) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "error" => "Users can only message admin",
        ]);
        exit();
    }

    // Insert message
    $stmt = $pdo->prepare("
        INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, content, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $senderType = $isAdmin ? "admin" : "user";
    $recipientType = $isAdmin ? "user" : "admin";

    $stmt->execute([
        $userId,
        $senderType,
        $recipientId,
        $recipientType,
        $content,
    ]);

    echo json_encode([
        "success" => true,
        "message_id" => $pdo->lastInsertId(),
        "timestamp" => date("Y-m-d H:i:s"),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
    
    $senderType = $isAdmin ? "admin" : "user";
    $recipientType = $isAdmin ? "user" : "admin";
    
    $success = $stmt->execute([
        $sender_id,
        $senderType,
        $recipient_id,
        $recipientType,
        $subject ?: null,
        $content
    ]);

    if ($success) {
        $messageId = $pdo->lastInsertId();
        echo json_encode([
            "success" => true,
            "message" => "Message sent successfully",
            "id" => $messageId,
            "created_at" => date("Y-m-d H:i:s")
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to send message"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error: " . $e->getMessage()]);
}
