<?php
require_once "api_header.php";
session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$parentCommentId = $data["parentCommentId"] ?? null;
$text = $data["text"] ?? "";
$lang = $data["lang"] ?? "bn";

if (!$parentCommentId || !$text) {
    send_response(
        ["error" => "Missing required fields (parentCommentId, text)"],
        400,
    );
    exit();
}

// Trim and validate text
$text = trim($text);
if (strlen($text) < 1 || strlen($text) > 5000) {
    send_response(
        ["error" => "Reply text must be between 1 and 5000 characters"],
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

// Get user info from session or use anonymous
$userId = isset($_SESSION["user_id"]) ? $_SESSION["user_id"] : null;
$userName = isset($_SESSION["user_name"])
    ? $_SESSION["user_name"]
    : "Anonymous";

if (!$userName || empty(trim($userName))) {
    $userName = "Anonymous User";
}

$articleId = $parent["article_id"];

try {
    // Insert reply as a comment with parent_comment_id
    $stmt = $pdo->prepare(
        "INSERT INTO comments (article_id, user_id, user_name, text, parent_comment_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
    );
    $stmt->execute([$articleId, $userId, $userName, $text, $parentCommentId]);

    $replyId = $pdo->lastInsertId();

    // Get the inserted reply with formatted response
    $stmt = $pdo->prepare(
        "SELECT id, user_name, text, created_at FROM comments WHERE id = ?",
    );
    $stmt->execute([$replyId]);
    $reply = $stmt->fetch(PDO::FETCH_ASSOC);

    send_response([
        "success" => true,
        "replyId" => $replyId,
        "reply" => [
            "id" => $reply["id"],
            "user" => $reply["user_name"],
            "text" => htmlspecialchars($reply["text"]),
            "time" => time_ago($reply["created_at"], $lang),
        ],
        "message" => "Reply posted successfully",
    ]);
} catch (PDOException $e) {
    send_response(
        ["error" => "Failed to post reply: " . $e->getMessage()],
        500,
    );
}
?>

