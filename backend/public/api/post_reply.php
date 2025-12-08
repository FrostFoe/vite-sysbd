<?php
require_once "api_header.php";
session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

// Only admin can reply
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    send_response(["error" => "Only admin can reply to comments"], 403);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$parentCommentId = $data["parentCommentId"] ?? null;
$text = $data["text"] ?? "";

if (!$parentCommentId || !$text) {
    send_response(
        ["error" => "Missing required fields (parentCommentId, text)"],
        400,
    );
    exit();
}

// Verify parent comment exists
$stmt = $pdo->prepare("SELECT article_id FROM comments WHERE id = ?");
$stmt->execute([$parentCommentId]);
$parent = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$parent) {
    send_response(["error" => "Parent comment not found"], 404);
    exit();
}

$userId = $_SESSION["user_id"] ?? null;
$userName = "Admin"; // Force name for replies
$articleId = $parent["article_id"];

// Insert reply as a comment with parent_comment_id
$stmt = $pdo->prepare(
    "INSERT INTO comments (article_id, user_id, user_name, text, parent_comment_id) VALUES (?, ?, ?, ?, ?)",
);
$stmt->execute([$articleId, $userId, $userName, $text, $parentCommentId]);

send_response([
    "success" => true,
    "replyId" => $pdo->lastInsertId(),
    "message" => "Reply posted successfully",
]);
?>
