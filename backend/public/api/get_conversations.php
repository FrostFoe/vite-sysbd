<?php
session_start();
require_once "../../src/config/db.php";

header("Content-Type: application/json");

// Check if admin is logged in
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Admin access required"]);
    exit();
}

$adminId = $_SESSION["user_id"] ?? null;
$sortBy = $_GET["sort"] ?? "latest";

if (!$adminId) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit();
}

try {
    // Get all unique user IDs that have messages with admin
    $userIds = $pdo
        ->query(
            "
        SELECT DISTINCT CASE 
            WHEN sender_id IN (SELECT id FROM users WHERE role = 'user') THEN sender_id 
            ELSE recipient_id 
        END as user_id
        FROM messages
    ",
        )
        ->fetchAll(PDO::FETCH_ASSOC);

    $conversations = [];

    foreach ($userIds as $row) {
        $userId = $row["user_id"];

        // Get user info
        $userStmt = $pdo->prepare(
            "SELECT id, email, created_at FROM users WHERE id = ?",
        );
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            continue;
        }

        // Get last message
        $msgStmt = $pdo->prepare("
            SELECT content, created_at, sender_id 
            FROM messages
            WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $msgStmt->execute([$userId, $adminId, $adminId, $userId]);
        $lastMsg = $msgStmt->fetch(PDO::FETCH_ASSOC);

        // Get unread count
        $unreadStmt = $pdo->prepare("
            SELECT COUNT(*) as count FROM messages
            WHERE sender_id = ? AND recipient_id = ? AND is_read = 0
        ");
        $unreadStmt->execute([$userId, $adminId]);
        $unread = $unreadStmt->fetch(PDO::FETCH_ASSOC);

        $conversations[] = [
            "user_id" => $user["id"],
            "email" => $user["email"],
            "user_joined" => $user["created_at"],
            "last_message" => $lastMsg["content"] ?? null,
            "last_message_time" => $lastMsg["created_at"] ?? null,
            "last_sender_id" => $lastMsg["sender_id"] ?? null,
            "unread_count" => (int) ($unread["count"] ?? 0),
        ];
    }

    // Sort conversations
    if ($sortBy === "unread") {
        usort($conversations, function ($a, $b) {
            if ($b["unread_count"] != $a["unread_count"]) {
                return $b["unread_count"] - $a["unread_count"];
            }
            return strtotime($b["last_message_time"] ?? 0) -
                strtotime($a["last_message_time"] ?? 0);
        });
    } elseif ($sortBy === "oldest") {
        usort($conversations, function ($a, $b) {
            return strtotime($a["last_message_time"] ?? 0) -
                strtotime($b["last_message_time"] ?? 0);
        });
    } else {
        usort($conversations, function ($a, $b) {
            return strtotime($b["last_message_time"] ?? 0) -
                strtotime($a["last_message_time"] ?? 0);
        });
    }

    echo json_encode([
        "success" => true,
        "conversations" => $conversations,
        "count" => count($conversations),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
