<?php
require_once "../config/db.php";
require_once "../lib/security.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["userId"])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "ব্যবহারকারী ID প্রয়োজন",
    ]);
    exit();
}

$userId = intval($data["userId"]);
$email = isset($data["email"]) ? trim($data["email"]) : null;
$role = isset($data["role"]) ? trim($data["role"]) : null;
$password = isset($data["password"]) ? trim($data["password"]) : null;

try {
    $stmt = $pdo->prepare("SELECT id, email FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "error" => "ব্যবহারকারী পাওয়া যায়নি",
        ]);
        exit();
    }

    if ($email && $email !== $user["email"]) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "error" => "বৈধ ইমেল প্রবেশ করুন",
            ]);
            exit();
        }

        $stmt = $pdo->prepare(
            "SELECT id FROM users WHERE email = ? AND id != ?",
        );
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "error" => "এই ইমেল ইতিমধ্যে ব্যবহৃত",
            ]);
            exit();
        }
    }

    if ($password && strlen($password) < 6) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "পাসওয়ার্ড কমপক্ষে 6 অক্ষর হওয়া উচিত",
        ]);
        exit();
    }

    $updates = [];
    $params = [];

    if ($email) {
        $updates[] = "email = ?";
        $params[] = $email;
    }

    if ($role && in_array($role, ["admin", "user"])) {
        $updates[] = "role = ?";
        $params[] = $role;
    }

    if ($password) {
        $updates[] = "password = ?";
        $params[] = password_hash($password, PASSWORD_BCRYPT);
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "আপডেট করার কিছু নেই",
        ]);
        exit();
    }

    $params[] = $userId;
    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "ব্যবহারকারী সফলভাবে আপডেট হয়েছে",
    ]);
} catch (Exception $e) {
    error_log("Update user error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "সার্ভার ত্রুটি"]);
}
