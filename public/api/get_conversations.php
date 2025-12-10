<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/CacheManager.php";
require_once "api_header.php";

session_start();

// Check if admin is logged in
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    send_response(
        ["success" => false, "error" => "Admin access required"],
        403,
    );
    exit();
}

$adminId = $_SESSION["user_id"] ?? null;
$sortBy = $_GET["sort"] ?? "latest";

if (!$adminId) {
    send_response(["success" => false, "error" => "Unauthorized"], 401);
    exit();
}

// Create cache key for admin conversations
$cache = new CacheManager();
$cacheKey = $cache->generateKey(["admin_conversations", $adminId, $sortBy]);

// Try to get from cache first (admin conversations change less frequently)
$cachedConversations = $cache->get($cacheKey);
if ($cachedConversations) {
    send_response($cachedConversations);
    exit();
}

try {
    // Get all conversation partners with counts in a single query
    $sql = "
        SELECT
            u.id as user_id,
            u.email,
            u.created_at as user_joined,
            (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND recipient_id = ?) as unread_count,
            (SELECT MAX(created_at) FROM messages WHERE (sender_id = ? AND recipient_id = u.id) OR (sender_id = u.id AND recipient_id = ?)) as last_msg_time
        FROM users u
        WHERE u.id IN (
            -- Users who have sent or received messages with admin
            SELECT DISTINCT
                CASE
                    WHEN sender_id = ? THEN recipient_id
                    ELSE sender_id
                END
            FROM messages
            WHERE (sender_id = ? OR recipient_id = ?)
              AND u.role = 'user'
        )
        AND u.role = 'user'
        ORDER BY last_msg_time DESC
    ";

    $stmt = $pdo->prepare($sql);
    $params = [$adminId, $adminId, $adminId, $adminId, $adminId, $adminId];
    $stmt->execute($params);
    $raw_conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $conversations = [];
    foreach ($raw_conversations as $row) {
        // Get the last message content for this user
        $msg_sql = "
            SELECT content, created_at, sender_id
            FROM messages
            WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
            ORDER BY created_at DESC
            LIMIT 1
        ";
        $msg_stmt = $pdo->prepare($msg_sql);
        $msg_stmt->execute([
            $row["user_id"],
            $adminId,
            $adminId,
            $row["user_id"],
        ]);
        $last_msg = $msg_stmt->fetch(PDO::FETCH_ASSOC);

        $conversations[] = [
            "user_id" => $row["user_id"],
            "email" => $row["email"],
            "user_joined" => $row["user_joined"],
            "last_message" => $last_msg["content"] ?? null,
            "last_message_time" => $last_msg["created_at"] ?? null,
            "last_sender_id" => $last_msg["sender_id"] ?? null,
            "unread_count" => (int) ($row["unread_count"] ?? 0),
        ];
    }

    // Apply sorting based on parameter after fetching data
    if ($sortBy === "unread") {
        usort($conversations, function ($a, $b) {
            if ($b["unread_count"] !== $a["unread_count"]) {
                return $b["unread_count"] - $a["unread_count"];
            }
            return strtotime($b["last_message_time"] ?? "1970-01-01") -
                strtotime($a["last_message_time"] ?? "1970-01-01");
        });
    } elseif ($sortBy === "oldest") {
        usort($conversations, function ($a, $b) {
            return strtotime($a["last_message_time"] ?? "1970-01-01") -
                strtotime($b["last_message_time"] ?? "1970-01-01");
        });
    }

    $result = [
        "success" => true,
        "conversations" => $conversations,
        "count" => count($conversations),
    ];

    // Cache for 2 minutes since conversations might change as new messages arrive
    $cache->set($cacheKey, $result, 120);

    send_response($result);
} catch (Exception $e) {
    send_response(["success" => false, "error" => $e->getMessage()], 500);
}
?>
