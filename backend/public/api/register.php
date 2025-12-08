<?php
require_once "../../src/config/db.php";

header("Content-Type: application/json");
session_start();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["email"]) || !isset($data["password"])) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit();
}

$email = $data["email"];
$password = $data["password"];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit();
}

if (strlen($password) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters",
    ]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode([
            "success" => false,
            "message" => "User already exists",
        ]);
        exit();
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare(
        "INSERT INTO users (email, password, role) VALUES (?, ?, 'user')",
    );
    $stmt->execute([$email, $hashedPassword]);

    $userId = $pdo->lastInsertId();

    $_SESSION["user_id"] = $userId;
    $_SESSION["user_email"] = $email;
    $_SESSION["user_role"] = "user";

    echo json_encode([
        "success" => true,
        "user" => [
            "email" => $email,
            "role" => "user",
        ],
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage(),
    ]);
}
?>
