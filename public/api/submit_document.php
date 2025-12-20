<?php
require_once "api_header.php";

require_once __DIR__ . '/../lib/session.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$articleId = $_POST["article_id"] ?? null;
$message = $_POST["message"] ?? "";
$userId = $_SESSION["user_id"] ?? null;

if (!$articleId) {
    send_response(["error" => "Article ID is required"], 400);
    exit();
}

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

if (
    !isset($_FILES["document"]) ||
    $_FILES["document"]["error"] !== UPLOAD_ERR_OK
) {
    send_response(["error" => "File upload failed or no file selected"], 400);
    exit();
}

$file = $_FILES["document"];

$dangerousExtensions = [
    "php",
    "phtml",
    "php3",
    "php4",
    "php5",
    "php7",
    "php8",
    "phps",
    "pht",
    "phar",
    "html",
    "htm",
    "js",
    "jsp",
    "jspx",
    "pl",
    "py",
    "rb",
    "sh",
    "sql",
    "htaccess",
    "htpasswd",
    "exe",
    "com",
    "bat",
    "cmd",
    "pif",
    "scr",
    "vbs",
    "vbe",
    "jar",
    "shtml",
    "shtm",
    "stm",
    "asa",
    "asax",
    "ascx",
    "ashx",
    "asmx",
    "axd",
    "c",
    "cpp",
    "csharp",
    "vb",
    "asp",
    "aspx",
    "asmx",
    "swf",
    "cgi",
    "dll",
    "sys",
    "ps1",
    "psm1",
    "psd1",
    "reg",
    "msi",
    "msp",
    "lnk",
    "inf",
    "application",
    "gadget",
    "hta",
    "cpl",
    "msc",
    "ws",
    "wsf",
    "wsh",
    "jse",
];

$originalExt = pathinfo($file["name"], PATHINFO_EXTENSION);
if (in_array(strtolower($originalExt), $dangerousExtensions)) {
    send_response(
        [
            "error" =>
                "File type not allowed (potentially dangerous): ." .
                $originalExt,
        ],
        400,
    );
    exit();
}

$allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "text/plain",
];
$maxSize = 10 * 1024 * 1024;

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

$extension = pathinfo($file["name"], PATHINFO_EXTENSION);
$filename = "sub_" . time() . "_" . uniqid() . "." . $extension;
$destination = $uploadDir . $filename;

if (move_uploaded_file($file["tmp_name"], $destination)) {
    $stmt = $pdo->prepare(
        "INSERT INTO article_submissions (article_id, user_id, file_path, message) VALUES (?, ?, ?, ?)",
    );

    $dbPath = "/assets/uploads/submissions/" . $filename;

    if ($stmt->execute([$articleId, $userId, $dbPath, $message])) {
        send_response([
            "success" => true,
            "message" => "Document submitted successfully!",
        ]);
    } else {
        unlink($destination);
        send_response(["error" => "Database error"], 500);
    }
} else {
    send_response(["error" => "Failed to move uploaded file"], 500);
}
?>
