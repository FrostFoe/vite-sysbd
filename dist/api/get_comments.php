<?php
require_once "api_header.php";
require_once __DIR__ . '/../lib/session.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$articleId = validateAndSanitize($data["articleId"] ?? null, "int");
$page = validateAndSanitize($data["page"] ?? 1, "int");
$sort = validateAndSanitize($data["sort"] ?? "newest", "string");
$lang = validateAndSanitize($data["lang"] ?? "bn", "string");

if (!$articleId || $page < 1) {
    send_response(["error" => "Invalid parameters"], 400);
    exit();
}

$pagination = new Pagination($page, DEFAULT_PAGE_SIZE);

$orderBy = "c.created_at DESC";
switch ($sort) {
    case "oldest":
        $orderBy = "c.created_at ASC";
        break;
    case "helpful":
        $orderBy = "upvotes DESC, c.created_at DESC";
        break;
    case "discussed":
        $orderBy = "reply_count DESC, c.created_at DESC";
        break;
}

$countStmt = $pdo->prepare("
    SELECT COUNT(*) as count FROM comments
    WHERE article_id = ? AND parent_comment_id IS NULL
");
$countStmt->execute([$articleId]);
$totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)["count"];

$pagination = new Pagination($page, DEFAULT_PAGE_SIZE, $totalCount);

$commentStmt = $pdo->prepare(
    "
    SELECT
        c.id, c.text, c.created_at, c.user_name, c.user_id, c.is_pinned, c.pin_order,
        COALESCE(u.email, '') as email,
        COALESCE(v.upvotes, 0) as upvotes,
        COALESCE(v.downvotes, 0) as downvotes,
        COALESCE(r.reply_count, 0) as reply_count
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN (
        SELECT
            comment_id,
            SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
            SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
        FROM comment_votes
        GROUP BY comment_id
    ) v ON c.id = v.comment_id
    LEFT JOIN (
        SELECT
            parent_comment_id,
            COUNT(*) as reply_count
        FROM comments
        WHERE parent_comment_id IS NOT NULL
        GROUP BY parent_comment_id
    ) r ON c.id = r.parent_comment_id
    WHERE c.article_id = ? AND c.parent_comment_id IS NULL
    ORDER BY c.is_pinned DESC, c.pin_order ASC, " .
        $orderBy .
        "
    " .
        $pagination->getLimitClause(),
);
$commentStmt->execute([$articleId]);
$rawComments = $commentStmt->fetchAll(PDO::FETCH_ASSOC);

$processedComments = [];
foreach ($rawComments as $c) {
    $displayName = $c["user_name"];
    if (!empty($c["email"])) {
        $parts = explode("@", $c["email"]);
        $displayName = $parts[0];
    }

    $replyStmt = $pdo->prepare("
        SELECT
            c.id, c.text, c.created_at, c.user_name, c.user_id,
            COALESCE(u.email, '') as email,
            COALESCE(v.upvotes, 0) as upvotes,
            COALESCE(v.downvotes, 0) as downvotes
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN (
            SELECT
                comment_id,
                SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
                SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
            FROM comment_votes
            GROUP BY comment_id
        ) v ON c.id = v.comment_id
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

        $replies[] = [
            "id" => $r["id"],
            "user" => $replyDisplayName,
            "text" => htmlspecialchars($r["text"]),
            "time" => time_ago($r["created_at"], $lang),
            "upvotes" => (int) $r["upvotes"],
            "downvotes" => (int) $r["downvotes"],
            "isAdmin" =>
                !empty($r["email"]) && strpos($r["email"], "admin") !== false,
        ];
    }

    $processedComments[] = [
        "id" => $c["id"],
        "user" => $displayName,
        "text" => htmlspecialchars($c["text"]),
        "time" => time_ago($c["created_at"], $lang),
        "upvotes" => (int) $c["upvotes"],
        "downvotes" => (int) $c["downvotes"],
        "isPinned" => (bool) $c["is_pinned"],
        "replies" => $replies,
        "userId" => $c["user_id"],
    ];
}

send_response([
    "success" => true,
    "comments" => $processedComments,
    "pagination" => $pagination->toArray(),
]);
?>
