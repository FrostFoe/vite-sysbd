<?php
require_once "../config/db.php";
require_once "../lib/security.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    $stmt = $pdo->query('
        SELECT 
            id, email, role, created_at
        FROM users
        ORDER BY created_at DESC
    ');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query('
        SELECT 
            id, title_bn, title_en, summary_bn, summary_en, 
            category_id, section_id, status, image, created_at, published_at
        FROM articles
        ORDER BY created_at DESC
    ');
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query('
        SELECT 
            c.id, c.text, c.article_id, c.user_id, c.created_at,
            u.email as user_email, a.title_bn, a.title_en
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN articles a ON c.article_id = a.id
        ORDER BY c.created_at DESC
    ');
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query('
        SELECT 
            s.id, s.article_id, s.user_id, s.file_path, s.message, s.created_at,
            a.title_bn, a.title_en
        FROM article_submissions s
        LEFT JOIN articles a ON s.article_id = a.id
        ORDER BY s.created_at DESC
    ');
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $exportData = [
        "exported_at" => date("Y-m-d H:i:s"),
        "total_users" => count($users),
        "total_articles" => count($articles),
        "total_comments" => count($comments),
        "total_submissions" => count($submissions),
        "users" => $users,
        "articles" => $articles,
        "comments" => $comments,
        "submissions" => $submissions,
    ];

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $exportData,
    ]);
} catch (Exception $e) {
    error_log("Export data error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "সার্ভার ত্রুটি"]);
}
