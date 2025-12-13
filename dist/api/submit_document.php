<?php
require_once "api_header.php";

session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$articleId = $_POST["article_id"] ?? null;
$message = $_POST["message"] ?? "";
$userId = $_SESSION["user_id"] ?? null; // Null if anonymous

if (!$articleId) {
    send_response(["error" => "Article ID is required"], 400);
    exit();
}

// Check if submissions are allowed for this article
$stmt = $pdo->prepare("SELECT allow_submissions FROM articles WHERE id = ?");
$stmt->execute([$articleId]);
$article = $stmt->fetch();

if (!$article) {
    send_response(["error" => "Article not found"], 404);
    exit();
}

if (!$article["allow_submissions"]) {
    send_response(
        ["error" => "Submissions are turned off for this article"],
        403,
    );
    exit();
}

// Handle File Upload
if (
    !isset($_FILES["document"]) ||
    $_FILES["document"]["error"] !== UPLOAD_ERR_OK
) {
    send_response(["error" => "File upload failed or no file selected"], 400);
    exit();
}

$file = $_FILES["document"];
$allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "text/plain",
];
$maxSize = 10 * 1024 * 1024; // 10MB

if (!in_array($file["type"], $allowedTypes)) {
    send_response(
        [
            "error" =>
                "Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, TXT are allowed.",
        ],
        400,
    );
    exit();
}

if ($file["size"] > $maxSize) {
    send_response(["error" => "File too large. Max 10MB."], 400);
    exit();
}

$uploadDir = "../assets/uploads/submissions/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate unique filename
$extension = pathinfo($file["name"], PATHINFO_EXTENSION);
$filename = "sub_" . time() . "_" . uniqid() . "." . $extension;
$destination = $uploadDir . $filename;

if (move_uploaded_file($file["tmp_name"], $destination)) {
    // Save to DB
    $stmt = $pdo->prepare(
        "INSERT INTO article_submissions (article_id, user_id, file_path, message) VALUES (?, ?, ?, ?)",
    );

    // Store relative path for DB
    $dbPath = "/assets/uploads/submissions/" . $filename;

    if ($stmt->execute([$articleId, $userId, $dbPath, $message])) {
        send_response([
            "success" => true,
            "message" => "Document submitted successfully!",
        ]);
    } else {
        unlink($destination); // Delete file if DB insert fails
        send_response(["error" => "Database error"], 500);
    }
} else {
    send_response(["error" => "Failed to move uploaded file"], 500);
}
?>
