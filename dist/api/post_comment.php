<?php
require_once "api_header.php";

session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$articleId = $data["articleId"] ?? null;
$rawText = $data["text"] ?? "";
$text = $rawText;

if (!$articleId) {
    send_response(
        ["error" => "নিবন্ধ খুঁজে পাওয়া যায়নি। (Article not found)"],
        400,
    );
    exit();
}

if (!$rawText || trim($rawText) === "") {
    send_response(
        ["error" => "আপনার মন্তব্য খালি। (Comment cannot be empty)"],
        400,
    );
    exit();
}

if (strlen($rawText) < 3) {
    send_response(
        [
            "error" =>
                "মন্তব্য খুব ছোট! ন্যূনতম ৩ অক্ষর প্রয়োজন। (Minimum 3 characters required)",
        ],
        400,
    );
    exit();
}

if (strlen($rawText) > 5000) {
    send_response(
        [
            "error" =>
                "মন্তব্য খুব দীর্ঘ! সর্বোচ্চ ৫০০০ অক্ষর। (Maximum 5000 characters allowed)",
        ],
        400,
    );
    exit();
}

$userId = null;
$userName = "Anonymous";

if (isset($_SESSION["user_id"])) {
    $userId = $_SESSION["user_id"];
    $userName = $_SESSION["user_email"];
} elseif (isset($_SESSION["user_email"])) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$_SESSION["user_email"]]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($u) {
        $userId = $u["id"];
        $userName = $_SESSION["user_email"];
    }
} else {
    $userName = htmlspecialchars(
        $data["user"] ?? "Anonymous",
        ENT_QUOTES,
        "UTF-8",
    );
}

$userName = htmlspecialchars($userName, ENT_QUOTES, "UTF-8");

$stmt = $pdo->prepare(
    "INSERT INTO comments (article_id, user_id, user_name, text) VALUES (?, ?, ?, ?)",
);
$stmt->execute([$articleId, $userId, $userName, $text]);

send_response(["success" => true]);
?>
