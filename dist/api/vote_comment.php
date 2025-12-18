<?php
require_once "api_header.php";
session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$commentId = $data["commentId"] ?? null;
$voteType = $data["voteType"] ?? null; // 'upvote' or 'downvote'

if (!$commentId || !in_array($voteType, ["upvote", "downvote"])) {
    send_response(
        ["error" => "Missing or invalid fields (commentId, voteType)"],
        400,
    );
    exit();
}

// Verify comment exists
$stmt = $pdo->prepare("SELECT id FROM comments WHERE id = ?");
$stmt->execute([$commentId]);
if (!$stmt->fetch()) {
    send_response(["error" => "Comment not found"], 404);
    exit();
}

$userId = isset($_SESSION["user_id"]) ? $_SESSION["user_id"] : null;
$userIp = $_SERVER["REMOTE_ADDR"];

// Check if user already voted
$checkStmt = $pdo->prepare(
    "SELECT id, vote_type FROM comment_votes WHERE comment_id = ? AND (user_id = ? OR user_ip = ?)",
);
$checkStmt->execute([$commentId, $userId, $userIp]);
$existingVote = $checkStmt->fetch(PDO::FETCH_ASSOC);

if ($existingVote) {
    if ($existingVote["vote_type"] === $voteType) {
        // Remove vote (toggle off)
        $deleteStmt = $pdo->prepare("DELETE FROM comment_votes WHERE id = ?");
        $deleteStmt->execute([$existingVote["id"]]);
        $action = "removed";
    } else {
        // Change vote
        $updateStmt = $pdo->prepare(
            "UPDATE comment_votes SET vote_type = ? WHERE id = ?",
        );
        $updateStmt->execute([$voteType, $existingVote["id"]]);
        $action = "changed";
    }
} else {
    // Add new vote
    $insertStmt = $pdo->prepare(
        "INSERT INTO comment_votes (comment_id, user_id, user_ip, vote_type) VALUES (?, ?, ?, ?)",
    );
    $insertStmt->execute([$commentId, $userId, $userIp, $voteType]);
    $action = "added";
}

// Calculate vote counts
$countStmt = $pdo->prepare(
    "SELECT 
        SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
    FROM comment_votes WHERE comment_id = ?",
);
$countStmt->execute([$commentId]);
$counts = $countStmt->fetch(PDO::FETCH_ASSOC);

send_response([
    "success" => true,
    "action" => $action,
    "upvotes" => (int) ($counts["upvotes"] ?? 0),
    "downvotes" => (int) ($counts["downvotes"] ?? 0),
    "score" =>
        (int) ($counts["upvotes"] ?? 0) - (int) ($counts["downvotes"] ?? 0),
]);
?>
