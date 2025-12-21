<?php
require_once "api_header.php";
require_once __DIR__ . "/../lib/session.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data["userId"] ?? null;
$userName = $data["userName"] ?? null;

if (!$userId && !$userName) {
    send_response(["error" => "User ID or name required"], 400);
    exit();
}

$userStmt = $pdo->prepare(
    "SELECT id, email FROM users WHERE id = ? OR email = ?",
);
$userStmt->execute([$userId, $userName]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    send_response(["error" => "User not found"], 404);
    exit();
}

$userId = $user["id"];
$email = $user["email"];

$displayName = explode("@", $email)[0];

$commentStmt = $pdo->prepare("
    SELECT COUNT(*) as count FROM comments 
    WHERE user_id = ? OR user_name = ?
");
$commentStmt->execute([$userId, $displayName]);
$commentCount = $commentStmt->fetch(PDO::FETCH_ASSOC)["count"];

$recentStmt = $pdo->prepare("
    SELECT c.text, c.created_at, 
        (SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND vote_type = 'upvote') as up
    FROM comments c
    WHERE c.user_id = ? OR c.user_name = ?
    ORDER BY c.created_at DESC
    LIMIT 5
");
$recentStmt->execute([$userId, $displayName]);
$recentComments = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

send_response([
    "success" => true,
    "profile" => [
        "displayName" => htmlspecialchars($displayName),
        "email" => htmlspecialchars($email),
        "commentCount" => $commentCount,
        "upvotes" => $upvotes,
        "recentComments" => array_map(function ($c) {
            return [
                "text" =>
                    htmlspecialchars(substr($c["text"], 0, 100)) .
                    (strlen($c["text"]) > 100 ? "..." : ""),
                "upvotes" => $c["up"],
                "time" => date("M d, Y", strtotime($c["created_at"])),
            ];
        }, $recentComments),
    ],
]);
?>
