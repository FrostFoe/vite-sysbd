<?php
require_once "api_header.php";
session_start();

// --- Authorization Check ---
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    send_response(["error" => "Unauthorized"], 403);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
}

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data["userId"] ?? null;
$action = $data["action"] ?? "mute"; // 'mute' or 'unmute'
$reason = $data["reason"] ?? null;
$adminId = $_SESSION["user_id"];

if (!$userId) {
    send_response(["error" => "User ID required"], 400);
}

if ($userId == $adminId) {
    send_response(["error" => "Cannot mute yourself"], 400);
}

try {
    if ($action === "mute") {
        $stmt = $pdo->prepare(
            "INSERT INTO muted_users (user_id, muted_by_admin_id, reason, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE reason = ?, created_at = NOW()",
        );
        $stmt->execute([$userId, $adminId, $reason, $reason]);
        send_response(["success" => true, "message" => "User muted"]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM muted_users WHERE user_id = ?");
        $stmt->execute([$userId]);
        send_response(["success" => true, "message" => "User unmuted"]);
    }
} catch (PDOException $e) {
    send_response(["success" => false, "error" => $e->getMessage()], 500);
}
?>
