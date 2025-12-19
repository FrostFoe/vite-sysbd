<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/security.php";
require_once __DIR__ . "/../lib/functions.php";

header("Content-Type: application/json");

$lang = isset($_GET["lang"]) && $_GET["lang"] === "en" ? "en" : "bn";
$articleId = isset($_GET["id"]) ? $_GET["id"] : null;

if (!$articleId) {
    echo json_encode(["error" => "Article ID required"]);
    http_response_code(400);
    exit();
}

// Fetch article
$stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
$stmt->execute([$articleId]);
$articleRaw = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$articleRaw) {
    echo json_encode(["error" => "Article not found"]);
    http_response_code(404);
    exit();
}

// Check status
$status = $articleRaw["status"] ?? "published";
// In a real API, we might check session for admin role to allow drafts
// For now, let's strict check or allow if session says admin
session_start();
$isAdmin = isset($_SESSION["user_role"]) && $_SESSION["user_role"] === "admin";

if ($status !== "published" && !$isAdmin) {
    echo json_encode(["error" => "Article not published"]);
    http_response_code(403);
    exit();
}

// Map localized fields
$article = [
    "id" => $articleRaw["id"],
    "title_bn" => $articleRaw["title_bn"],
    "title_en" => $articleRaw["title_en"],
    "summary_bn" => $articleRaw["summary_bn"],
    "summary_en" => $articleRaw["summary_en"],
    "content_bn" => $articleRaw["content_bn"],
    "content_en" => $articleRaw["content_en"],
    "title" =>
        $lang === "en" ? $articleRaw["title_en"] : $articleRaw["title_bn"],
    "summary" =>
        $lang === "en" ? $articleRaw["summary_en"] : $articleRaw["summary_bn"],
    "content" =>
        $lang === "en" ? $articleRaw["content_en"] : $articleRaw["content_bn"],
    "readTime" =>
        $lang === "en"
            ? $articleRaw["read_time_en"] ?? ""
            : $articleRaw["read_time_bn"] ?? "",
    "image" => $articleRaw["image"],
    "meta_title" => $articleRaw["meta_title"] ?? null,
    "meta_description" => $articleRaw["meta_description"] ?? null,
    "meta_keywords" => $articleRaw["meta_keywords"] ?? null,
    "published_at" => $articleRaw["published_at"],
    "category_id" => $articleRaw["category_id"],
    "section_id" => $articleRaw["section_id"],
    "allow_submissions" => (bool) $articleRaw["allow_submissions"],
    "status" => $status,
];

// Fallback
if (empty($article["title"])) {
    $article["title"] =
        $lang === "en" ? $articleRaw["title_bn"] : $articleRaw["title_en"];
    $article["content"] =
        $lang === "en" ? $articleRaw["content_bn"] : $articleRaw["content_en"];
    $article["fallback_lang"] = true;
}

// Fetch Category Name
$categoryName = "News";
if ($articleRaw["category_id"]) {
    $catStmt = $pdo->prepare(
        "SELECT title_bn, title_en FROM categories WHERE id = ?",
    );
    $catStmt->execute([$articleRaw["category_id"]]);
    $cat = $catStmt->fetch(PDO::FETCH_ASSOC);
    if ($cat) {
        $categoryName = $lang === "en" ? $cat["title_en"] : $cat["title_bn"];
    }
}
$article["category"] = $categoryName;

// Fetch Comments with pre-joined vote counts
$commentStmt = $pdo->prepare("
    SELECT
        c.id, c.text, c.created_at, c.user_name, c.user_id, c.is_pinned, c.pin_order,
        u.email,
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
    WHERE c.article_id = ? AND c.parent_comment_id IS NULL
    ORDER BY c.is_pinned DESC, c.pin_order ASC, c.created_at DESC
");
$commentStmt->execute([$articleId]);
$rawComments = $commentStmt->fetchAll(PDO::FETCH_ASSOC);

$processedComments = [];
foreach ($rawComments as $c) {
    $displayName = $c["user_name"];
    if (!empty($c["email"])) {
        $parts = explode("@", $c["email"]);
        $displayName = $parts[0];
    }

    // Replies with pre-joined vote counts
    $replyStmt = $pdo->prepare("
        SELECT
            c.id, c.text, c.created_at, c.user_name, c.user_id, u.email,
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
            "text" => $r["text"],
            "time" => time_ago($r["created_at"], $lang),
            "created_at" => $r["created_at"],
            "upvotes" => (int) ($r["upvotes"] ?? 0),
            "downvotes" => (int) ($r["downvotes"] ?? 0),
            "isAdmin" =>
                !empty($r["email"]) && strpos($r["email"], "admin") !== false,
        ];
    }

    $processedComments[] = [
        "id" => $c["id"],
        "user" => $displayName,
        "text" => $c["text"],
        "time" => time_ago($c["created_at"], $lang),
        "created_at" => $c["created_at"],
        "upvotes" => (int) $c["upvotes"],
        "downvotes" => (int) $c["downvotes"],
        "isPinned" => (bool) $c["is_pinned"],
        "replies" => $replies,
        "userId" => $c["user_id"],
    ];
}
$article["comments"] = $processedComments;

// Leaked Documents
$leakedDocuments = [];
if (!empty($articleRaw["leaked_documents"])) {
    $leakedDocuments = json_decode($articleRaw["leaked_documents"], true);
}
$article["leaked_documents"] = $leakedDocuments;

// Downloadable Documents
$docsStmt = $pdo->prepare(
    "SELECT id, display_name_bn, display_name_en, file_type, file_path, download_url, description_bn, description_en, file_size FROM documents WHERE article_id = ? ORDER BY sort_order ASC",
);
$docsStmt->execute([$articleId]);
$articleDocuments = $docsStmt->fetchAll(PDO::FETCH_ASSOC);
$article["documents"] = $articleDocuments;

echo json_encode(["success" => true, "article" => $article]);
?>
