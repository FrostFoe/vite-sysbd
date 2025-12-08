<?php
require_once "api_header.php";
session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$articleId = $data["articleId"] ?? null;
$page = (int) ($data["page"] ?? 1);
$perPage = (int) ($data["perPage"] ?? 10);
$sort = $data["sort"] ?? "newest";
$lang = $data["lang"] ?? "bn";

if (!$articleId || $page < 1) {
    send_response(["error" => "Invalid parameters"], 400);
    exit();
}

$offset = ($page - 1) * $perPage;

// Determine sorting
$orderBy = "c.created_at DESC"; // default newest
switch ($sort) {
    case "oldest":
        $orderBy = "c.created_at ASC";
        break;
    case "helpful":
        $orderBy =
            "(SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND vote_type = 'upvote') DESC, c.created_at DESC";
        break;
    case "discussed":
        $orderBy =
            "(SELECT COUNT(*) FROM comments WHERE parent_comment_id = c.id) DESC, c.created_at DESC";
        break;
}

// Get total count
$countStmt = $pdo->prepare("
    SELECT COUNT(*) as count FROM comments 
    WHERE article_id = ? AND parent_comment_id IS NULL
");
$countStmt->execute([$articleId]);
$totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)["count"];

// Get comments with pagination
$commentStmt = $pdo->prepare("
    SELECT c.id, c.text, c.created_at, c.user_name, c.user_id, c.is_pinned, c.pin_order, u.email 
    FROM comments c 
    LEFT JOIN users u ON c.user_id = u.id 
    WHERE c.article_id = ? AND c.parent_comment_id IS NULL
    ORDER BY c.is_pinned DESC, c.pin_order ASC, $orderBy
    LIMIT ? OFFSET ?
");
$commentStmt->execute([$articleId, $perPage, $offset]);
$rawComments = $commentStmt->fetchAll(PDO::FETCH_ASSOC);

$processedComments = [];
foreach ($rawComments as $c) {
    // Determine display name
    $displayName = $c["user_name"];
    if (!empty($c["email"])) {
        $parts = explode("@", $c["email"]);
        $displayName = $parts[0];
    }

    // Get votes for this comment
    $voteStmt = $pdo->prepare(
        "SELECT 
            SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
            SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
        FROM comment_votes WHERE comment_id = ?",
    );
    $voteStmt->execute([$c["id"]]);
    $votes = $voteStmt->fetch(PDO::FETCH_ASSOC);
    $upvotes = (int) ($votes["upvotes"] ?? 0);
    $downvotes = (int) ($votes["downvotes"] ?? 0);

    // Get replies for this comment
    $replyStmt = $pdo->prepare("
        SELECT c.id, c.text, c.created_at, c.user_name, c.user_id, u.email 
        FROM comments c 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.parent_comment_id = ? 
        ORDER BY c.created_at ASC
    ");
    $replyStmt->execute([$c["id"]]);
    $rawReplies = $replyStmt->fetchAll(PDO::FETCH_ASSOC);

    $replies = [];
    foreach ($rawReplies as $r) {
        $replyDisplayName = $r["user_name"];
        if (!empty($r["email"])) {
            $parts = explode("@", $r["email"]);
            $replyDisplayName = $parts[0];
        }

        // Time ago helper (simplified version)
        $timeAgo = date_diff(date_create($r["created_at"]), date_create());
        $timeStr = "ঠিক এখন";
        if ($timeAgo->i > 0) {
            $timeStr = $timeAgo->i . " মিনিট আগে";
        } elseif ($timeAgo->h > 0) {
            $timeStr = $timeAgo->h . " ঘন্টা আগে";
        } elseif ($timeAgo->d > 0) {
            $timeStr = $timeAgo->d . " দিন আগে";
        }

        $replies[] = [
            "id" => $r["id"],
            "user" => $replyDisplayName,
            "text" => htmlspecialchars($r["text"]),
            "time" => $timeStr,
            "isAdmin" =>
                !empty($r["email"]) && strpos($r["email"], "admin") !== false,
        ];
    }

    // Calculate time ago (simplified)
    $timeAgo = date_diff(date_create($c["created_at"]), date_create());
    $timeStr = "ঠিক এখন";
    if ($timeAgo->i > 0) {
        $timeStr = $timeAgo->i . " মিনিট আগে";
    } elseif ($timeAgo->h > 0) {
        $timeStr = $timeAgo->h . " ঘন্টা আগে";
    } elseif ($timeAgo->d > 0) {
        $timeStr = $timeAgo->d . " দিন আগে";
    }

    $processedComments[] = [
        "id" => $c["id"],
        "user" => $displayName,
        "text" => htmlspecialchars($c["text"]),
        "time" => $timeStr,
        "upvotes" => $upvotes,
        "downvotes" => $downvotes,
        "isPinned" => (bool) $c["is_pinned"],
        "replies" => $replies,
        "userId" => $c["user_id"],
    ];
}

$totalPages = ceil($totalCount / $perPage);

send_response([
    "success" => true,
    "comments" => $processedComments,
    "pagination" => [
        "page" => $page,
        "perPage" => $perPage,
        "totalCount" => $totalCount,
        "totalPages" => $totalPages,
        "hasNextPage" => $page < $totalPages,
        "hasPrevPage" => $page > 1,
    ],
]);
?>
