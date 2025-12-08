<?php
require_once "api_header.php";
session_start();

// --- Authorization Check ---
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    send_response(["error" => "Unauthorized"], 403);
    exit();
}
// --- End Authorization Check ---

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    send_response(["error" => "Method not allowed"], 405);
}

try {
    $stats = [
        "articles" => $pdo
            ->query("SELECT COUNT(*) FROM articles")
            ->fetchColumn(),
        "comments" => $pdo
            ->query("SELECT COUNT(*) FROM comments")
            ->fetchColumn(),
        "drafts" => $pdo
            ->query("SELECT COUNT(*) FROM articles WHERE status = 'draft'")
            ->fetchColumn(),
        "users" => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
    ];

    send_response(["success" => true, "stats" => $stats]);
} catch (PDOException $e) {
    error_log("Admin stats database error: " . $e->getMessage());
    send_response(["success" => false, "error" => "Database error"], 500);
}
?>
